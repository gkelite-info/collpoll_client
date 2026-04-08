import { supabase } from "@/lib/supabaseClient"; // adjust path as needed

// ── Role mapping ──────────────────────────────────────────────────────────────
const ROLE_DISPLAY_MAP: Record<string, string> = {
  CollegeAdmin: "College Admin",
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance Executive",
  CollegeHr: "HR Manager",
  Placement: "Placement",
};

const EXCLUDED_ROLES = ["Student", "Parent", "SuperAdmin"];

// ── Types ─────────────────────────────────────────────────────────────────────

export type AttendanceStaffRow = {
  userId: number;
  fullName: string;
  role: string;
  rawRole: string;
  attendanceDailyId: number | null;
  checkIn: string | null;
  checkOut: string | null;
  rawCheckIn: string | null;
  rawCheckOut: string | null;
  totalHours: string;
  status: string;
  lateByMinutes: number;
  earlyOutMinutes: number;
  classesTaken: number | null;
  hasAdjustment: boolean;
  reason: string | null;
};

export type GetAttendanceStaffParams = {
  collegeId: number;
  search?: string;
  page?: number;
  limit?: number;
  date?: string;
  role?: string | null; // ADDED: Role parameter for DB-level filtering
};

export type GetAttendanceStaffResult = {
  staff: AttendanceStaffRow[];
  totalCount: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(timeStr: string | null): string | null {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const mins = parts[1].padStart(2, "0");
  const mer = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${mins} ${mer}`;
}

export function formatMinutes(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

function todayDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function capitalise(s: string): string {
  if (!s) return "-";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ── Main fetch ────────────────────────────────────────────────────────────────

export async function getAttendanceStaff(
  params: GetAttendanceStaffParams,
): Promise<GetAttendanceStaffResult> {
  const { collegeId, search = "", page = 1, limit = 100, date, role } = params;
  const today = date || todayDate();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

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

  // ADDED: Native DB filtering for Roles
  if (role) {
    const reverseRoleMap: Record<string, string> = {
      "College Admin": "CollegeAdmin",
      Admin: "Admin",
      Faculty: "Faculty",
      "Finance Executive": "Finance",
      "HR Manager": "CollegeHr",
      Placement: "Placement",
    };
    const dbRole = reverseRoleMap[role] || role;
    usersQuery = usersQuery.eq("role", dbRole);
  }

  const { data: users, error: usersError, count } = await usersQuery;
  if (usersError) throw new Error(usersError.message);
  if (!users || users.length === 0) return { staff: [], totalCount: 0 };

  const userIds = users.map((u) => u.userId);

  // ── 2. Fetch today's attendance_daily rows ────────────────────────────────
  const { data: dailyRows, error: dailyError } = await supabase
    .from("attendance_daily")
    .select(
      `
      attendanceDailyId, userId, checkIn, checkOut,
      totalMinutes, status, lateByMinutes, earlyOutMinutes, markedReason
    `,
    )
    .in("userId", userIds)
    .eq("attendanceDate", today);

  if (dailyError) throw new Error(dailyError.message);

  const dailyMap = new Map<number, (typeof dailyRows)[0]>(
    (dailyRows ?? []).map((r) => [r.userId, r]),
  );

  // ── 3. Fetch latest attendance_adjustments (newest wins per dailyId) ──────
  const dailyIds = (dailyRows ?? [])
    .map((r) => r.attendanceDailyId)
    .filter(Boolean);

  const adjustmentMap = new Map<
    number,
    {
      newCheckIn: string | null;
      newCheckOut: string | null;
      reason: string | null;
    }
  >();

  if (dailyIds.length > 0) {
    const { data: adjs, error: adjError } = await supabase
      .from("attendance_adjustments")
      .select(
        "adjustmentId, attendanceDailyId, newCheckIn, newCheckOut, reason",
      )
      .in("attendanceDailyId", dailyIds)
      .order("adjustmentId", { ascending: false });

    if (adjError) throw new Error(adjError.message);

    for (const adj of adjs ?? []) {
      if (!adjustmentMap.has(adj.attendanceDailyId)) {
        adjustmentMap.set(adj.attendanceDailyId, {
          newCheckIn: adj.newCheckIn,
          newCheckOut: adj.newCheckOut,
          reason: adj.reason ?? null,
        });
      }
    }
  }

  // ── 4. Faculty → classesTaken ─────────────────────────────────────────────
  const facultyUserIds = users
    .filter((u) => u.role === "Faculty")
    .map((u) => u.userId);

  const facultyIdMap = new Map<number, number>();
  const classesMap = new Map<number, number>();

  if (facultyUserIds.length > 0) {
    const { data: facRows, error: facError } = await supabase
      .from("faculty")
      .select("facultyId, userId")
      .in("userId", facultyUserIds);

    if (facError) throw new Error(facError.message);

    for (const f of facRows ?? []) {
      if (!facultyIdMap.has(f.userId)) {
        facultyIdMap.set(f.userId, f.facultyId);
      }
    }

    const facultyToUserMap = new Map<number, number>();
    for (const [userId, facultyId] of facultyIdMap.entries()) {
      facultyToUserMap.set(facultyId, userId);
    }

    const facultyIds = Array.from(facultyIdMap.values());

    if (facultyIds.length > 0) {
      const { data: evRows, error: evError } = await supabase
        .from("calendar_event")
        .select("calendarEventId, facultyId")
        .in("facultyId", facultyIds)
        .eq("date", today)
        .eq("is_deleted", false);

      if (evError) throw new Error(evError.message);

      const calendarEventIds = (evRows ?? []).map((e) => e.calendarEventId);

      const eventUserMap = new Map<number, number>();
      for (const ev of evRows ?? []) {
        const uid = facultyToUserMap.get(ev.facultyId);
        if (uid !== undefined) eventUserMap.set(ev.calendarEventId, uid);
      }

      if (calendarEventIds.length > 0) {
        const { data: arRows, error: arError } = await supabase
          .from("attendance_record")
          .select("calendarEventId")
          .in("calendarEventId", calendarEventIds)
          .in("status", ["PRESENT", "LATE"])
          .eq("markedAt", today)
          .is("deletedAt", null);

        if (arError) throw new Error(arError.message);

        const conductedEventIds = new Set(
          (arRows ?? []).map((r) => r.calendarEventId),
        );

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
    const daily = dailyMap.get(u.userId) ?? null;
    const dailyId = daily?.attendanceDailyId ?? null;
    const adjustment = dailyId ? (adjustmentMap.get(dailyId) ?? null) : null;

    const displayCheckIn = adjustment?.newCheckIn ?? daily?.checkIn ?? null;
    const displayCheckOut = adjustment?.newCheckOut ?? daily?.checkOut ?? null;

    const facultyId = facultyIdMap.get(u.userId) ?? null;
    const isFaculty = u.role === "Faculty";

    return {
      userId: u.userId,
      fullName: u.fullName,
      role: ROLE_DISPLAY_MAP[u.role ?? ""] ?? u.role ?? "Unknown",
      rawRole: u.role ?? "",
      attendanceDailyId: dailyId,
      checkIn: formatTime(displayCheckIn),
      checkOut: formatTime(displayCheckOut),
      rawCheckIn: daily?.checkIn ?? null,
      rawCheckOut: daily?.checkOut ?? null,
      totalHours: formatMinutes(daily?.totalMinutes ?? null),
      status: capitalise(daily?.status ?? ""),
      lateByMinutes: daily?.lateByMinutes ?? 0,
      earlyOutMinutes: daily?.earlyOutMinutes ?? 0,
      classesTaken: isFaculty ? (classesMap.get(u.userId) ?? 0) : null,
      hasAdjustment: !!adjustment,
      reason: adjustment?.reason ?? (daily as any)?.markedReason ?? null,
    };
  });

  return { staff, totalCount: count ?? 0 };
}

// ── Constants — College timings ───────────────────────────────────────────────
const EXPECTED_CHECK_IN_HOUR = 9; // 09:30 AM
const EXPECTED_CHECK_IN_MIN = 30;
const EXPECTED_CHECK_OUT_HOUR = 16; // 04:30 PM
const EXPECTED_CHECK_OUT_MIN = 30;

function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function calcDerivedFields(
  checkInTime: string | null,
  checkOutTime: string | null,
): {
  totalMinutes: number | null;
  lateByMinutes: number;
  earlyOutMinutes: number;
} {
  const checkInMins = timeToMinutes(checkInTime);
  const checkOutMins = timeToMinutes(checkOutTime);

  let totalMinutes: number | null = null;
  if (checkInMins !== null && checkOutMins !== null) {
    totalMinutes = Math.max(0, checkOutMins - checkInMins);
  }

  const expectedInMins = EXPECTED_CHECK_IN_HOUR * 60 + EXPECTED_CHECK_IN_MIN;
  const expectedOutMins = EXPECTED_CHECK_OUT_HOUR * 60 + EXPECTED_CHECK_OUT_MIN;

  const lateByMinutes =
    checkInMins !== null ? Math.max(0, checkInMins - expectedInMins) : 0;

  const earlyOutMinutes =
    checkOutMins !== null ? Math.max(0, expectedOutMins - checkOutMins) : 0;

  return { totalMinutes, lateByMinutes, earlyOutMinutes };
}

// ── Save attendance ────────────────────────────────────────────────────────

export type SaveAttendanceParams = {
  attendanceDailyId: number | null;
  userId: number;
  checkIn: string;
  checkOut: string;
  reason: string;
  status?: string;
  collegeHrId: number;
  classesTaken?: number;
  rawCheckIn: string | null;
  rawCheckOut: string | null;
  date?: string;
};

export async function saveAttendance(
  params: SaveAttendanceParams,
): Promise<void> {
  const today = params.date || todayDate();
  const now = new Date().toISOString();

  const checkInVal = params.checkIn || null;
  const checkOutVal = params.checkOut || null;

  const { totalMinutes, lateByMinutes, earlyOutMinutes } = calcDerivedFields(
    checkInVal,
    checkOutVal,
  );

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

  if (!attendanceDailyId) {
    const insertStatus = params.status
      ? params.status.toUpperCase()
      : checkInVal
        ? lateByMinutes > 0
          ? "LATE"
          : "PRESENT"
        : "ABSENT";

    const { data: upserted, error: upsertError } = await supabase
      .from("attendance_daily")
      .upsert(
        {
          userId: params.userId,
          attendanceDate: today,
          checkIn: checkInVal,
          checkOut: checkOutVal,
          totalMinutes,
          status: insertStatus,
          lateByMinutes,
          earlyOutMinutes,
          classesTaken: params.classesTaken ?? 0,
          isManual: true,
          markedBy: params.collegeHrId,
          markedReason: params.reason || null,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "userId,attendanceDate" },
      )
      .select("attendanceDailyId")
      .single();

    if (upsertError) throw new Error(upsertError.message);

    const { error: adjError } = await supabase
      .from("attendance_adjustments")
      .insert({
        attendanceDailyId: upserted.attendanceDailyId,
        oldCheckIn: null,
        oldCheckOut: null,
        newCheckIn: checkInVal,
        newCheckOut: checkOutVal,
        reason: params.reason || null,
        adjustedBy: params.collegeHrId,
      });

    if (adjError) throw new Error(adjError.message);
    return;
  }

  const editPayload: Record<string, unknown> = {
    totalMinutes,
    lateByMinutes,
    earlyOutMinutes,
    classesTaken: params.classesTaken ?? 0,
    updatedAt: now,
  };

  if (params.status) editPayload.status = params.status.toUpperCase();
  if (checkInVal !== null) editPayload.checkIn = checkInVal;
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
        oldCheckIn: existingAdj.newCheckIn ?? null,
        oldCheckOut: existingAdj.newCheckOut ?? null,
        newCheckIn: checkInVal,
        newCheckOut: checkOutVal,
        reason: params.reason || null,
        adjustedBy: params.collegeHrId,
      })
      .eq("adjustmentId", existingAdj.adjustmentId);

    if (adjUpdateError) throw new Error(adjUpdateError.message);
  } else {
    const { error: adjInsertError } = await supabase
      .from("attendance_adjustments")
      .insert({
        attendanceDailyId: attendanceDailyId,
        oldCheckIn: params.rawCheckIn ?? null,
        oldCheckOut: params.rawCheckOut ?? null,
        newCheckIn: checkInVal,
        newCheckOut: checkOutVal,
        reason: params.reason || null,
        adjustedBy: params.collegeHrId,
      });

    if (adjInsertError) throw new Error(adjInsertError.message);
  }
}

export async function saveStatusOnly(params: {
  attendanceDailyId: number;
  userId: number;
  status: string;
  collegeHrId: number;
  date?: string;
}): Promise<void> {
  const today = params.date || todayDate();
  const now = new Date().toISOString();

  if (params.attendanceDailyId !== null && params.attendanceDailyId > 0) {
    const { error } = await supabase
      .from("attendance_daily")
      .update({ status: params.status.toUpperCase(), updatedAt: now })
      .eq("attendanceDailyId", params.attendanceDailyId);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("attendance_daily").upsert(
      {
        userId: params.userId,
        attendanceDate: today,
        status: params.status.toUpperCase(),
        isManual: true,
        markedBy: params.collegeHrId,
        lateByMinutes: 0,
        earlyOutMinutes: 0,
        classesTaken: 0,
        createdAt: now,
        updatedAt: now,
      },
      { onConflict: "userId,attendanceDate" },
    );

    if (error) throw new Error(error.message);
  }
}

export function buildTimeString(timeStr: string): string {
  if (!timeStr || !timeStr.trim()) {
    throw new Error("Time is required");
  }

  const cleaned = timeStr.trim().toUpperCase().replace(/\s+/g, " ");

  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);

  let hours = 0;
  let minutes = 0;

  if (match12) {
    hours = parseInt(match12[1], 10);
    minutes = parseInt(match12[2], 10);
    const mer = match12[3];
    if (mer === "PM" && hours !== 12) hours += 12;
    if (mer === "AM" && hours === 12) hours = 0;
  } else if (match24) {
    hours = parseInt(match24[1], 10);
    minutes = parseInt(match24[2], 10);
  } else {
    throw new Error(
      `Incomplete time: "${timeStr}". Enter HH:MM and select AM/PM`,
    );
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time: "${timeStr}"`);
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export const buildTimestamp = buildTimeString;

export type BulkMarkParams = {
  userIds: number[];
  status: "Present" | "Absent" | "Leave" | "Late";
  collegeHrId: number;
};

export async function bulkMarkAttendance(
  params: BulkMarkParams,
): Promise<void> {
  const today = todayDate();
  const now = new Date();
  const STATUS = params.status.toUpperCase();

  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`;
  const checkInTime =
    STATUS === "PRESENT" || STATUS === "LATE" ? currentTimeStr : null;

  const { lateByMinutes } = calcDerivedFields(checkInTime, null);

  const rows = params.userIds.map((userId) => ({
    userId,
    attendanceDate: today,
    status: STATUS,
    isManual: true,
    markedBy: params.collegeHrId,
    checkIn: checkInTime,
    checkOut: null,
    totalMinutes: null,
    lateByMinutes: STATUS === "LATE" ? lateByMinutes : 0,
    earlyOutMinutes: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }));

  const { error } = await supabase
    .from("attendance_daily")
    .upsert(rows, { onConflict: "userId,attendanceDate" });

  if (error) throw new Error(error.message);
}
