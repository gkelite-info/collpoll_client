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


import { getShiftTimings, calculateEffectiveShiftMinutes, parseTimeToMins as helperParseTime } from "./shiftTimingsHelper";
import { getStaffPolicy } from "../Hr/attendance/staffPolicyAPI";

// Removed hardcoded SHIFT_START, SHIFT_END, LATE_THRESHOLD_MIN

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const str = timeStr.trim().toLowerCase();
  const isPM = str.includes("pm");
  const isAM = str.includes("am");
  const parts = str.replace(/(am|pm)/g, "").trim().split(":");
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

function minutesBetween(t1: string, t2: string): number {
  return Math.abs(timeToMinutes(t2) - timeToMinutes(t1));
}


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


export const processGateScan = async (payload: GateScanPayload) => {
  try {
    const now = new Date().toISOString();

    const { data: userData, error: userErr } = await adminSupabase
      .from("users")
      .select("userId, role")
      .eq("userId", payload.userId)
      .single();
    if (userErr) throw userErr;

    const excludedRoles = ["superadmin", "student", "parent"];
    const normalizedRole = (userData.role || "").toLowerCase().replace(/[-_\s]/g, "");
    const isStaff = !excludedRoles.includes(normalizedRole);

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
      
      if (currTime - lastTime < 20000 && currTime >= lastTime) {
        return { success: true as const, data: null };
      }
    }

    if (payload.scanType === "Standalone") {
      resolvedScanType = lastScan?.scanType === "Entry" ? "Exit" : "Entry";
    }
    
    payload.scanType = resolvedScanType;

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

    let attendanceDailyId: number | null = null;
    if (isStaff) {
      attendanceDailyId = await processStaffAttendance(payload, scanLog.gateScanLogId);

      try {
        await adminSupabase
          .channel(`public:attendance_daily:hr`)
          .send({
            type: "broadcast",
            event: "new_daily_attendance",
            payload: {
              userId: payload.userId,
              collegeId: payload.collegeId,
              attendanceDate: payload.scanDate,
              scanType: payload.scanType,
              scanTime: payload.scanTime,
            },
          });
      } catch (broadcastErr) {
      }
    }

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


async function processStaffAttendance(
  payload: GateScanPayload,
  _gateScanLogId: number,
): Promise<number | null> {
  const now = new Date().toISOString();

  const { data: allScans, error: scansErr } = await adminSupabase
    .from("gate_scan_logs")
    .select("scanType, scanTime")
    .eq("userId", payload.userId)
    .eq("scanDate", payload.scanDate)
    .order("scanTime", { ascending: true });

  if (scansErr) throw scansErr;

  const scans = allScans || [];
  if (scans.length === 0) return null;

  let totalMinutes = 0;
  let inTimeStr: string | null = null;
  let firstCheckInStr: string | null = null;
  let lastCheckOutStr: string | null = null;

  for (const scan of scans) {
    let timeStr = "00:00";
    const st = scan.scanTime;
    
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

  // Edge Case: Open segment (Entry without Exit yet — staff is still inside campus)
  // Close the open segment with the latest scan time for realtime accuracy.
  // The EOD cron will finalize with the actual closing time.
  if (inTimeStr) {
    const latestScanTime = scans[scans.length - 1]?.scanTime;
    if (latestScanTime) {
      let nowTimeStr = "00:00";
      try {
        nowTimeStr = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(payload.scanTime));
      } catch {
        const match = latestScanTime.match(/T(\d{2}:\d{2})/);
        if (match) nowTimeStr = match[1];
      }
      totalMinutes += minutesBetween(inTimeStr, nowTimeStr);
    }
    // Do NOT set inTimeStr = null — we want the system to know the segment is still open
  }

  // Fetch dynamic policy and timings
  const policyRes = await getStaffPolicy(payload.collegeId);
  const policy = policyRes?.success && policyRes.data ? policyRes.data : {
    graceMinutes: 15,
    halfDayMinPercent: 50,
    fullDayMinPercent: 75,
    earlyOutThresholdMin: 30
  };

  const timing = await getShiftTimings(payload.collegeId, payload.scanDate);
  const shiftStartStr = timing?.isOpen && timing.openAt ? timing.openAt : "09:00";
  const shiftEndStr = timing?.isOpen && timing.closeAt ? timing.closeAt : "17:00";
  
  const effectiveShiftMins = timing?.isOpen 
    ? calculateEffectiveShiftMinutes(timing) 
    : minutesBetween("09:00", "17:00");

  let lateBy = 0;
  let earlyOut = 0;
  let status = "Present";

  if (timing && !timing.isOpen) {
    // Edge Case: SaaS Standard for Weekend/Holiday Scans
    // If the college is closed but they scanned in, mark them as Present on a closed day.
    // No late, early out, or threshold deductions apply.
    status = "Present (Weekly Off/Holiday)";
  } else {
    // Standard Working Day Calculations
    if (firstCheckInStr) {
      lateBy = Math.max(0, timeToMinutes(firstCheckInStr) - timeToMinutes(shiftStartStr) - policy.graceMinutes);
      if (lateBy > 0) status = "Late";
    }

    if (lastCheckOutStr) {
      // Allow them to leave exactly on the dot without triggering early out.
      earlyOut = Math.max(0, timeToMinutes(shiftEndStr) - timeToMinutes(lastCheckOutStr));
      // Only penalize if they left BEFORE the early out threshold.
      // E.g., if threshold is 30 mins, and they left 31 mins early. But usually, any minute early is "earlyOut", and the policy defines the penalty in payroll.
    }

    // The EOD Cron or HR Manual Trigger handles the conversion to HalfDay / Absent based on total working hours.
  }

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
