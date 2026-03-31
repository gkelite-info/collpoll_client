import { supabase } from "@/lib/supabaseClient";

export const HR_ROLE_PILLS = [
  { label: "College Admin", value: "collegeAdmin" },
  { label: "Admin", value: "admin" },
  { label: "Faculty", value: "faculty" },
  { label: "Finance Executive", value: "finance" },
  { label: "HR Manager", value: "collegeHr" },
  { label: "Placement", value: "placement" },
];

export const DEFAULT_ROLE = "Faculty";

const EXCLUDED_ROLES = ["Student", "Parent", "SuperAdmin"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ── Formatters ────────────────────────────────────────────────────────────────
function formatTime(t: string | null): string {
  if (!t) return "—";
  const p = t.split(":");
  if (p.length < 2) return t;
  let h = parseInt(p[0], 10);
  const m = p[1].padStart(2, "0");
  const mer = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${mer}`;
}

function formatMinutes(min: number | null): string {
  if (!min || min <= 0) return "—";
  const h = Math.floor(min / 60),
    m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type HrDashCards = {
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  lateCheckins: number;
};

export type MonthlyBar = { month: string; value: number };

export type TodayRow = {
  userId: number;
  name: string;
  checkIn: string;
  checkOut: string;
  status: string;
  classesTaken: number | null;
  attendancePct: string;
};

export type MonthDetailRow = {
  name: string;
  presentDays: number;
  absentDays: number;
  leaves: number;
  attendancePct: string;
  lateCheckins: number;
  performance: string;
};

export type PaginatedResult<T> = {
  data: T[];
  totalCount: number;
};

// ── Helper: get userIds for a role in a college (with optional pagination) ────
async function getUsersForRole(collegeId: number, role: string) {
  const { data } = await supabase
    .from("users")
    .select("userId, fullName")
    .eq("collegeId", collegeId)
    .eq("role", role)
    .eq("isActive", true)
    .eq("is_deleted", false);
  return data ?? [];
}

async function getUsersForRolePaginated(
  collegeId: number,
  role: string,
  page: number,
  limit: number,
): Promise<{
  users: { userId: number; fullName: string }[];
  totalCount: number;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count } = await supabase
    .from("users")
    .select("userId, fullName", { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("role", role)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .range(from, to);

  return { users: data ?? [], totalCount: count ?? 0 };
}

export async function getHrDashCards(collegeId: number): Promise<HrDashCards> {
  const today = todayDate();

  const { data: allUsers } = await supabase
    .from("users")
    .select("userId")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .not("role", "in", `(${EXCLUDED_ROLES.join(",")})`);

  const userIds = (allUsers ?? []).map((u) => u.userId);
  const totalStaff = userIds.length;

  if (userIds.length === 0)
    return { totalStaff: 0, presentToday: 0, absentToday: 0, lateCheckins: 0 };

  const { data: rows } = await supabase
    .from("attendance_daily")
    .select("status")
    .in("userId", userIds)
    .eq("attendanceDate", today);

  const r = rows ?? [];
  return {
    totalStaff,
    presentToday: r.filter((x) => x.status === "PRESENT").length,
    absentToday: r.filter((x) => x.status === "ABSENT").length,
    lateCheckins: r.filter((x) => x.status === "LATE").length,
  };
}

export async function getMonthlyAttendance(
  collegeId: number,
  role: string,
  year: number,
): Promise<MonthlyBar[]> {
  const users = await getUsersForRole(collegeId, role);
  if (users.length === 0)
    return MONTH_LABELS.map((m) => ({ month: m, value: 0 }));

  const userIds = users.map((u) => u.userId);
  const totalStaff = userIds.length;

  const { data: rows } = await supabase
    .from("attendance_daily")
    .select("attendanceDate, status")
    .in("userId", userIds)
    .gte("attendanceDate", `${year}-01-01`)
    .lte("attendanceDate", `${year}-12-31`);

  return MONTH_LABELS.map((month, idx) => {
    const monthRows = (rows ?? []).filter((r) => {
      const d = new Date(r.attendanceDate);
      return d.getFullYear() === year && d.getMonth() === idx;
    });
    const workingDays = new Set(monthRows.map((r) => r.attendanceDate)).size;
    if (workingDays === 0) return { month, value: 0 };
    const present = monthRows.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE",
    ).length;
    return {
      month,
      value: Math.min(
        Math.round((present / (totalStaff * workingDays)) * 100),
        100,
      ),
    };
  });
}

export async function getTodayAttendance(
  collegeId: number,
  role: string,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResult<TodayRow>> {
  const today = todayDate();
  const { users, totalCount } = await getUsersForRolePaginated(
    collegeId,
    role,
    page,
    limit,
  );
  if (users.length === 0) return { data: [], totalCount: 0 };

  const userIds = users.map((u) => u.userId);
  const isFaculty = role === "Faculty";

  const { data: dailyRows } = await supabase
    .from("attendance_daily")
    .select(
      "attendanceDailyId, userId, checkIn, checkOut, status, classesTaken",
    )
    .in("userId", userIds)
    .eq("attendanceDate", today);

  const dailyMap = new Map((dailyRows ?? []).map((r) => [r.userId, r]));
  const dailyIds = (dailyRows ?? []).map((r) => r.attendanceDailyId);

  const adjMap = new Map<
    number,
    { newCheckIn: string | null; newCheckOut: string | null }
  >();
  if (dailyIds.length > 0) {
    const { data: adjs } = await supabase
      .from("attendance_adjustments")
      .select("adjustmentId, attendanceDailyId, newCheckIn, newCheckOut")
      .in("attendanceDailyId", dailyIds)
      .order("adjustmentId", { ascending: false });
    for (const a of adjs ?? []) {
      if (!adjMap.has(a.attendanceDailyId))
        adjMap.set(a.attendanceDailyId, {
          newCheckIn: a.newCheckIn,
          newCheckOut: a.newCheckOut,
        });
    }
  }

  // Monthly attendance % for this page's users
  const now = new Date();
  const mon = now.getMonth();
  const yr = now.getFullYear();
  const start = `${yr}-${String(mon + 1).padStart(2, "0")}-01`;
  const end = new Date(yr, mon + 1, 0).toISOString().split("T")[0];

  const { data: monthRows } = await supabase
    .from("attendance_daily")
    .select("userId, status, attendanceDate")
    .in("userId", userIds)
    .gte("attendanceDate", start)
    .lte("attendanceDate", end);

  const workingDays =
    new Set((monthRows ?? []).map((r) => r.attendanceDate)).size || 1;
  const pctMap = new Map<number, number>();
  for (const uid of userIds) {
    const userRows = (monthRows ?? []).filter((r) => r.userId === uid);
    const present = userRows.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE",
    ).length;
    pctMap.set(uid, Math.round((present / workingDays) * 100));
  }

  const data = users.map((u) => {
    const daily = dailyMap.get(u.userId);
    const adj = daily ? (adjMap.get(daily.attendanceDailyId) ?? null) : null;
    const ci = adj?.newCheckIn ?? daily?.checkIn ?? null;
    const co = adj?.newCheckOut ?? daily?.checkOut ?? null;
    return {
      userId: u.userId,
      name: u.fullName,
      checkIn: formatTime(ci),
      checkOut: formatTime(co),
      status: daily?.status ?? "—",
      classesTaken: isFaculty ? (daily?.classesTaken ?? 0) : null,
      attendancePct: daily ? `${pctMap.get(u.userId) ?? 0}%` : "—",
    };
  });

  return { data, totalCount };
}

export async function getMonthDetail(
  collegeId: number,
  role: string,
  year: number,
  monthIndex: number,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResult<MonthDetailRow>> {
  const { users, totalCount } = await getUsersForRolePaginated(
    collegeId,
    role,
    page,
    limit,
  );
  if (users.length === 0) return { data: [], totalCount: 0 };

  const userIds = users.map((u) => u.userId);
  const start = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const end = new Date(year, monthIndex + 1, 0).toISOString().split("T")[0];

  const { data: rows } = await supabase
    .from("attendance_daily")
    .select("userId, status, attendanceDate")
    .in("userId", userIds)
    .gte("attendanceDate", start)
    .lte("attendanceDate", end);

  const workingDays =
    new Set((rows ?? []).map((r) => r.attendanceDate)).size || 1;

  const data = users.map((u) => {
    const userRows = (rows ?? []).filter((r) => r.userId === u.userId);
    const presentDays = userRows.filter((r) => r.status === "PRESENT").length;
    const lateDays = userRows.filter((r) => r.status === "LATE").length;
    const absentDays = userRows.filter((r) => r.status === "ABSENT").length;
    const leaves = userRows.filter((r) => r.status === "LEAVE").length;
    const pct = Math.min(
      Math.round(((presentDays + lateDays) / workingDays) * 100),
      100,
    );

    return {
      name: u.fullName,
      presentDays: presentDays + lateDays,
      absentDays,
      leaves,
      attendancePct: `${pct}%`,
      lateCheckins: lateDays,
      performance:
        pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : "Needs Improvement",
    };
  });

  return { data, totalCount };
}
