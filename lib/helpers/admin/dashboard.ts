import { supabase } from "@/lib/supabaseClient";

export type AdminUserRoleCounts = {
  ADMIN: number;
  FACULTY: number;
  STUDENT: number;
  PARENT: number;
  FINANCE: number;
  FINANCE_MANAGER: number;
  ACCOUNTANT: number;
  COLLEGE_HR: number;
  PLACEMENT_OFFICER: number;
  WELLBEING_EXECUTIVE: number;
  WELLBEING_MANAGER: number;
  GROUND_STAFF: number;
};

export async function getAdminUserRoleCounts(
  collegeId: number,
): Promise<AdminUserRoleCounts> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false);

  if (error) throw error;

  const counts: AdminUserRoleCounts = {
    ADMIN: 0, FACULTY: 0, STUDENT: 0, PARENT: 0, FINANCE: 0,
    FINANCE_MANAGER: 0, ACCOUNTANT: 0, COLLEGE_HR: 0,
    PLACEMENT_OFFICER: 0, WELLBEING_EXECUTIVE: 0,
    WELLBEING_MANAGER: 0, GROUND_STAFF: 0,
  };

  const roleKeys: Record<string, keyof AdminUserRoleCounts> = {
    admin: "ADMIN", faculty: "FACULTY", student: "STUDENT", parent: "PARENT",
    finance: "FINANCE", financemanager: "FINANCE_MANAGER",
    accountant: "ACCOUNTANT", collegehr: "COLLEGE_HR",
    placementofficer: "PLACEMENT_OFFICER",
    wellbeingexecutive: "WELLBEING_EXECUTIVE",
    wellbeingmanager: "WELLBEING_MANAGER", groundstaff: "GROUND_STAFF",
  };

  for (const user of data ?? []) {
    const normalizedRole = String(user.role ?? "").toLowerCase().replace(/[\s_-]/g, "");
    const key = roleKeys[normalizedRole];
    if (key) counts[key] += 1;
  }

  // Wellbeing users can exist without an active wellbeing profile or without a
  // college-education assignment (for example, hostel-only registrations). The
  // Total Users tables are education-scoped, so their cards must use the same
  // direct/inherited education membership instead of the broader users.role count.
  const { data: wellbeingRows, error: wellbeingError } = await supabase
    .from("well_beings")
    .select("wellBeingId, userId, roleType, byManager")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (wellbeingError) throw wellbeingError;

  const wellbeingIds = (wellbeingRows ?? []).map((row) => row.wellBeingId);
  const { data: wellbeingDetails, error: detailsError } = wellbeingIds.length
    ? await supabase
        .from("wellbeing_college_details")
        .select("wellBeingId")
        .in("wellBeingId", wellbeingIds)
    : { data: [], error: null };

  if (detailsError) throw detailsError;

  const wellbeingIdsWithEducation = new Set(
    (wellbeingDetails ?? []).map((detail) => detail.wellBeingId),
  );
  const managerUserIds = new Set(
    (wellbeingRows ?? [])
      .filter(
        (row) =>
          row.roleType === "wellbeingManager" &&
          wellbeingIdsWithEducation.has(row.wellBeingId),
      )
      .map((row) => row.userId),
  );
  const executiveUserIds = new Set(
    (wellbeingRows ?? [])
      .filter(
        (row) =>
          row.roleType === "wellbeingExecutive" &&
          (wellbeingIdsWithEducation.has(row.wellBeingId) ||
            (row.byManager != null && managerUserIds.has(row.byManager))),
      )
      .map((row) => row.userId),
  );

  counts.WELLBEING_EXECUTIVE = executiveUserIds.size;
  counts.WELLBEING_MANAGER = managerUserIds.size;

  // AdminEducationTable counts memberships per education, so an admin assigned
  // to multiple education types contributes once to every corresponding row.
  // Keep the Admin card aligned with the sum displayed by that table.
  const { data: adminRows, error: adminError } = await supabase
    .from("admins")
    .select("adminId, collegeEducationId")
    .eq("collegeId", collegeId)
    .eq("is_deleted", false);
  if (adminError) throw adminError;

  const adminIds = (adminRows ?? []).map((admin) => admin.adminId);
  const { data: adminMappings, error: adminMappingsError } = adminIds.length
    ? await supabase
        .from("admin_education_types")
        .select("adminId, collegeEducationId")
        .in("adminId", adminIds)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
    : { data: [], error: null };
  if (adminMappingsError) throw adminMappingsError;

  const mappedAdminIds = new Set(
    (adminMappings ?? []).map((mapping) => mapping.adminId),
  );
  const mappedMembershipCount = (adminMappings ?? []).length;
  const legacyPrimaryMembershipCount = (adminRows ?? []).filter(
    (admin) =>
      !mappedAdminIds.has(admin.adminId) && admin.collegeEducationId != null,
  ).length;
  counts.ADMIN = mappedMembershipCount + legacyPrimaryMembershipCount;

  return counts;
}

export async function getAdminDashboardSummary(
  collegeId: number,
  collegeEducationId: number,
) {
  const roleCounts = await getAdminUserRoleCounts(collegeId);
  const totalUsers = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);

  return {
    totalUsers,
    pendingApprovals: 34,
    systemHealth: "Good",
    automations: 12,
  };
}
