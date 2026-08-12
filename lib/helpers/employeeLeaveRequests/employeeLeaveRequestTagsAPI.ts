import { supabase } from "@/lib/supabaseClient";

export type EmployeeLeaveTaggedRole =
  | "Admin"
  | "Faculty"
  | "Finance"
  | "FinanceManager"
  | "Accountant"
  | "CollegeHr"
  | "CollegeAdmin"
  | "PlacementOfficer"
  | "WellbeingExecutive"
  | "WellbeingManager";

export type EmployeeLeaveTagSelection = {
  taggedUserId: number;
  taggedRole: EmployeeLeaveTaggedRole;
};

export type EmployeeLeaveTagOption = EmployeeLeaveTagSelection & {
  label: string;
  roleLabel?: string;
  profileUrl?: string | null;
};

type FetchEmployeeLeaveTagOptionsParams = {
  collegeId: number;
  taggedRole: EmployeeLeaveTagFetchRole;
  collegeEducationType?: string | null;
  excludeUserId?: number | null;
  page?: number;
  limit?: number;
  searchQuery?: string;
};

export type EmployeeLeaveTagFetchRole = EmployeeLeaveTaggedRole | "AllStaff";

const mapUsersToOptions = (
  rows: { userId: number; fullName?: string | null; profileUrl?: string | null; users?: any; user_profile?: any }[],
  taggedRole: EmployeeLeaveTaggedRole,
) =>
  rows.map((row) => {
    // Handle both direct users table rows and joined rows
    const fullName = row.users?.fullName || row.fullName;
    let profileUrl = row.users?.user_profile?.[0]?.profileUrl ?? row.users?.user_profile?.profileUrl ?? row.user_profile?.[0]?.profileUrl ?? row.user_profile?.profileUrl ?? row.profileUrl ?? null;
    
    return {
      taggedUserId: row.userId,
      taggedRole,
      label: fullName?.trim() || `User ${row.userId}`,
      roleLabel: tagRoleLabels[taggedRole],
      profileUrl,
    };
  });

const tagRoleLabels: Record<EmployeeLeaveTaggedRole, string> = {
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance Executive",
  FinanceManager: "Finance Manager",
  Accountant: "Accountant",
  CollegeHr: "HR",
  CollegeAdmin: "College Admin",
  PlacementOfficer: "Placement Officer",
  WellbeingExecutive: "Wellbeing Executive",
  WellbeingManager: "Wellbeing Manager",
};

const userRoleToTaggedRole: Partial<Record<string, EmployeeLeaveTaggedRole>> = {
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance",
  FinanceExecutive: "Finance",
  FinanceManager: "FinanceManager",
  FinanceExecutiveRole: "Finance",
  Accountant: "Accountant",
  CollegeHr: "CollegeHr",
  HR: "CollegeHr",
  Hr: "CollegeHr",
  CollegeAdmin: "CollegeAdmin",
  PlacementOfficer: "PlacementOfficer",
  WellbeingExecutive: "WellbeingExecutive",
  WellbeingManager: "WellbeingManager",
};

const normalizedUserRoleToTaggedRole: Partial<
  Record<string, EmployeeLeaveTaggedRole>
> = {
  admin: "Admin",
  faculty: "Faculty",
  finance: "Finance",
  financeexecutive: "Finance",
  financemanager: "FinanceManager",
  accountant: "Accountant",
  collegehr: "CollegeHr",
  hr: "CollegeHr",
  collegeadmin: "CollegeAdmin",
  placementofficer: "PlacementOfficer",
  wellbeingexecutive: "WellbeingExecutive",
  wellbeingmanager: "WellbeingManager",
};

const staffRoleOrder: EmployeeLeaveTaggedRole[] = [
  "Faculty",
  "Admin",
  "FinanceManager",
  "Finance",
  "Accountant",
  "PlacementOfficer",
  "WellbeingManager",
  "WellbeingExecutive",
];

const allStaffExcludedTaggedRoles = new Set<EmployeeLeaveTaggedRole>([
  "CollegeHr",
  "CollegeAdmin",
]);

const allStaffExcludedRoleKeys = new Set([
  "student",
  "parent",
  "collegehr",
  "hr",
  "collegeadmin",
]);

const normalizeUserRoleKey = (role?: string | null) =>
  role ? role.replace(/[\s_-]+/g, "").toLowerCase() : "";

const getTaggedRoleFromUserRole = (role?: string | null) => {
  if (!role) return null;
  return (
    userRoleToTaggedRole[role] ??
    normalizedUserRoleToTaggedRole[normalizeUserRoleKey(role)] ??
    null
  );
};

const attachProfileUrls = async <
  T extends { userId: number; fullName: string | null },
>(
  rows: T[],
) => {
  const userIds = Array.from(new Set(rows.map((row) => row.userId))).filter(
    Boolean,
  );

  if (!userIds.length) return rows.map((row) => ({ ...row, profileUrl: null }));

  const { data, error } = await supabase
    .from("user_profile")
    .select("userId, profileUrl")
    .in("userId", userIds)
    .eq("is_deleted", false);

  if (error) throw error;

  const profileByUserId = new Map(
    (data ?? []).map((profile) => [
      profile.userId as number,
      profile.profileUrl as string | null,
    ]),
  );

  return rows.map((row) => ({
    ...row,
    profileUrl: profileByUserId.get(row.userId) ?? null,
  }));
};

async function fetchRegisteredUserOptions(
  table: "college_hr" | "college_admin",
  collegeId: number,
  taggedRole: "CollegeHr" | "CollegeAdmin",
  excludeUserId?: number | null,
  page = 1,
  limit = 10,
  searchQuery = ""
) {
  const fromOffset = (page - 1) * limit;
  const toOffset = fromOffset + limit - 1;

  let query = supabase
    .from("users")
    .select(`
      userId,
      fullName,
      user_profile ( profileUrl ),
      ${table}!inner(userId)
    `)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .eq(`${table}.collegeId`, collegeId)
    .eq(`${table}.isActive`, true)
    .eq(`${table}.is_deleted`, false)
    .is(`${table}.deletedAt`, null);

  if (excludeUserId) query = query.neq("userId", excludeUserId);
  if (searchQuery) query = query.ilike("fullName", `%${searchQuery}%`);

  const { data, error } = await query
    .order("fullName", { ascending: true })
    .range(fromOffset, toOffset);

  if (error) throw error;
  return mapUsersToOptions(data || [], taggedRole);
}


async function fetchFacultyOptions(
  collegeId: number,
  collegeEducationType?: string | null,
  excludeUserId?: number | null,
  page = 1,
  limit = 10,
  searchQuery = ""
) {
  const fromOffset = (page - 1) * limit;
  const toOffset = fromOffset + limit - 1;
  let query = supabase
    .from("users")
    .select(`
      userId,
      fullName,
      user_profile ( profileUrl ),
      faculty!inner(userId, collegeEducationId)
    `)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .eq("faculty.collegeId", collegeId)
    .eq("faculty.isActive", true)
    .is("faculty.deletedAt", null);

  if (collegeEducationType) {
    const educationTypeNames = collegeEducationType
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean);

    const { data: education, error: educationError } = await supabase
      .from("college_education")
      .select("collegeEducationId")
      .eq("collegeId", collegeId)
      .in("collegeEducationType", educationTypeNames)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (educationError) throw educationError;
    const educationIds = (education ?? [])
      .map((row) => row.collegeEducationId as number)
      .filter(Boolean);

    if (!educationIds.length) return [];

    query = query.in("faculty.collegeEducationId", educationIds);
  }

  if (excludeUserId) query = query.neq("userId", excludeUserId);
  if (searchQuery) query = query.ilike("fullName", `%${searchQuery}%`);

  const { data, error } = await query
    .order("fullName", { ascending: true })
    .range(fromOffset, toOffset);

  if (error) throw error;
  return mapUsersToOptions(data || [], "Faculty");
}

async function fetchAdminOptions(
  collegeId: number,
  collegeEducationType?: string | null,
  excludeUserId?: number | null,
  page = 1,
  limit = 10,
  searchQuery = ""
) {
  const fromOffset = (page - 1) * limit;
  const toOffset = fromOffset + limit - 1;
  if (!collegeEducationType?.trim()) return [];

  let collegeEducationId: number | null = null;
  let mappedAdminIds: number[] | null = null;

  const { data: education, error: educationError } = await supabase
    .from("college_education")
    .select("collegeEducationId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationType", collegeEducationType.trim())
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle();

  if (educationError) throw educationError;
  if (!education?.collegeEducationId) return [];
  collegeEducationId = education.collegeEducationId;

  const { data: adminEducationTypes, error: adminEducationError } =
    await supabase
      .from("admin_education_types")
      .select("adminId")
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null);

  if (adminEducationError) throw adminEducationError;

  mappedAdminIds = Array.from(
    new Set(
      (adminEducationTypes ?? [])
        .map((row) => row.adminId as number)
        .filter(Boolean),
    ),
  );

  let query = supabase
    .from("users")
    .select(`
      userId,
      fullName,
      user_profile ( profileUrl ),
      admins!admins_userId_fkey!inner(userId, collegeEducationId, adminId)
    `)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .eq("admins.collegeId", collegeId)
    .eq("admins.is_deleted", false)
    .is("admins.deletedAt", null);

  if (excludeUserId) query = query.neq("userId", excludeUserId);
  if (searchQuery) query = query.ilike("fullName", `%${searchQuery}%`);

  const filters = [`collegeEducationId.eq.${collegeEducationId}`];
  if (mappedAdminIds.length) {
    filters.push(`adminId.in.(${mappedAdminIds.join(",")})`);
  }
  query = query.or(filters.join(","), { foreignTable: "admins" });

  const { data, error } = await query
    .order("fullName", { ascending: true })
    .range(fromOffset, toOffset);

  if (error) throw error;
  return mapUsersToOptions(data || [], "Admin");
}

async function fetchFinanceManagerOptions(
  collegeId: number,
  excludeUserId?: number | null,
  page = 1,
  limit = 10,
  searchQuery = ""
) {
  const params = new URLSearchParams({ collegeId: String(collegeId) });

  if (excludeUserId) params.set("excludeUserId", String(excludeUserId));
  if (searchQuery) params.set("searchQuery", searchQuery);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await fetch(
    `/api/employee-leave-tags/finance-managers?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Unable to fetch finance managers.");
  }

  const payload = (await response.json()) as {
    options?: EmployeeLeaveTagOption[];
  };

  return payload.options ?? [];
}

async function fetchAccountantOptions(
  collegeId: number,
  excludeUserId?: number | null,
  page = 1,
  limit = 10,
  searchQuery = ""
) {
  const fromOffset = (page - 1) * limit;
  const toOffset = fromOffset + limit - 1;
  let roleUsersQuery = supabase
    .from("users")
    .select(`
      userId,
      fullName,
      user_profile ( profileUrl )
    `)
    .eq("collegeId", collegeId)
    .eq("role", "Accountant")
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (excludeUserId) roleUsersQuery = roleUsersQuery.neq("userId", excludeUserId);
  if (searchQuery) roleUsersQuery = roleUsersQuery.ilike("fullName", `%${searchQuery}%`);

  const { data, error } = await roleUsersQuery
    .order("fullName", { ascending: true })
    .range(fromOffset, toOffset);

  if (error) throw error;

  return mapUsersToOptions(data || [], "Accountant");
}

const mergeUniqueTagOptions = (options: EmployeeLeaveTagOption[]) =>
  Array.from(
    new Map(
      options.map((option) => [
        `${option.taggedRole}-${option.taggedUserId}`,
        option,
      ]),
    ).values(),
  );

const toEmployeeLeaveTagDbRole = (
  taggedRole: EmployeeLeaveTaggedRole,
): EmployeeLeaveTaggedRole =>
  taggedRole === "Accountant" ? "Finance" : taggedRole;

async function fetchAllStaffOptions(
  collegeId: number,
  excludeUserId?: number | null,
  page = 1,
  limit = 10,
  searchQuery = ""
) {
  // Not used directly when UI renders per-role groups, but kept for compatibility
  return [];
}

export async function fetchEmployeeLeaveTagOptions({
  collegeId,
  taggedRole,
  collegeEducationType,
  excludeUserId,
  page,
  limit,
  searchQuery
}: FetchEmployeeLeaveTagOptionsParams): Promise<EmployeeLeaveTagOption[]> {
  if (taggedRole === "Admin") {
    return fetchAdminOptions(collegeId, collegeEducationType, excludeUserId, page, limit, searchQuery);
  }

  if (taggedRole === "Faculty") {
    return fetchFacultyOptions(collegeId, collegeEducationType, excludeUserId, page, limit, searchQuery);
  }

  if (taggedRole === "CollegeHr") {
    return fetchRegisteredUserOptions("college_hr", collegeId, taggedRole, excludeUserId, page, limit, searchQuery);
  }

  if (taggedRole === "CollegeAdmin") {
    return fetchRegisteredUserOptions("college_admin", collegeId, taggedRole, excludeUserId, page, limit, searchQuery);
  }

  if (taggedRole === "FinanceManager") {
    return fetchFinanceManagerOptions(collegeId, excludeUserId, page, limit, searchQuery);
  }

  if (taggedRole === "Accountant") {
    return fetchAccountantOptions(collegeId, excludeUserId, page, limit, searchQuery);
  }

  if (taggedRole === "AllStaff") {
    return fetchAllStaffOptions(collegeId, excludeUserId, page, limit, searchQuery);
  }

  const fromOffset = ((page || 1) - 1) * (limit || 10);
  const toOffset = fromOffset + (limit || 10) - 1;

  let query = supabase
    .from("users")
    .select(`
      userId,
      fullName,
      user_profile ( profileUrl )
    `)
    .eq("collegeId", collegeId)
    .eq("role", taggedRole)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (excludeUserId) query = query.neq("userId", excludeUserId);
  if (searchQuery) query = query.ilike("fullName", `%${searchQuery}%`);

  const { data, error } = await query
    .order("fullName", { ascending: true })
    .range(fromOffset, toOffset);

  if (error) throw error;
  return mapUsersToOptions(data || [], taggedRole);
}

export async function saveEmployeeLeaveRequestTags(
  employeeLeaveRequestId: number,
  tags: EmployeeLeaveTagSelection[],
) {
  if (!tags.length) return;

  const now = new Date().toISOString();
  const uniqueTags = Array.from(
    new Map(tags.map((tag) => [tag.taggedUserId, tag])).values(),
  );

  const { error } = await supabase.from("employee_leave_request_tags").insert(
    uniqueTags.map((tag) => ({
      employeeLeaveRequestId,
      taggedUserId: tag.taggedUserId,
      taggedRole: toEmployeeLeaveTagDbRole(tag.taggedRole),
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })),
  );

  if (error) throw error;
}
