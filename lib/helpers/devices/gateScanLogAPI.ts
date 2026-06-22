import { supabase } from "@/lib/supabaseClient";
import { adminSupabase } from "@/lib/helpers/devices/scanIngestionHelper";

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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GateScanPayload {
  userId: number;
  collegeId: number;
  deviceId: number;
  scanType: "Entry" | "Exit" | "Standalone";
  scanTime: string; // ISO
  scanDate: string; // YYYY-MM-DD
  authMethod: "Fingerprint" | "FaceRecognition" | "Card" | "QRCode";
  deviceAttendanceLogId?: number;
}

export interface GateScanRow {
  gateScanLogId: number;
  userId: number;
  collegeId: number;
  deviceId: number;
  attendanceDailyId: number | null;
  scanType: "Entry" | "Exit";
  scanTime: string;
  scanDate: string;
  authMethod: string;
  isProcessed: boolean;
  createdAt: string;
  user?: { fullName: string; role: string } | null;
}

/* ------------------------------------------------------------------ */
/*  Default shift config                                               */
/* ------------------------------------------------------------------ */

const SHIFT_START = "09:00";
const SHIFT_END = "17:00";
const LATE_THRESHOLD_MIN = 15; // Grace period

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesBetween(t1: string, t2: string): number {
  return Math.abs(timeToMinutes(t2) - timeToMinutes(t1));
}

/* ------------------------------------------------------------------ */
/*  GET — paginated                                                    */
/* ------------------------------------------------------------------ */

export const getGateScanLogs = async (
  collegeId: number,
  page = 1,
  limit = 10,
  filters?: { scanDate?: string; userId?: number; deviceId?: number; scanType?: string },
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("gate_scan_logs")
      .select(
        "gateScanLogId, userId, collegeId, deviceId, attendanceDailyId, scanType, scanTime, scanDate, authMethod, isProcessed, createdAt",
        { count: "exact" },
      )
      .eq("collegeId", collegeId);

    if (filters?.scanDate) query = query.eq("scanDate", filters.scanDate);
    if (filters?.userId) query = query.eq("userId", filters.userId);
    if (filters?.deviceId) query = query.eq("deviceId", filters.deviceId);
    if (filters?.scanType) query = query.eq("scanType", filters.scanType);

    const { data, error, count } = await query
      .order("scanTime", { ascending: false })
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

    const enriched: GateScanRow[] = data.map((d: any) => ({
      ...d,
      user: userMap[d.userId] || null,
    }));

    return { success: true as const, data: enriched, total: count ?? 0 };
  } catch (e) {
    return { success: false as const, data: [], total: 0, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  Process gate scan                                                  */
/* ------------------------------------------------------------------ */

export const processGateScan = async (payload: GateScanPayload) => {
  try {
    const now = new Date().toISOString();

    // 1. Determine if user is staff (non-Student role)
    const { data: userData, error: userErr } = await adminSupabase
      .from("users")
      .select("userId, role")
      .eq("userId", payload.userId)
      .single();
    if (userErr) throw userErr;

    const excludedRoles = ["superadmin", "student", "parent"];
    const normalizedRole = (userData.role || "").toLowerCase().replace(/[-_\s]/g, "");
    const isStaff = !excludedRoles.includes(normalizedRole);

    // 2. Resolve Standalone scanType & 60-second Debounce
    let resolvedScanType: "Entry" | "Exit" = payload.scanType === "Exit" ? "Exit" : "Entry";

    const { data: lastScan } = await adminSupabase
      .from("gate_scan_logs")
      .select("scanType, scanTime")
      .eq("userId", payload.userId)
      .eq("scanDate", payload.scanDate)
      .order("scanTime", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastScan) {
      const lastTime = new Date(lastScan.scanTime).getTime();
      const currTime = new Date(payload.scanTime).getTime();
      
      // If the scan is within 60 seconds of the last gate scan for this user, 
      // swallow it to prevent accidental double-scans and erroneous toggles.
      if (currTime - lastTime < 60000 && currTime >= lastTime) {
        return { success: true as const, data: null };
      }
    }

    if (payload.scanType === "Standalone") {
      resolvedScanType = lastScan?.scanType === "Entry" ? "Exit" : "Entry";
    }
    
    // Mutate payload so downstream logic uses explicit Entry/Exit
    payload.scanType = resolvedScanType;

    // 3. Create gate_scan_logs entry
    const { data: scanLog, error: scanErr } = await adminSupabase
      .from("gate_scan_logs")
      .insert({
        userId: payload.userId,
        collegeId: payload.collegeId,
        deviceId: payload.deviceId,
        scanType: payload.scanType,
        scanTime: payload.scanTime,
        scanDate: payload.scanDate,
        authMethod: payload.authMethod,
        isProcessed: false,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (scanErr) throw scanErr;

    // 4. For staff: process attendance_daily
    let attendanceDailyId: number | null = null;
    if (isStaff) {
      attendanceDailyId = await processStaffAttendance(payload, scanLog.gateScanLogId);

      // Broadcast HR realtime update
      try {
        await adminSupabase
          .channel(`public:attendance_daily:hr`)
          .send({
            type: "broadcast",
            event: "new_daily_attendance",
            payload: {
              userId: payload.userId,
              attendanceDate: payload.scanDate,
              scanType: payload.scanType,
              scanTime: payload.scanTime,
            },
          });
      } catch (broadcastErr) {
      }
    }

    // 5. Update scan log with processed status
    await adminSupabase
      .from("gate_scan_logs")
      .update({
        isProcessed: true,
        attendanceDailyId,
        deviceAttendanceLogId: payload.deviceAttendanceLogId ?? null,
        updatedAt: now,
      })
      .eq("gateScanLogId", scanLog.gateScanLogId);

    return { success: true as const, data: { ...scanLog, attendanceDailyId } };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  Staff attendance processing                                        */
/* ------------------------------------------------------------------ */

async function processStaffAttendance(
  payload: GateScanPayload,
  _gateScanLogId: number,
): Promise<number | null> {
  const now = new Date().toISOString();

  // 1. Fetch all gate scans for this user today, ordered chronologically
  const { data: allScans, error: scansErr } = await adminSupabase
    .from("gate_scan_logs")
    .select("scanType, scanTime")
    .eq("userId", payload.userId)
    .eq("scanDate", payload.scanDate)
    .order("scanTime", { ascending: true });

  if (scansErr) throw scansErr;

  const scans = allScans || [];
  if (scans.length === 0) return null;

  // 2. Compute exact minutes and find bounds
  let totalMinutes = 0;
  let inTimeStr: string | null = null;
  let firstCheckInStr: string | null = null;
  let lastCheckOutStr: string | null = null;

  for (const scan of scans) {
    let timeStr = "00:00";
    const st = scan.scanTime;
    
    // Check if timezone info is explicitly present.
    // If missing, JS Date assumes UTC in Node and local in browser. To be safe, extract exactly what the device sent.
    if (!st.includes("Z") && !st.match(/[+-]\d{2}:\d{2}$/)) {
      const match = st.match(/T(\d{2}:\d{2})/);
      if (match) timeStr = match[1];
    } else {
      try {
        timeStr = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(st));
      } catch {
        const match = st.match(/T(\d{2}:\d{2})/);
        if (match) timeStr = match[1];
      }
    }

    if (scan.scanType === "Entry") {
      if (!firstCheckInStr) firstCheckInStr = timeStr;
      if (!inTimeStr) inTimeStr = timeStr; // Start a new work segment if not already in one
    } else if (scan.scanType === "Exit") {
      lastCheckOutStr = timeStr; // Always update to latest exit
      if (inTimeStr) {
        totalMinutes += minutesBetween(inTimeStr, timeStr);
        inTimeStr = null; // Close the segment
      }
    }
  }

  // 3. Calculate delays and status
  let lateBy = 0;
  let earlyOut = 0;
  let status = "Present";

  if (firstCheckInStr) {
    lateBy = Math.max(0, timeToMinutes(firstCheckInStr) - timeToMinutes(SHIFT_START) - LATE_THRESHOLD_MIN);
    if (lateBy > 0) status = "Late";
  }

  if (lastCheckOutStr) {
    earlyOut = Math.max(0, timeToMinutes(SHIFT_END) - timeToMinutes(lastCheckOutStr));
  }

  // Re-evaluate status based on total accumulated hours
  const shiftDuration = minutesBetween(SHIFT_START, SHIFT_END);
  if (totalMinutes > 0 && totalMinutes < shiftDuration / 2) {
    status = "HalfDay";
  } else if (totalMinutes === 0 && !firstCheckInStr) {
    status = "Absent";
  }

  // 4. Update or Insert into attendance_daily
  const { data: existing } = await adminSupabase
    .from("attendance_daily")
    .select("attendanceDailyId")
    .eq("userId", payload.userId)
    .eq("attendanceDate", payload.scanDate)
    .maybeSingle();

  if (existing) {
    const { error: updErr } = await adminSupabase
      .from("attendance_daily")
      .update({
        checkIn: firstCheckInStr,
        checkOut: lastCheckOutStr,
        totalMinutes,
        lateByMinutes: lateBy,
        earlyOutMinutes: earlyOut,
        status,
        updatedAt: now,
      })
      .eq("attendanceDailyId", existing.attendanceDailyId);

    if (updErr) throw updErr;
    return existing.attendanceDailyId;
  }

  const { data: newRecord, error: insErr } = await adminSupabase
    .from("attendance_daily")
    .insert({
      userId: payload.userId,
      attendanceDate: payload.scanDate,
      checkIn: firstCheckInStr,
      checkOut: lastCheckOutStr,
      totalMinutes,
      status,
      lateByMinutes: lateBy,
      earlyOutMinutes: earlyOut,
      isManual: false,
      createdAt: now,
      updatedAt: now,
    })
    .select("attendanceDailyId")
    .single();

  if (insErr) throw insErr;
  return newRecord?.attendanceDailyId ?? null;
}
