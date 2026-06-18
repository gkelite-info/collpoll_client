import { adminSupabase } from "./scanIngestionHelper";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type ProcessRejectionReason =
  | "NoActiveSession"
  | "OutsideSessionWindow"
  | "StaffNotEligible"
  | "StudentRecordNotFound"
  | "StudentNotEnrolledInClass"
  | "AlreadyMarked"
  | "DBError";

export interface ProcessResult {
  success: boolean;
  alreadyMarked?: boolean;
  attendanceRecordId?: number;
  deviceClassSessionId?: number;
  calendarEventId?: number;
  rejectionReason?: ProcessRejectionReason;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function timeToMin(hhmmss: string): number {
  const parts = hhmmss.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function isoToScanDate(iso: string): string {
  // Returns YYYY-MM-DD in UTC
  return iso.split("T")[0];
}

function isoToScanTime(iso: string): string {
  // Returns exactly HH:MM extracted from the device's provided string to ignore server timezone
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "00:00";
}

/* ------------------------------------------------------------------ */
/*  findActiveClassSessions                                             */
/*  Finds all device_class_sessions active at the time of scan.         */
/* ------------------------------------------------------------------ */

async function findActiveClassSessions(
  deviceId: number,
  scanDate: string,
  scanTime: string,
): Promise<Array<{
  deviceClassSessionId: number;
  calendarEventId: number;
  fromTime: string;
  toTime: string;
  bufferMinutes: number;
}>> {
  const { data: sessions, error } = await adminSupabase
    .from("device_class_sessions")
    .select(
      "deviceClassSessionId, calendarEventId, fromTime, toTime, bufferMinutes",
    )
    .eq("deviceId", deviceId)
    .eq("eventDate", scanDate)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw new Error(`Session query failed: ${error.message}`);
  if (!sessions || sessions.length === 0) return [];

  const scanMin = timeToMin(scanTime);

  // 1. Filter sessions where the scan time falls strictly within the [fromTime, toTime] window.
  // The user requested NO buffer time.
  const validSessions = sessions.filter((s: any) => {
    const from = timeToMin(s.fromTime);
    const to = timeToMin(s.toTime);
    
    // Strict window, no buffer allowed
    return scanMin >= from && scanMin <= to;
  });

  if (validSessions.length === 0) return [];

  // 2. Sort overlaps to prioritize the class starting closest to the scan time
  validSessions.sort((a: any, b: any) => {
    const diffA = Math.abs(scanMin - timeToMin(a.fromTime));
    const diffB = Math.abs(scanMin - timeToMin(b.fromTime));
    return diffA - diffB;
  });

  return validSessions;
}

/* ------------------------------------------------------------------ */
/*  verifyStudentEnrollment                                             */
/*  Confirms the student is enrolled in the class section.             */
/* ------------------------------------------------------------------ */

async function verifyStudentEnrollment(
  studentId: number,
  calendarEventId: number,
): Promise<boolean> {
  // Get sections linked to this calendar event
  const { data: eventSections, error: secErr } = await adminSupabase
    .from("calendar_event_section")
    .select("collegeSectionId")
    .eq("calendarEventId", calendarEventId);

  if (secErr || !eventSections || eventSections.length === 0) return false;

  const sectionIds = eventSections.map((s: any) => s.collegeSectionId);

  // Check student_academic_history for current enrollment in one of these sections
  const { data: history, error: histErr } = await adminSupabase
    .from("student_academic_history")
    .select("studentId")
    .eq("studentId", studentId)
    .in("collegeSectionsId", sectionIds)
    .eq("isCurrent", true)
    .maybeSingle();

  if (histErr) return false;
  return !!history;
}

/* ------------------------------------------------------------------ */
/*  processClassroomAttendance                                          */
/*  Main Phase 3 function: scan → attendance_record.                   */
/*  All edge cases handled, fully idempotent via ON CONFLICT.          */
/* ------------------------------------------------------------------ */

export async function processClassroomAttendance(params: {
  deviceId: number;
  userId: number;
  collegeId: number;
  authMethod: string;
  scanTimestamp: string;
  deviceAttendanceLogId: number;
}): Promise<ProcessResult> {
  const { deviceId, userId, scanTimestamp, deviceAttendanceLogId } = params;

  try {
    const scanDate = isoToScanDate(scanTimestamp);
    const scanTime = isoToScanTime(scanTimestamp);

    // 1. Verify this user is a Student (not staff — staff use gate devices)
    const { data: userData, error: userErr } = await adminSupabase
      .from("users")
      .select("role")
      .eq("userId", userId)
      .maybeSingle();

    if (userErr) throw new Error(userErr.message);
    if (!userData || userData.role !== "Student") {
      return {
        success: false,
        rejectionReason: "StaffNotEligible",
      };
    }

    // 2. Get studentId from students table (via userId)
    const { data: student, error: stuErr } = await adminSupabase
      .from("students")
      .select("studentId")
      .eq("userId", userId)
      .maybeSingle();

    if (stuErr) throw new Error(stuErr.message);
    if (!student) {
      return {
        success: false,
        rejectionReason: "StudentRecordNotFound",
      };
    }
    const { studentId } = student;

    // 3. Find active class sessions for this device + time
    const sessions = await findActiveClassSessions(deviceId, scanDate, scanTime);

    if (!sessions || sessions.length === 0) {
      return {
        success: false,
        rejectionReason: "NoActiveSession",
      };
    }

    // 4. Verify student is enrolled in one of the active matching classes
    let matchedSession = null;
    for (const session of sessions) {
      const isEnrolled = await verifyStudentEnrollment(studentId, session.calendarEventId);
      if (isEnrolled) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      return {
        success: false,
        rejectionReason: "StudentNotEnrolledInClass",
      };
    }

    const { deviceClassSessionId, calendarEventId } = matchedSession;

    // 5. Check for existing attendance_record (idempotency)
    const { data: existing, error: existErr } = await adminSupabase
      .from("attendance_record")
      .select("attendanceRecordId, studentLoginTime")
      .eq("studentId", studentId)
      .eq("calendarEventId", calendarEventId)
      .is("deletedAt", null)
      .maybeSingle();

    if (existErr) throw new Error(existErr.message);

    const now = new Date().toISOString();

    if (existing) {
      // Already marked — optionally update loginTime if this scan is earlier
      const existingMin = existing.studentLoginTime
        ? timeToMin(existing.studentLoginTime)
        : Infinity;
      const scanMin = timeToMin(scanTime);

      if (scanMin < existingMin) {
        await adminSupabase
          .from("attendance_record")
          .update({ studentLoginTime: scanTime, updatedAt: now })
          .eq("attendanceRecordId", existing.attendanceRecordId);
      }

      return {
        success: true,
        alreadyMarked: true,
        attendanceRecordId: existing.attendanceRecordId,
        deviceClassSessionId,
        calendarEventId,
      };
    }

    // 6. Insert attendance_record (ON CONFLICT: studentId + calendarEventId)
    const { data: newRecord, error: insertErr } = await adminSupabase
      .from("attendance_record")
      .upsert(
        {
          studentId,
          calendarEventId,
          status: "PRESENT",
          studentLoginTime: scanTime,
          markedAt: scanDate,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "studentId,calendarEventId", ignoreDuplicates: false },
      )
      .select("attendanceRecordId")
      .single();

    if (insertErr) throw new Error(insertErr.message);

    // 7. Broadcast realtime update
    const payload = {
      attendanceRecordId: newRecord.attendanceRecordId,
      studentId,
      calendarEventId,
      status: "PRESENT",
      studentLoginTime: scanTime,
      markedAt: scanDate,
    };

    try {
      // Broadcast to specific class channel (for faculty)
      await adminSupabase
        .channel(`public:attendance_record:eventId=${calendarEventId}`)
        .send({
          type: "broadcast",
          event: "new_attendance",
          payload,
        });

      // Broadcast to global admin channel
      await adminSupabase
        .channel(`public:attendance_record:admin`)
        .send({
          type: "broadcast",
          event: "new_attendance",
          payload,
        });
    } catch (broadcastErr) {
    }

    return {
      success: true,
      attendanceRecordId: newRecord.attendanceRecordId,
      deviceClassSessionId,
      calendarEventId,
    };
  } catch (err) {
    return {
      success: false,
      rejectionReason: "DBError",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  getDeviceClassSessionStatus                                         */
/*  Returns whether a device currently has an active class session.    */
/*  Used by admin dashboard to show device live status.                */
/* ------------------------------------------------------------------ */

export async function getDeviceClassSessionStatus(deviceId: number): Promise<{
  isActive: boolean;
  calendarEventId?: number;
  fromTime?: string;
  toTime?: string;
}> {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await adminSupabase
    .from("device_class_sessions")
    .select("deviceClassSessionId, calendarEventId, fromTime, toTime, isActive")
    .eq("deviceId", deviceId)
    .eq("eventDate", today)
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle();

  if (!data) return { isActive: false };

  return {
    isActive: true,
    calendarEventId: data.calendarEventId,
    fromTime: data.fromTime,
    toTime: data.toTime,
  };
}
