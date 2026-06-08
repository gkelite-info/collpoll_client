import { supabase } from "@/lib/supabaseClient";

export type EmployeeLeaveTaggedRole =
  | "Admin"
  | "Faculty"
  | "Finance"
  | "FinanceManager"
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
};

export type EmployeeLeaveTagFetchRole = EmployeeLeaveTaggedRole | "AllStaff";

const mapUsersToOptions = (
  rows: { userId: number; fullName: string | null; profileUrl?: string | null }[],
  taggedRole: EmployeeLeaveTaggedRole,
) =>
  rows.map((row) => ({
    taggedUserId: row.userId,
    taggedRole,
    label: row.fullName?.trim() || `User ${row.userId}`,
    roleLabel: tagRoleLabels[taggedRole],
    profileUrl: row.profileUrl ?? null,
  }));

const tagRoleLabels: Record<EmployeeLeaveTaggedRole, string> = {
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance Executive",
  FinanceManager: "Finance Manager",
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
) {
  const { data: registrations, error: registrationError } = await supabase
    .from(table)
    .select("userId")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (registrationError) throw registrationError;

  const userIds = Array.from(
    new Set((registrations ?? []).map((row) => row.userId as number)),
  ).filter((userId) => userId !== excludeUserId);
  if (!userIds.length) return [];

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("userId, fullName")
    .in("userId", userIds)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .order("fullName", { ascending: true });

  if (usersError) throw usersError;

  return mapUsersToOptions(await attachProfileUrls(users ?? []), taggedRole);
}

async function fetchFacultyOptions(
  collegeId: number,
  collegeEducationType?: string | null,
  excludeUserId?: number | null,
) {
  let query = supabase
    .from("faculty")
    .select("userId, fullName")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

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

    query = query.in("collegeEducationId", educationIds);
  }

  if (excludeUserId) {
    query = query.neq("userId", excludeUserId);
  }

  const { data, error } = await query.order("fullName", { ascending: true });
  if (error) throw error;

  return mapUsersToOptions(await attachProfileUrls(data ?? []), "Faculty");
}

async function fetchAdminOptions(
  collegeId: number,
  collegeEducationType?: string | null,
  excludeUserId?: number | null,
) {
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
    .from("admins")
    .select("userId, fullName")
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (excludeUserId) {
    query = query.neq("userId", excludeUserId);
  }

  const filters = [`collegeEducationId.eq.${collegeEducationId}`];
  if (mappedAdminIds.length) {
    filters.push(`adminId.in.(${mappedAdminIds.join(",")})`);
  }
  query = query.or(filters.join(","));

  const { data, error } = await query.order("fullName", { ascending: true });
  if (error) throw error;

  return mapUsersToOptions(await attachProfileUrls(data ?? []), "Admin");
}

async function fetchFinanceManagerOptions(
  collegeId: number,
  excludeUserId?: number | null,
) {
  const params = new URLSearchParams({ collegeId: String(collegeId) });

  if (excludeUserId) {
    params.set("excludeUserId", String(excludeUserId));
  }

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

async function fetchAllStaffOptions(
  collegeId: number,
  excludeUserId?: number | null,
) {
  let query = supabase
    .from("users")
    .select("userId, fullName, role")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .not(
      "role",
      "in",
      "(Student,Parent,CollegeHr,CollegeAdmin,HR,Hr)",
    );

  if (excludeUserId) {
    query = query.neq("userId", excludeUserId);
  }

  const { data, error } = await query.order("fullName", { ascending: true });

  if (error) throw error;

  const usersWithProfiles = await attachProfileUrls(
    ((data ?? []) as { userId: number; fullName: string | null; role: string | null }[])
      .map((user) => ({
        userId: user.userId,
        fullName: user.fullName,
        role: user.role,
      })),
  );

  const options = usersWithProfiles
    .map<EmployeeLeaveTagOption | null>((user) => {
      const roleKey = normalizeUserRoleKey(user.role);
      if (allStaffExcludedRoleKeys.has(roleKey)) return null;

      const taggedRole = getTaggedRoleFromUserRole(user.role);
      if (!taggedRole) return null;
      if (allStaffExcludedTaggedRoles.has(taggedRole)) return null;

      return {
        taggedUserId: user.userId,
        taggedRole,
        label: user.fullName?.trim() || `User ${user.userId}`,
        roleLabel: tagRoleLabels[taggedRole],
        profileUrl: user.profileUrl,
      } satisfies EmployeeLeaveTagOption;
    })
    .filter((option): option is EmployeeLeaveTagOption => Boolean(option));

  return options.sort((first, second) => {
    const firstRoleIndex = staffRoleOrder.indexOf(first.taggedRole);
    const secondRoleIndex = staffRoleOrder.indexOf(second.taggedRole);

    if (firstRoleIndex !== secondRoleIndex) {
      return firstRoleIndex - secondRoleIndex;
    }

    return first.label.localeCompare(second.label);
  });
}

export async function fetchEmployeeLeaveTagOptions({
  collegeId,
  taggedRole,
  collegeEducationType,
  excludeUserId,
}: FetchEmployeeLeaveTagOptionsParams): Promise<EmployeeLeaveTagOption[]> {
  if (taggedRole === "Admin") {
    return fetchAdminOptions(collegeId, collegeEducationType, excludeUserId);
  }

  if (taggedRole === "Faculty") {
    return fetchFacultyOptions(collegeId, collegeEducationType, excludeUserId);
  }

  if (taggedRole === "CollegeHr") {
    return fetchRegisteredUserOptions(
      "college_hr",
      collegeId,
      taggedRole,
      excludeUserId,
    );
  }

  if (taggedRole === "CollegeAdmin") {
    return fetchRegisteredUserOptions(
      "college_admin",
      collegeId,
      taggedRole,
      excludeUserId,
    );
  }

  if (taggedRole === "FinanceManager") {
    return fetchFinanceManagerOptions(collegeId, excludeUserId);
  }

  if (taggedRole === "AllStaff") {
    return fetchAllStaffOptions(collegeId, excludeUserId);
  }

  let query = supabase
    .from("users")
    .select("userId, fullName")
    .eq("collegeId", collegeId)
    .eq("role", taggedRole)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (excludeUserId) {
    query = query.neq("userId", excludeUserId);
  }

  const { data, error } = await query.order("fullName", { ascending: true });

  if (error) throw error;

  return mapUsersToOptions(await attachProfileUrls(data ?? []), taggedRole);
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
      taggedRole: tag.taggedRole,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })),
  );

  if (error) throw error;
}
