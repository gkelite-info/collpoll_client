import { supabase } from "@/lib/supabaseClient";

const err = (e: unknown) => {
  if (e instanceof Error) {
    const msg = e.message;
    if (msg.includes("duplicate key value violates unique constraint")) {
      return "This record already exists.";
    }
    if (msg.includes("violates foreign key constraint")) {
      return "Invalid reference provided.";
    }
    return msg;
  }
  return "Something went wrong. Please try again.";
};


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
  user?: { fullName: string; role: string; financeManagerType?: string; educationType?: string } | null;
  device?: { deviceName: string } | null;
  checkIn?: string | null;
  checkOut?: string | null;
}


export const getDeviceAttendanceLogs = async (
  collegeId: number,
  page = 1,
  limit = 10,
  filters?: {
    deviceId?: number;
    userId?: number;
    logTypes?: string[];
    processedStatus?: string;
    fromDate?: string;
    toDate?: string;
    searchQuery?: string;
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
      .eq("collegeId", collegeId)
      .or('rejectionReason.is.null,rejectionReason.not.in.(RateLimited,DuplicateScan)');

    if (filters?.deviceId) query = query.eq("deviceId", filters.deviceId);
    if (filters?.userId) query = query.eq("userId", filters.userId);
    if (filters?.logTypes && filters.logTypes.length > 0) query = query.in("logType", filters.logTypes);
    if (filters?.processedStatus) query = query.eq("processedStatus", filters.processedStatus);
    if (filters?.fromDate) query = query.gte("scanTimestamp", filters.fromDate);
    if (filters?.toDate) query = query.lte("scanTimestamp", filters.toDate);

    if (filters?.searchQuery) {
      const { data: usersMatch } = await supabase
        .from("users")
        .select("userId")
        .eq("collegeId", collegeId)
        .ilike("fullName", `%${filters.searchQuery}%`);
      
      if (!usersMatch || usersMatch.length === 0) {
        return { success: true as const, data: [], total: 0 };
      }
      const matchingUserIds = usersMatch.map(u => u.userId);
      query = query.in("userId", matchingUserIds);
    }

    const { data, error, count } = await query
      .order("scanTimestamp", { ascending: false })
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) return { success: true as const, data: [], total: 0 };

    const userIds = [...new Set(data.map((d: any) => d.userId))];
    const { data: users } = await supabase
      .from("users")
      .select("userId, fullName, role")
      .in("userId", userIds);
    const userMap: Record<number, any> = {};
    (users ?? []).forEach((u: any) => { userMap[u.userId] = u; });

    const financeUserIds = (users ?? []).filter((u: any) => u.role === "Finance").map((u: any) => u.userId);
    if (financeUserIds.length > 0) {
      const { data: financeData } = await supabase
        .from("finance_manager")
        .select("userId, type")
        .in("userId", financeUserIds);
      if (financeData) {
        financeData.forEach((f: any) => {
          if (userMap[f.userId]) {
            userMap[f.userId].financeManagerType = f.type;
          }
        });
      }
    }

    const studentUserIds = (users ?? []).filter((u: any) => u.role === "Student").map((u: any) => u.userId);
    if (studentUserIds.length > 0) {
      const { data: studentData } = await supabase
        .from("students")
        .select(`
          userId,
          college_education:collegeEducationId ( collegeEducationType )
        `)
        .in("userId", studentUserIds);
      if (studentData) {
        studentData.forEach((s: any) => {
          if (userMap[s.userId]) {
            const eduRelation = s.college_education;
            const eduType = Array.isArray(eduRelation) ? eduRelation[0]?.collegeEducationType : (eduRelation as any)?.collegeEducationType;
            userMap[s.userId].educationType = eduType;
          }
        });
      }
    }

    const deviceIds = [...new Set(data.map((d: any) => d.deviceId))];
    const { data: devices } = await supabase
      .from("biometric_devices")
      .select("deviceId, deviceName")
      .in("deviceId", deviceIds);
    const deviceMap: Record<number, any> = {};
    (devices ?? []).forEach((d: any) => { deviceMap[d.deviceId] = d; });

    const attendanceDailyIds = [...new Set(data.map((d: any) => d.attendanceDailyId).filter(Boolean))];
    const { data: attendanceDailies } = attendanceDailyIds.length > 0 
      ? await supabase.from("attendance_daily").select("attendanceDailyId, checkIn, checkOut").in("attendanceDailyId", attendanceDailyIds)
      : { data: [] };
    const attendanceDailyMap: Record<number, any> = {};
    (attendanceDailies ?? []).forEach((a: any) => { attendanceDailyMap[a.attendanceDailyId] = a; });

    const studentLogs = data.filter((d: any) => d.gateScanLogId && !d.attendanceDailyId);
    const gateStudentUserIds = [...new Set(studentLogs.map((d: any) => d.userId))];
    const studentDates = [...new Set(studentLogs.map((d: any) => d.scanTimestamp.split("T")[0]))];
    const { data: studentGateLogs } = gateStudentUserIds.length > 0 && studentDates.length > 0
      ? await supabase
          .from("gate_scan_logs")
          .select("userId, scanDate, scanType, scanTime")
          .in("userId", gateStudentUserIds)
          .in("scanDate", studentDates)
          .order("scanTime", { ascending: true })
      : { data: [] };
    
    const studentGateMap: Record<string, { checkIn: string | null; checkOut: string | null }> = {};
    (studentGateLogs ?? []).forEach((g: any) => {
      const key = `${g.userId}_${g.scanDate}`;
      if (!studentGateMap[key]) studentGateMap[key] = { checkIn: null, checkOut: null };

      let timeStr = "00:00";
      const st = g.scanTime;
      if (!st.includes("Z") && !st.match(/[+-]\d{2}:\d{2}$/)) {
        const match = st.match(/T(\d{2}:\d{2})/);
        if (match) timeStr = match[1];
      } else {
        try {
          timeStr = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(st));
        } catch {
          const match = st.match(/T(\d{2}:\d{2})/);
          if (match) timeStr = match[1];
        }
      }

      if (g.scanType === "Entry" && !studentGateMap[key].checkIn) {
        studentGateMap[key].checkIn = timeStr;
      } else if (g.scanType === "Exit") {
        studentGateMap[key].checkOut = timeStr;
      }
    });

    const gateScanLogIds = [...new Set(data.map((d: any) => d.gateScanLogId).filter(Boolean))];
    const { data: exactGateLogs } = gateScanLogIds.length > 0
      ? await supabase.from("gate_scan_logs").select("gateScanLogId, scanType").in("gateScanLogId", gateScanLogIds)
      : { data: [] };
    const exactGateMap: Record<number, string> = {};
    (exactGateLogs ?? []).forEach((g: any) => { exactGateMap[g.gateScanLogId] = g.scanType; });

    const enriched: DeviceAttendanceLogRow[] = data.map((d: any) => {
      let checkIn = null;
      let checkOut = null;
      let actualLogType = d.logType;

      if (d.attendanceDailyId) {
        const ad = attendanceDailyMap[d.attendanceDailyId];
        if (ad) {
          checkIn = ad.checkIn;
          checkOut = ad.checkOut;

          try {
            const scanDateObj = new Date(d.scanTimestamp);
            const scanHHMM = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(scanDateObj);
            const scanTimeStr = d.scanTimestamp.split("T")[1]?.slice(0, 5);
            
            if (ad.checkIn && (ad.checkIn.startsWith(scanTimeStr) || ad.checkIn === scanHHMM)) {
              actualLogType = "GateEntry";
            } else if (ad.checkOut && (ad.checkOut.startsWith(scanTimeStr) || ad.checkOut === scanHHMM)) {
              actualLogType = "GateExit";
            }
          } catch (e) {}
        }
      } else if (d.gateScanLogId) {
        const dateStr = d.scanTimestamp.split("T")[0];
        const key = `${d.userId}_${dateStr}`;
        const sg = studentGateMap[key];
        if (sg) {
          checkIn = sg.checkIn;
          checkOut = sg.checkOut;
        }

        if (exactGateMap[d.gateScanLogId]) {
          actualLogType = exactGateMap[d.gateScanLogId] === "Entry" ? "GateEntry" : "GateExit";
        }
      }

      return {
        ...d,
        logType: actualLogType,
        user: userMap[d.userId] || null,
        device: deviceMap[d.deviceId] || null,
        checkIn,
        checkOut,
      };
    });

    return { success: true as const, data: enriched, total: count ?? 0 };
  } catch (e) {
    return { success: false as const, data: [], total: 0, error: err(e) };
  }
};


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

    const { data: existing } = await supabase
      .from("attendance_record")
      .select("attendanceRecordId, status, deletedAt")
      .eq("studentId", student.studentId)
      .eq("calendarEventId", activeSession.calendarEventId)
      .maybeSingle();

    let attendanceRecordId: number | null = null;

    if (existing) {
      attendanceRecordId = existing.attendanceRecordId;
      
      if (existing.deletedAt !== null) {
        await supabase
          .from("attendance_record")
          .update({
            deletedAt: null,
            status: "PRESENT",
            studentLoginTime: scanTime,
            updatedAt: new Date().toISOString()
          })
          .eq("attendanceRecordId", attendanceRecordId);
      }
    } else {
      const { data: newRecord, error: recErr } = await supabase
        .from("attendance_record")
        .insert({
          studentId: student.studentId,
          calendarEventId: activeSession.calendarEventId,
          status: "PRESENT",
          studentLoginTime: scanTime,
          markedAt: scanDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select("attendanceRecordId")
        .single();

      if (recErr) throw recErr;
      attendanceRecordId = newRecord.attendanceRecordId;
    }

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

function timeToMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
