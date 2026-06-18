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
  scanType: "Entry" | "Exit";
  scanTime: string; // ISO
  scanDate: string; // YYYY-MM-DD
  authMethod: "Fingerprint" | "FaceRecognition" | "Card" | "QRCode";
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

    const excludedRoles = ["super-admin", "student", "parent"];
    const isStaff = !excludedRoles.includes((userData.role || "").toLowerCase());

    // 2. Create gate_scan_logs entry
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

    // 3. Create device_attendance_logs entry
    const logType = payload.scanType === "Entry" ? "GateEntry" : "GateExit";
    const { data: attLog, error: attErr } = await adminSupabase
      .from("device_attendance_logs")
      .insert({
        deviceId: payload.deviceId,
        userId: payload.userId,
        collegeId: payload.collegeId,
        logType,
        authMethod: payload.authMethod,
        scanTimestamp: payload.scanTime,
        processedStatus: "Pending",
        gateScanLogId: scanLog.gateScanLogId,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (attErr) throw attErr;

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
        deviceAttendanceLogId: attLog.deviceAttendanceLogId,
        updatedAt: now,
      })
      .eq("gateScanLogId", scanLog.gateScanLogId);

    // 6. Update device attendance log
    await adminSupabase
      .from("device_attendance_logs")
      .update({
        processedStatus: "Accepted",
        attendanceDailyId,
        updatedAt: now,
      })
      .eq("deviceAttendanceLogId", attLog.deviceAttendanceLogId);

    return { success: true as const, data: scanLog };
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
  const timeMatch = payload.scanTime.match(/T(\d{2}:\d{2})/);
  const scanTimeStr = timeMatch ? timeMatch[1] : "00:00"; // Strict local extraction (HH:MM)

  // Check if attendance_daily record exists for this user + date
  const { data: existing } = await adminSupabase
    .from("attendance_daily")
    .select("attendanceDailyId, checkIn, checkOut")
    .eq("userId", payload.userId)
    .eq("attendanceDate", payload.scanDate)
    .maybeSingle();

  if (existing) {
    const updates: Record<string, unknown> = { updatedAt: now };

    if (payload.scanType === "Entry" && !existing.checkIn) {
      // First entry scan
      updates.checkIn = scanTimeStr;
      const lateBy = Math.max(0, timeToMinutes(scanTimeStr) - timeToMinutes(SHIFT_START) - LATE_THRESHOLD_MIN);
      updates.lateByMinutes = lateBy;
      updates.status = lateBy > 0 ? "Late" : "Present";
    } else if (payload.scanType === "Exit") {
      // Last exit scan (always update)
      updates.checkOut = scanTimeStr;
      if (existing.checkIn) {
        const totalMin = minutesBetween(existing.checkIn, scanTimeStr);
        updates.totalMinutes = totalMin;
        const earlyOut = Math.max(0, timeToMinutes(SHIFT_END) - timeToMinutes(scanTimeStr));
        updates.earlyOutMinutes = earlyOut;
        // Determine status
        const shiftDuration = minutesBetween(SHIFT_START, SHIFT_END);
        if (totalMin < shiftDuration / 2) {
          updates.status = "HalfDay";
        }
      }
    }

    if (Object.keys(updates).length > 1) {
      await adminSupabase
        .from("attendance_daily")
        .update(updates)
        .eq("attendanceDailyId", existing.attendanceDailyId);
    }

    return existing.attendanceDailyId;
  }

  // Create new attendance_daily record
  const isEntry = payload.scanType === "Entry";
  const lateBy = isEntry
    ? Math.max(0, timeToMinutes(scanTimeStr) - timeToMinutes(SHIFT_START) - LATE_THRESHOLD_MIN)
    : 0;

  const { data: newRecord, error: insErr } = await adminSupabase
    .from("attendance_daily")
    .insert({
      userId: payload.userId,
      attendanceDate: payload.scanDate,
      checkIn: isEntry ? scanTimeStr : null,
      checkOut: !isEntry ? scanTimeStr : null,
      totalMinutes: 0,
      status: isEntry ? (lateBy > 0 ? "Late" : "Present") : "Present",
      lateByMinutes: lateBy,
      earlyOutMinutes: 0,
      isManual: false,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (insErr) throw insErr;
  return newRecord?.attendanceDailyId ?? null;
}
