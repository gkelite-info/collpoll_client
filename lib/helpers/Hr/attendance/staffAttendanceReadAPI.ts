import { supabase } from "@/lib/supabaseClient";
import { 
  GetAttendanceStaffParams, 
  GetAttendanceStaffResult, 
  AttendanceStaffRow, 
  AttendanceStatsResult,
  formatTime,
  formatMinutes,
  todayDate,
  capitalise,
  ROLE_DISPLAY_MAP,
  EXCLUDED_ROLES
} from "./staffAttendanceTypes";

export async function getAttendanceStaff(
  params: GetAttendanceStaffParams,
): Promise<GetAttendanceStaffResult> {
  const { collegeId, search = "", page = 1, limit = 20, date, role, tabStatus } = params;
  const today = date || todayDate();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let matchedEmployeeUserIds: number[] = [];
  const term = search.trim();
  if (term) {
    const { data: empMatches } = await supabase
      .from("employee_ids")
      .select("userId")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .ilike("employeeId", `%${term}%`);
    matchedEmployeeUserIds = (empMatches ?? [])
      .map((r: any) => Number(r.userId))
      .filter(Boolean);
  }

  let usersQuery = supabase
    .from("users")
    .select("userId, fullName, role", { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .eq("isActive", true)
    .not("role", "in", `(${EXCLUDED_ROLES.join(",")})`)
    .order("userId", { ascending: true })
    .range(from, to);

  if (term) {
    if (matchedEmployeeUserIds.length > 0) {
      usersQuery = usersQuery.or(
        `fullName.ilike.%${term}%,userId.in.(${matchedEmployeeUserIds.join(",")})`,
      );
    } else {
      usersQuery = usersQuery.ilike("fullName", `%${term}%`);
    }
  }

  if (tabStatus && tabStatus !== "total") {
    let matchedUserIdsFromAttendance: number[] = [];

    let attQuery = supabase
      .from("attendance_daily")
      .select("userId")
      .eq("attendanceDate", today);

    if (tabStatus === "present") {
      attQuery = attQuery.or("status.ilike.present,status.ilike.late,status.ilike.halfday");
    } else if (tabStatus === "late") {
      attQuery = attQuery.or("lateByMinutes.gt.0,status.ilike.late");
    } else if (tabStatus === "absent") {
      attQuery = attQuery.ilike("status", "absent");
    } else if (tabStatus === "leave") {
      attQuery = attQuery.ilike("status", "leave");
    }

    const { data: attMatches } = await attQuery;
    matchedUserIdsFromAttendance = (attMatches ?? []).map((r: any) => Number(r.userId)).filter(Boolean);

    if (tabStatus === "absent") {
      const { data: allAtt } = await supabase
        .from("attendance_daily")
        .select("userId")
        .eq("attendanceDate", today);
      const allAttIds = new Set((allAtt ?? []).map(r => r.userId));

      let allUsersQ = supabase
        .from("users")
        .select("userId")
        .eq("collegeId", collegeId)
        .eq("is_deleted", false)
        .eq("isActive", true)
        .not("role", "in", `(${EXCLUDED_ROLES.join(",")})`);
      
      if (role) {
        allUsersQ = allUsersQ.eq("role", role);
      }
      
      const { data: allUsers } = await allUsersQ;
      const noRecordUserIds = (allUsers ?? [])
        .map(u => u.userId)
        .filter(id => !allAttIds.has(id));
      
      matchedUserIdsFromAttendance = [...matchedUserIdsFromAttendance, ...noRecordUserIds];
    }

    if (matchedUserIdsFromAttendance.length === 0) {
      return { staff: [], totalCount: 0 };
    }

    usersQuery = usersQuery.in("userId", matchedUserIdsFromAttendance);
  }

  if (role) {
    usersQuery = usersQuery.eq("role", role);
  }

  const { data: usersData, error: usersError, count } = await usersQuery;
  if (usersError) throw new Error(usersError.message);
  if (!usersData || usersData.length === 0) {
    return { staff: [], totalCount: count || 0 };
  }

  const userIds = usersData.map((u: any) => u.userId);

  const { data: empData } = await supabase
    .from("employee_ids")
    .select("userId, employeeId")
    .in("userId", userIds)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

  const empMap = new Map();
  if (empData) {
    empData.forEach((e: any) => empMap.set(e.userId, e.employeeId));
  }

  const { data: dailyData, error: dailyError } = await supabase
    .from("attendance_daily")
    .select(
      "attendanceDailyId, userId, checkIn, checkOut, status, totalMinutes, lateByMinutes, earlyOutMinutes, classesTaken, isManual",
    )
    .in("userId", userIds)
    .eq("attendanceDate", today);
  if (dailyError) throw new Error(dailyError.message);

  const attDailyIds = (dailyData ?? [])
    .map((r: any) => r.attendanceDailyId)
    .filter(Boolean);
  let adjSet = new Set<number>();

  if (attDailyIds.length > 0) {
    const { data: adjData } = await supabase
      .from("attendance_adjustments")
      .select("attendanceDailyId")
      .in("attendanceDailyId", attDailyIds);
    if (adjData) {
      adjData.forEach((a: any) => adjSet.add(a.attendanceDailyId));
    }
  }

  const attMap = new Map();
  if (dailyData) {
    dailyData.forEach((r: any) => attMap.set(r.userId, r));
  }

  const staff: AttendanceStaffRow[] = usersData.map((u: any) => {
    const r = attMap.get(u.userId);
    const identifierId = empMap.get(u.userId) || null;
    const mappedRole = ROLE_DISPLAY_MAP[u.role] || u.role || "Unknown";

    return {
      userId: u.userId,
      identifierId,
      fullName: u.fullName || "",
      role: mappedRole,
      rawRole: u.role,
      attendanceDailyId: r?.attendanceDailyId || null,
      checkIn: formatTime(r?.checkIn),
      checkOut: formatTime(r?.checkOut),
      rawCheckIn: r?.checkIn || null,
      rawCheckOut: r?.checkOut || null,
      totalHours: formatMinutes(r?.totalMinutes),
      status: capitalise(r?.status) || "Absent",
      lateByMinutes: r?.lateByMinutes || 0,
      earlyOutMinutes: r?.earlyOutMinutes || 0,
      classesTaken: r?.classesTaken || null,
      hasAdjustment: r?.isManual || adjSet.has(r?.attendanceDailyId) || false,
      reason: null,
    };
  });

  return { staff, totalCount: count || 0 };
}

export async function getAttendanceStaffStats(
  params: Omit<GetAttendanceStaffParams, "page" | "limit" | "tabStatus">,
): Promise<AttendanceStatsResult> {
  const { collegeId, search = "", date, role } = params;
  const today = date || todayDate();

  // 1. Fetch matching user IDs first (like in getAttendanceStaff)
  let matchedEmployeeUserIds: number[] = [];
  const term = search.trim();
  if (term) {
    const { data: empMatches } = await supabase
      .from("employee_ids")
      .select("userId")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .ilike("employeeId", `%${term}%`);
    matchedEmployeeUserIds = (empMatches ?? [])
      .map((r: any) => Number(r.userId))
      .filter(Boolean);
  }

  let usersQuery = supabase
    .from("users")
    .select("userId")
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .eq("isActive", true)
    .not("role", "in", `(${EXCLUDED_ROLES.join(",")})`);

  if (term) {
    if (matchedEmployeeUserIds.length > 0) {
      usersQuery = usersQuery.or(
        `fullName.ilike.%${term}%,userId.in.(${matchedEmployeeUserIds.join(",")})`,
      );
    } else {
      usersQuery = usersQuery.ilike("fullName", `%${term}%`);
    }
  }

  if (role) {
    const reverseRoleMap: Record<string, string> = {
      "College Admin": "CollegeAdmin",
      Admin: "Admin",
      Faculty: "Faculty",
      "Finance Executive": "Finance",
      "Finance Manager": "FinanceManager",
      "HR Manager": "CollegeHr",
      Placement: "PlacementOfficer",
      "Wellbeing Executive": "WellbeingExecutive",
      "Wellbeing Manager": "WellbeingManager",
      "Ground Staff": "GroundStaff",
      "Super Admin": "SuperAdmin",
    };
    const dbRole = reverseRoleMap[role] || role;
    usersQuery = role === "Placement"
      ? usersQuery.in("role", ["Placement", "PlacementOfficer"])
      : usersQuery.eq("role", dbRole);
  }

  const { data: users, error: usersError } = await usersQuery;
  if (usersError || !users || users.length === 0) {
    return { total: 0, present: 0, absent: 0, late: 0, leave: 0 };
  }

  const userIds = users.map((u) => u.userId);
  const total = userIds.length;

  // 2. Fetch today's attendance for those users
  const { data: dailyRows } = await supabase
    .from("attendance_daily")
    .select("status, lateByMinutes")
    .in("userId", userIds)
    .eq("attendanceDate", today);

  let present = 0;
  let absent = 0;
  let late = 0;
  let leave = 0;

  if (dailyRows) {
    for (const r of dailyRows) {
      const s = r.status?.toUpperCase() || "";
      
      if (["PRESENT", "LATE", "HALFDAY"].includes(s)) present++;
      if (s === "ABSENT") absent++;
      if (s === "LEAVE") leave++;
      if ((r.lateByMinutes ?? 0) > 0 || s === "LATE") late++;
    }
  }

  return { total, present, absent, late, leave };
}
