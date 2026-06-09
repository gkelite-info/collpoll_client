import { supabase } from "@/lib/supabaseClient";

const err = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DeviceAttendanceLogRow {
  deviceAttendanceLogId: number;
  deviceId: number;
  userId: number;
  collegeId: number;
  calendarEventId: number | null;
  deviceClassSessionId: number | null;
  attendanceRecordId: number | null;
  gateScanLogId: number | null;
  attendanceDailyId: number | null;
  logType: string;
  authMethod: string;
  scanTimestamp: string;
  processedStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  user?: { fullName: string; role: string } | null;
}

/* ------------------------------------------------------------------ */
/*  GET — paginated                                                    */
/* ------------------------------------------------------------------ */

export const getDeviceAttendanceLogs = async (
  collegeId: number,
  page = 1,
  limit = 10,
  filters?: {
    deviceId?: number;
    userId?: number;
    logType?: string;
    processedStatus?: string;
    fromDate?: string;
    toDate?: string;
  },
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("device_attendance_logs")
      .select(
        "deviceAttendanceLogId, deviceId, userId, collegeId, calendarEventId, deviceClassSessionId, attendanceRecordId, gateScanLogId, attendanceDailyId, logType, authMethod, scanTimestamp, processedStatus, rejectionReason, createdAt",
        { count: "exact" },
      )
      .eq("collegeId", collegeId);

    if (filters?.deviceId) query = query.eq("deviceId", filters.deviceId);
    if (filters?.userId) query = query.eq("userId", filters.userId);
    if (filters?.logType) query = query.eq("logType", filters.logType);
    if (filters?.processedStatus) query = query.eq("processedStatus", filters.processedStatus);
    if (filters?.fromDate) query = query.gte("scanTimestamp", filters.fromDate);
    if (filters?.toDate) query = query.lte("scanTimestamp", filters.toDate);

    const { data, error, count } = await query
      .order("scanTimestamp", { ascending: false })
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) return { success: true as const, data: [], total: 0 };

    // Enrich with user info
    const userIds = [...new Set(data.map((d: any) => d.userId))];
    const { data: users } = await supabase
      .from("users")
      .select("userId, fullName, role")
      .in("userId", userIds);
    const userMap: Record<number, any> = {};
    (users ?? []).forEach((u: any) => { userMap[u.userId] = u; });

    const enriched: DeviceAttendanceLogRow[] = data.map((d: any) => ({
      ...d,
      user: userMap[d.userId] || null,
    }));

    return { success: true as const, data: enriched, total: count ?? 0 };
  } catch (e) {
    return { success: false as const, data: [], total: 0, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  INSERT                                                             */
/* ------------------------------------------------------------------ */

export const createDeviceAttendanceLog = async (payload: {
  deviceId: number;
  userId: number;
  collegeId: number;
  calendarEventId?: number | null;
  deviceClassSessionId?: number | null;
  logType: "ClassAttendance" | "GateEntry" | "GateExit";
  authMethod: string;
  scanTimestamp: string;
}) => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("device_attendance_logs")
      .insert({
        ...payload,
        calendarEventId: payload.calendarEventId || null,
        deviceClassSessionId: payload.deviceClassSessionId || null,
        processedStatus: "Pending",
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw error;
    return { success: true as const, data };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  Process classroom scan → attendance_record                         */
/* ------------------------------------------------------------------ */

export const processClassroomScan = async (payload: {
  deviceId: number;
  userId: number;
  collegeId: number;
  authMethod: string;
  scanTimestamp: string; // ISO
}) => {
  try {
    const now = new Date().toISOString();
    const scanDate = payload.scanTimestamp.split("T")[0];
    const scanTime = new Date(payload.scanTimestamp)
      .toTimeString()
      .slice(0, 5); // HH:MM

    // 1. Find active device_class_session for this device + current time
    const { data: sessions, error: sessErr } = await supabase
      .from("device_class_sessions")
      .select(
        "deviceClassSessionId, calendarEventId, fromTime, toTime, bufferMinutes",
      )
      .eq("deviceId", payload.deviceId)
      .eq("eventDate", scanDate)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (sessErr) throw sessErr;

    // Find the session that covers the scan time (including buffer)
    const activeSession = (sessions ?? []).find((s: any) => {
      const from =
        timeToMin(s.fromTime) - (s.bufferMinutes || 15);
      const to = timeToMin(s.toTime) + (s.bufferMinutes || 15);
      const scan = timeToMin(scanTime);
      return scan >= from && scan <= to;
    });

    if (!activeSession) {
      return {
        success: false as const,
        error: "No active class session found on this device for the current time.",
      };
    }

    // 2. Get studentId from users → students
    const { data: student, error: stuErr } = await supabase
      .from("students")
      .select("studentId")
      .eq("userId", payload.userId)
      .maybeSingle();

    if (stuErr) throw stuErr;
    if (!student) {
      return {
        success: false as const,
        error: "User is not a student. Classroom attendance applies to students only.",
      };
    }

    // 3. Check if attendance_record already exists (duplicate scan guard)
    const { data: existing } = await supabase
      .from("attendance_record")
      .select("attendanceRecordId, status")
      .eq("studentId", student.studentId)
      .eq("calendarEventId", activeSession.calendarEventId)
      .is("deletedAt", null)
      .maybeSingle();

    let attendanceRecordId: number | null = null;

    if (existing) {
      // Already marked — update login time if earlier
      attendanceRecordId = existing.attendanceRecordId;
    } else {
      // 4. Create attendance_record
      const { data: newRecord, error: recErr } = await supabase
        .from("attendance_record")
        .insert({
          studentId: student.studentId,
          calendarEventId: activeSession.calendarEventId,
          status: "Present",
          studentLoginTime: scanTime,
          markedAt: scanDate,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (recErr) throw recErr;
      attendanceRecordId = newRecord.attendanceRecordId;
    }

    // 5. Create device_attendance_log linking everything
    const { data: log, error: logErr } = await supabase
      .from("device_attendance_logs")
      .insert({
        deviceId: payload.deviceId,
        userId: payload.userId,
        collegeId: payload.collegeId,
        calendarEventId: activeSession.calendarEventId,
        deviceClassSessionId: activeSession.deviceClassSessionId,
        attendanceRecordId,
        logType: "ClassAttendance",
        authMethod: payload.authMethod,
        scanTimestamp: payload.scanTimestamp,
        processedStatus: "Accepted",
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (logErr) throw logErr;
    return { success: true as const, data: log, attendanceRecordId };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/** Convert "HH:MM" to minutes from midnight */
function timeToMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
