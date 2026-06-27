import { adminSupabase } from "./scanIngestionHelper";


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


function timeToMin(hhmmss: string): number {
  const parts = hhmmss.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function isoToScanDate(iso: string): string {
  return iso.split("T")[0];
}

function isoToScanTime(iso: string): string {
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "00:00";
}


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

  const validSessions = sessions.filter((s: any) => {
    const buffer = s.bufferMinutes || 0;
    const from = timeToMin(s.fromTime) - buffer;
    const to = timeToMin(s.toTime) + buffer;
    
    return scanMin >= from && scanMin <= to;
  });

  if (validSessions.length === 0) return [];

  validSessions.sort((a: any, b: any) => {
    const diffA = Math.abs(scanMin - timeToMin(a.fromTime));
    const diffB = Math.abs(scanMin - timeToMin(b.fromTime));
    return diffA - diffB;
  });

  return validSessions;
}


async function verifyStudentEnrollment(
  studentId: number,
  calendarEventId: number,
): Promise<boolean> {
  const { data: eventSections, error: secErr } = await adminSupabase
    .from("calendar_event_section")
    .select("collegeSectionId")
    .eq("calendarEventId", calendarEventId);

  if (secErr || !eventSections || eventSections.length === 0) return false;

  const sectionIds = eventSections.map((s: any) => s.collegeSectionId);

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

    const { data: userData, error: userErr } = await adminSupabase
      .from("users")
      .select("role")
      .eq("userId", userId)
      .maybeSingle();

    if (userErr) throw new Error(userErr.message);
    if (!userData || (userData.role || "").toLowerCase() !== "student") {
      return {
        success: false,
        rejectionReason: "StaffNotEligible",
      };
    }

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

    const { data: lastScanLogs } = await adminSupabase
      .from("device_attendance_logs")
      .select("scanTimestamp")
      .eq("userId", userId)
      .eq("deviceId", deviceId)
      .eq("logType", "classattendance")
      .order("scanTimestamp", { ascending: false })
      .limit(2);

    if (lastScanLogs && lastScanLogs.length > 1) {
      const lastTime = new Date(lastScanLogs[1].scanTimestamp).getTime();
      const currTime = new Date(scanTimestamp).getTime();
      
      if (currTime - lastTime < 60000 && currTime >= lastTime) {
        return { success: true, alreadyMarked: true };
      }
    }

    const sessions = await findActiveClassSessions(deviceId, scanDate, scanTime);

    if (!sessions || sessions.length === 0) {
      return {
        success: false,
        rejectionReason: "NoActiveSession",
      };
    }

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

      const payload = {
        attendanceRecordId: existing.attendanceRecordId,
        studentId,
        calendarEventId,
        status: "PRESENT",
        studentLoginTime: scanMin < existingMin ? scanTime : existing.studentLoginTime,
        markedAt: scanDate,
      };

      try {
        await adminSupabase
          .channel(`public:attendance_record:eventId=${calendarEventId}`)
          .send({ type: "broadcast", event: "new_attendance", payload });

        await adminSupabase
          .channel(`public:attendance_record:admin`)
          .send({ type: "broadcast", event: "new_attendance", payload });
      } catch (broadcastErr) {}

      return {
        success: true,
        alreadyMarked: true,
        attendanceRecordId: existing.attendanceRecordId,
        deviceClassSessionId,
        calendarEventId,
      };
    }

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

    const payload = {
      attendanceRecordId: newRecord.attendanceRecordId,
      studentId,
      calendarEventId,
      status: "PRESENT",
      studentLoginTime: scanTime,
      markedAt: scanDate,
    };

    try {
      await adminSupabase
        .channel(`public:attendance_record:eventId=${calendarEventId}`)
        .send({
          type: "broadcast",
          event: "new_attendance",
          payload,
        });

      await adminSupabase
        .channel(`public:attendance_record:admin`)
        .send({
          type: "broadcast",
          event: "new_attendance",
          payload,
        });
    } catch (broadcastErr) {}

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
