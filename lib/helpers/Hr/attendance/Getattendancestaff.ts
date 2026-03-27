import { supabase } from "@/lib/supabaseClient"; // adjust path as needed
 
// ── Role mapping ──────────────────────────────────────────────────────────────
const ROLE_DISPLAY_MAP: Record<string, string> = {
  CollegeAdmin: "College Admin",
  Admin:        "Admin",
  Faculty:      "Faculty",
  Finance:      "Finance Executive",
  CollegeHr:    "HR Manager",
  Placement:    "Placement",
};
 
const EXCLUDED_ROLES = ["Student", "Parent", "SuperAdmin"];
 
// ── Types ─────────────────────────────────────────────────────────────────────
 
export type AttendanceStaffRow = {
  userId:            number;
  fullName:          string;
  role:              string;
  rawRole:           string;
  attendanceDailyId: number | null;
  checkIn:           string | null;
  checkOut:          string | null;
  rawCheckIn:        string | null;
  rawCheckOut:       string | null;
  totalHours:        string;
  status:            string;
  lateByMinutes:     number;
  earlyOutMinutes:   number;
  classesTaken:      number | null;
  hasAdjustment:     boolean;
  reason:            string | null;   // attendance_adjustments.reason ?? markedReason
};
 
export type GetAttendanceStaffParams = {
  collegeId: number;
  search?:   string;
  page?:     number;
  limit?:    number;
};
 
export type GetAttendanceStaffResult = {
  staff:      AttendanceStaffRow[];
  totalCount: number;
};
 
// ── Helpers ───────────────────────────────────────────────────────────────────
 
/**
 * Format a "HH:MM:SS" time string → "09:04 AM"
 * DB stores time without time zone e.g. "09:30:00"
 */
function formatTime(timeStr: string | null): string | null {
  if (!timeStr) return null;
  // Parse "HH:MM:SS" or "HH:MM"
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours   = parseInt(parts[0], 10);
  const mins  = parts[1].padStart(2, "0");
  const mer   = hours >= 12 ? "PM" : "AM";
  if (hours > 12)  hours -= 12;
  if (hours === 0) hours  = 12;
  return `${String(hours).padStart(2, "0")}:${mins} ${mer}`;
}
 
/** Convert minutes → "Xh Ym" or "-" */
export function formatMinutes(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}
 
/** Today as "YYYY-MM-DD" in local timezone (not UTC) */
function todayDate(): string {
  const d = new Date();
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
 
/** Capitalise first letter, lowercase rest: "PRESENT" → "Present" */
function capitalise(s: string): string {
  if (!s) return "-";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
 
// ── Main fetch ────────────────────────────────────────────────────────────────
 
export async function getAttendanceStaff({
  collegeId,
  search = "",
  page  = 1,
  limit = 100,
}: GetAttendanceStaffParams): Promise<GetAttendanceStaffResult> {
  const today = todayDate();
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;
 
  // ── 1. Fetch users ────────────────────────────────────────────────────────
  let usersQuery = supabase
    .from("users")
    .select("userId, fullName, role", { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .eq("isActive", true)
    .not("role", "in", `(${EXCLUDED_ROLES.join(",")})`)
    .order("userId", { ascending: true })
    .range(from, to);
 
  if (search.trim()) {
    const t = search.trim();
    usersQuery = /^\d+$/.test(t)
      ? usersQuery.eq("userId", parseInt(t))
      : usersQuery.ilike("fullName", `%${t}%`);
  }
 
  const { data: users, error: usersError, count } = await usersQuery;
  if (usersError) throw new Error(usersError.message);
  if (!users || users.length === 0) return { staff: [], totalCount: 0 };
 
  const userIds = users.map((u) => u.userId);
 
  // ── 2. Fetch today's attendance_daily rows ────────────────────────────────
  const { data: dailyRows, error: dailyError } = await supabase
    .from("attendance_daily")
    .select(`
      attendanceDailyId, userId, checkIn, checkOut,
      totalMinutes, status, lateByMinutes, earlyOutMinutes, markedReason
    `)
    .in("userId", userIds)
    .eq("attendanceDate", today);
 
  if (dailyError) throw new Error(dailyError.message);
 
  const dailyMap = new Map<number, (typeof dailyRows)[0]>(
    (dailyRows ?? []).map((r) => [r.userId, r])
  );
 
  // ── 3. Fetch latest attendance_adjustments (newest wins per dailyId) ──────
  const dailyIds = (dailyRows ?? []).map((r) => r.attendanceDailyId).filter(Boolean);
 
  const adjustmentMap = new Map<
    number,
    { newCheckIn: string | null; newCheckOut: string | null; reason: string | null }
  >();
 
  if (dailyIds.length > 0) {
    const { data: adjs, error: adjError } = await supabase
      .from("attendance_adjustments")
      .select("adjustmentId, attendanceDailyId, newCheckIn, newCheckOut, reason")
      .in("attendanceDailyId", dailyIds)
      .order("adjustmentId", { ascending: false });
 
    if (adjError) throw new Error(adjError.message);
 
    for (const adj of adjs ?? []) {
      if (!adjustmentMap.has(adj.attendanceDailyId)) {
        adjustmentMap.set(adj.attendanceDailyId, {
          newCheckIn:  adj.newCheckIn,
          newCheckOut: adj.newCheckOut,
          reason:      adj.reason ?? null,
        });
      }
    }
  }
 
  // ── 4. Faculty → classesTaken ─────────────────────────────────────────────
  // Count calendar_event rows today where at least one attendance_record has
  // status PRESENT or LATE (excludes CLASS_CANCEL, ABSENT, LEAVE, etc.)
  const facultyUserIds = users
    .filter((u) => u.role === "Faculty")
    .map((u) => u.userId);
 
  const facultyIdMap = new Map<number, number>(); // userId  → facultyId
  const classesMap   = new Map<number, number>(); // userId  → count (keyed by userId NOT facultyId)
 
  if (facultyUserIds.length > 0) {
    // Resolve userId → facultyId — strict 1:1, one row per userId expected
    const { data: facRows, error: facError } = await supabase
      .from("faculty")
      .select("facultyId, userId")
      .in("userId", facultyUserIds);
 
    if (facError) throw new Error(facError.message);
 
    // Build strict userId → facultyId map
    // If a userId appears more than once (shouldn't happen), take the first
    for (const f of facRows ?? []) {
      if (!facultyIdMap.has(f.userId)) {
        facultyIdMap.set(f.userId, f.facultyId);
      }
    }
 
    // Build reverse map: facultyId → userId (to map count back to userId)
    const facultyToUserMap = new Map<number, number>();
    for (const [userId, facultyId] of facultyIdMap.entries()) {
      facultyToUserMap.set(facultyId, userId);
    }
 
    const facultyIds = Array.from(facultyIdMap.values());
 
    if (facultyIds.length > 0) {
      // Step A: get today's non-deleted calendar_event ids for these faculty
      const { data: evRows, error: evError } = await supabase
        .from("calendar_event")
        .select("calendarEventId, facultyId")
        .in("facultyId", facultyIds)
        .eq("date", today)
        .eq("is_deleted", false);
 
      if (evError) throw new Error(evError.message);
 
      const calendarEventIds = (evRows ?? []).map((e) => e.calendarEventId);
 
      // Map calendarEventId → userId (via facultyId → userId)
      const eventUserMap = new Map<number, number>();
      for (const ev of evRows ?? []) {
        const uid = facultyToUserMap.get(ev.facultyId);
        if (uid !== undefined) eventUserMap.set(ev.calendarEventId, uid);
      }
 
      if (calendarEventIds.length > 0) {
        // Step B: only count events that had at least one PRESENT or LATE student
        // AND were actually marked today (markedAt = today prevents past/pre-marked records)
        const { data: arRows, error: arError } = await supabase
          .from("attendance_record")
          .select("calendarEventId")
          .in("calendarEventId", calendarEventIds)
          .in("status", ["PRESENT", "LATE"])
          .eq("markedAt", today)          // ← only today's marked records
          .is("deletedAt", null);
 
        if (arError) throw new Error(arError.message);
 
        // Unique conducted calendarEventIds
        const conductedEventIds = new Set(
          (arRows ?? []).map((r) => r.calendarEventId)
        );
 
        // Count per userId (NOT per facultyId — avoids cross-contamination)
        for (const eventId of conductedEventIds) {
          const uid = eventUserMap.get(eventId);
          if (uid !== undefined) {
            classesMap.set(uid, (classesMap.get(uid) ?? 0) + 1);
          }
        }
      }
    }
  }
 
  // ── 5. Assemble ───────────────────────────────────────────────────────────
  const staff: AttendanceStaffRow[] = users.map((u) => {
    const daily      = dailyMap.get(u.userId) ?? null;
    const dailyId    = daily?.attendanceDailyId ?? null;
    const adjustment = dailyId ? (adjustmentMap.get(dailyId) ?? null) : null;
 
    // UI shows adjusted times if an adjustment exists, else original
    const displayCheckIn  = adjustment?.newCheckIn  ?? daily?.checkIn  ?? null;
    const displayCheckOut = adjustment?.newCheckOut ?? daily?.checkOut ?? null;
 
    const facultyId = facultyIdMap.get(u.userId) ?? null;
    const isFaculty = u.role === "Faculty";
 
    return {
      userId:            u.userId,
      fullName:          u.fullName,
      role:              ROLE_DISPLAY_MAP[u.role ?? ""] ?? u.role ?? "Unknown",
      rawRole:           u.role ?? "",
      attendanceDailyId: dailyId,
      checkIn:           formatTime(displayCheckIn),
      checkOut:          formatTime(displayCheckOut),
      rawCheckIn:        daily?.checkIn  ?? null,
      rawCheckOut:       daily?.checkOut ?? null,
      totalHours:        formatMinutes(daily?.totalMinutes ?? null),
      status:            capitalise(daily?.status ?? ""),
      lateByMinutes:     daily?.lateByMinutes   ?? 0,
      earlyOutMinutes:   daily?.earlyOutMinutes  ?? 0,
      classesTaken:      isFaculty
                           ? (classesMap.get(u.userId) ?? 0)
                           : null,
      hasAdjustment:     !!adjustment,
      // Same pattern as getAttendanceData: adjustment.reason ?? markedReason
      reason:            adjustment?.reason ?? (daily as any)?.markedReason ?? null,
    };
  });
 
  return { staff, totalCount: count ?? 0 };
}
 
// ── Constants — College timings ───────────────────────────────────────────────
const EXPECTED_CHECK_IN_HOUR  = 9;   // 09:30 AM
const EXPECTED_CHECK_IN_MIN   = 30;
const EXPECTED_CHECK_OUT_HOUR = 16;  // 04:30 PM
const EXPECTED_CHECK_OUT_MIN  = 30;
 
/**
 * Parse "HH:MM:SS" or "HH:MM" → total minutes from midnight.
 */
function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}
 
/**
 * Calculate totalMinutes, lateByMinutes, earlyOutMinutes
 * from "HH:MM:SS" time strings (time without time zone).
 */
function calcDerivedFields(
  checkInTime:  string | null,
  checkOutTime: string | null
): { totalMinutes: number | null; lateByMinutes: number; earlyOutMinutes: number } {
  const checkInMins  = timeToMinutes(checkInTime);
  const checkOutMins = timeToMinutes(checkOutTime);
 
  // Total minutes worked
  let totalMinutes: number | null = null;
  if (checkInMins !== null && checkOutMins !== null) {
    totalMinutes = Math.max(0, checkOutMins - checkInMins);
  }
 
  // Expected times in minutes from midnight
  const expectedInMins  = EXPECTED_CHECK_IN_HOUR  * 60 + EXPECTED_CHECK_IN_MIN;   // 9:30 = 570
  const expectedOutMins = EXPECTED_CHECK_OUT_HOUR * 60 + EXPECTED_CHECK_OUT_MIN;  // 16:30 = 990
 
  // Late by — minutes after expected check-in
  const lateByMinutes = checkInMins !== null
    ? Math.max(0, checkInMins - expectedInMins)
    : 0;
 
  // Early out — minutes before expected check-out
  const earlyOutMinutes = checkOutMins !== null
    ? Math.max(0, expectedOutMins - checkOutMins)
    : 0;
 
  return { totalMinutes, lateByMinutes, earlyOutMinutes };
}
 
// ── Save attendance — handles both INSERT and EDIT cases ─────────────────────
 
export type SaveAttendanceParams = {
  attendanceDailyId: number | null;
  userId:            number;
  checkIn:           string;
  checkOut:          string;
  reason:            string;
  status?:           string;         // HR-selected status — preserved on EDIT, used on INSERT
  collegeHrId:       number;
  classesTaken?:     number;
  rawCheckIn:        string | null;
  rawCheckOut:       string | null;
};
 
export async function saveAttendance(params: SaveAttendanceParams): Promise<void> {
  const today = todayDate();
  const now   = new Date().toISOString();
 
  const checkInVal  = params.checkIn  || null;
  const checkOutVal = params.checkOut || null;
 
  const { totalMinutes, lateByMinutes, earlyOutMinutes } = calcDerivedFields(
    checkInVal,
    checkOutVal
  );
 
  // ── Resolve actual attendanceDailyId — check DB if not provided ───────────
  // This handles case where row was just inserted but UI hasn't re-fetched yet
  let attendanceDailyId = params.attendanceDailyId;
 
  if (!attendanceDailyId) {
    const { data: existing } = await supabase
      .from("attendance_daily")
      .select("attendanceDailyId")
      .eq("userId", params.userId)
      .eq("attendanceDate", today)
      .maybeSingle();
 
    if (existing?.attendanceDailyId) {
      attendanceDailyId = existing.attendanceDailyId;
    }
  }
 
  // ── CASE 1: INSERT — confirmed no row exists ─────────────────────────────
  if (!attendanceDailyId) {
    const insertStatus = params.status
      ? params.status.toUpperCase()
      : (checkInVal ? (lateByMinutes > 0 ? "LATE" : "PRESENT") : "ABSENT");
 
    // Use upsert to avoid duplicate key if row was already created in same session
    const { data: upserted, error: upsertError } = await supabase
      .from("attendance_daily")
      .upsert({
        userId:          params.userId,
        attendanceDate:  today,
        checkIn:         checkInVal,
        checkOut:        checkOutVal,
        totalMinutes,
        status:          insertStatus,
        lateByMinutes,
        earlyOutMinutes,
        classesTaken:    params.classesTaken ?? 0,
        isManual:        true,
        markedBy:        params.collegeHrId,
        markedReason:    params.reason || null,
        createdAt:       now,
        updatedAt:       now,
      }, { onConflict: "userId,attendanceDate" })
      .select("attendanceDailyId")
      .single();
 
    if (upsertError) throw new Error(upsertError.message);
 
    const { error: adjError } = await supabase
      .from("attendance_adjustments")
      .insert({
        attendanceDailyId: upserted.attendanceDailyId,
        oldCheckIn:        null,
        oldCheckOut:       null,
        newCheckIn:        checkInVal,
        newCheckOut:       checkOutVal,
        reason:            params.reason || null,
        adjustedBy:        params.collegeHrId,
      });
 
    if (adjError) throw new Error(adjError.message);
    return;
  }
 
  // ── CASE 2: EDIT — row confirmed exists ──────────────────────────────────
  const editPayload: Record<string, unknown> = {
    totalMinutes,
    lateByMinutes,
    earlyOutMinutes,
    classesTaken:    params.classesTaken ?? 0,
    updatedAt:       now,
  };
 
  if (params.status) editPayload.status = params.status.toUpperCase();
  if (checkInVal  !== null) editPayload.checkIn  = checkInVal;
  if (checkOutVal !== null) editPayload.checkOut = checkOutVal;
 
  const { error: updateError } = await supabase
    .from("attendance_daily")
    .update(editPayload)
    .eq("attendanceDailyId", attendanceDailyId);
 
  if (updateError) throw new Error(updateError.message);
 
  const { data: existingAdj, error: fetchAdjError } = await supabase
    .from("attendance_adjustments")
    .select("adjustmentId, newCheckIn, newCheckOut")
    .eq("attendanceDailyId", attendanceDailyId)
    .order("adjustmentId", { ascending: false })
    .limit(1)
    .maybeSingle();
 
  if (fetchAdjError) throw new Error(fetchAdjError.message);
 
  if (existingAdj) {
    const { error: adjUpdateError } = await supabase
      .from("attendance_adjustments")
      .update({
        oldCheckIn:  existingAdj.newCheckIn  ?? null,
        oldCheckOut: existingAdj.newCheckOut ?? null,
        newCheckIn:  checkInVal,
        newCheckOut: checkOutVal,
        reason:      params.reason || null,
        adjustedBy:  params.collegeHrId,
      })
      .eq("adjustmentId", existingAdj.adjustmentId);
 
    if (adjUpdateError) throw new Error(adjUpdateError.message);
  } else {
    const { error: adjInsertError } = await supabase
      .from("attendance_adjustments")
      .insert({
        attendanceDailyId: attendanceDailyId,
        oldCheckIn:        params.rawCheckIn  ?? null,
        oldCheckOut:       params.rawCheckOut ?? null,
        newCheckIn:        checkInVal,
        newCheckOut:       checkOutVal,
        reason:            params.reason || null,
        adjustedBy:        params.collegeHrId,
      });
 
    if (adjInsertError) throw new Error(adjInsertError.message);
  }
}
 
/**
 * Update ONLY the status in attendance_daily.
 * No time recalculation, no adjustment row.
 * Used when HR changes status via Mark buttons without editing times.
 */
export async function saveStatusOnly(params: {
  attendanceDailyId: number;
  userId:            number;
  status:            string;
  collegeHrId:       number;
}): Promise<void> {
  const today = todayDate();
  const now   = new Date().toISOString();
 
  if (params.attendanceDailyId !== null && params.attendanceDailyId > 0) {
    // Row exists → just update status
    const { error } = await supabase
      .from("attendance_daily")
      .update({ status: params.status.toUpperCase(), updatedAt: now })
      .eq("attendanceDailyId", params.attendanceDailyId);
 
    if (error) throw new Error(error.message);
  } else {
    // No row yet → upsert with status only, no times
    const { error } = await supabase
      .from("attendance_daily")
      .upsert({
        userId:          params.userId,
        attendanceDate:  today,
        status:          params.status.toUpperCase(),
        isManual:        true,
        markedBy:        params.collegeHrId,
        lateByMinutes:   0,
        earlyOutMinutes: 0,
        classesTaken:    0,
        createdAt:       now,
        updatedAt:       now,
      }, { onConflict: "userId,attendanceDate" });
 
    if (error) throw new Error(error.message);
  }
}
 
/**
 * Converts UI time string "HH:MM AM/PM" → "HH:MM:00" for time without time zone column.
 * Strictly requires complete format — throws if incomplete.
 */
export function buildTimeString(timeStr: string): string {
  if (!timeStr || !timeStr.trim()) {
    throw new Error("Time is required");
  }
 
  const cleaned = timeStr.trim().toUpperCase().replace(/\s+/g, " ");
 
  // Must match "HH:MM AM" or "HH:MM PM" exactly
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  // Or 24-hour "HH:MM"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
 
  let hours   = 0;
  let minutes = 0;
 
  if (match12) {
    hours   = parseInt(match12[1], 10);
    minutes = parseInt(match12[2], 10);
    const mer = match12[3];
    if (mer === "PM" && hours !== 12) hours += 12;
    if (mer === "AM" && hours === 12) hours  = 0;
  } else if (match24) {
    hours   = parseInt(match24[1], 10);
    minutes = parseInt(match24[2], 10);
  } else {
    throw new Error(`Incomplete time: "${timeStr}". Enter HH:MM and select AM/PM`);
  }
 
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time: "${timeStr}"`);
  }
 
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}
 
/** @deprecated use buildTimeString */
export const buildTimestamp = buildTimeString;
 
// ── Bulk mark attendance ──────────────────────────────────────────────────────
 
export type BulkMarkParams = {
  userIds:     number[];
  status:      "Present" | "Absent" | "Leave" | "Late";
  collegeHrId: number;
};
 
export async function bulkMarkAttendance(params: BulkMarkParams): Promise<void> {
  const today  = todayDate();
  const now    = new Date();
  const STATUS = params.status.toUpperCase();
 
  // Current time as "HH:MM:00" for time without time zone column
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`;
  const checkInTime = STATUS === "PRESENT" || STATUS === "LATE" ? currentTimeStr : null;
 
  const { lateByMinutes } = calcDerivedFields(checkInTime, null);
 
  const rows = params.userIds.map((userId) => ({
    userId,
    attendanceDate:  today,
    status:          STATUS,
    isManual:        true,
    markedBy:        params.collegeHrId,
    checkIn:         checkInTime,
    checkOut:        null,
    totalMinutes:    null,
    lateByMinutes:   STATUS === "LATE" ? lateByMinutes : 0,
    earlyOutMinutes: 0,
    createdAt:       now.toISOString(),
    updatedAt:       now.toISOString(),
  }));
 
  const { error } = await supabase
    .from("attendance_daily")
    .upsert(rows, { onConflict: "userId,attendanceDate" });
 
  if (error) throw new Error(error.message);
}