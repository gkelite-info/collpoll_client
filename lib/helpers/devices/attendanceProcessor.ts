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
  // Returns HH:MM from an ISO timestamp
  return new Date(iso).toTimeString().slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  findActiveClassSession                                              */
/*  Finds a device_class_session active at the time of scan.           */
/* ------------------------------------------------------------------ */

async function findActiveClassSession(
  deviceId: number,
  scanDate: string,
  scanTime: string,
): Promise<{
  deviceClassSessionId: number;
  calendarEventId: number;
  fromTime: string;
  toTime: string;
  bufferMinutes: number;
} | null> {
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
  if (!sessions || sessions.length === 0) return null;

  const scanMin = timeToMin(scanTime);

  // 1. Filter sessions where the scan time falls strictly within the [fromTime, toTime] window.
  // The user requested NO buffer time.
  const validSessions = sessions.filter((s: any) => {
    const from = timeToMin(s.fromTime);
    const to = timeToMin(s.toTime);
    
    // Strict window, no buffer allowed
    return scanMin >= from && scanMin <= to;
  });

  if (validSessions.length === 0) return null;

  // 2. Resolve Overlaps (SaaS Level Edge Case Handling)
  // If a student taps in during the overlapping boundary of two consecutive classes
  // (e.g., 09:55 for classes 09:00-10:00 and 10:00-11:00), we must avoid marking
  // the previous class present when they are actually arriving for the next class.
  // Solution: Pick the session whose start time (fromTime) is closest to the scan time.
  validSessions.sort((a: any, b: any) => {
    const diffA = Math.abs(scanMin - timeToMin(a.fromTime));
    const diffB = Math.abs(scanMin - timeToMin(b.fromTime));
    return diffA - diffB;
  });

  // Return the best matching session
  return validSessions[0];
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

    // 2. Find active class session for this device + time
    const session = await findActiveClassSession(deviceId, scanDate, scanTime);

    if (!session) {
      return {
        success: false,
        rejectionReason: "NoActiveSession",
      };
    }

    const { deviceClassSessionId, calendarEventId } = session;

    // 3. Get studentId from students table (via userId)
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

    // 4. Verify student is enrolled in this class's sections
    const isEnrolled = await verifyStudentEnrollment(studentId, calendarEventId);
    if (!isEnrolled) {
      return {
        success: false,
        rejectionReason: "StudentNotEnrolledInClass",
      };
    }

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

    return {
      success: true,
      attendanceRecordId: newRecord.attendanceRecordId,
      deviceClassSessionId,
      calendarEventId,
    };
  } catch (err) {
    console.error("[processClassroomAttendance]", err);
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
