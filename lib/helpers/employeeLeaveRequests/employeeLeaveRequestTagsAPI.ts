import { supabase } from "@/lib/supabaseClient";

export type EmployeeLeaveTaggedRole =
  | "Admin"
  | "Faculty"
  | "Finance"
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
};

type FetchEmployeeLeaveTagOptionsParams = {
  collegeId: number;
  taggedRole: EmployeeLeaveTaggedRole;
  collegeEducationType?: string | null;
  excludeUserId?: number | null;
};

const mapUsersToOptions = (
  rows: { userId: number; fullName: string | null }[],
  taggedRole: EmployeeLeaveTaggedRole,
) =>
  rows.map((row) => ({
    taggedUserId: row.userId,
    taggedRole,
    label: row.fullName?.trim() || `User ${row.userId}`,
  }));

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

  return mapUsersToOptions(users ?? [], taggedRole);
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
    const { data: education, error: educationError } = await supabase
      .from("college_education")
      .select("collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("collegeEducationType", collegeEducationType)
      .eq("isActive", true)
      .is("deletedAt", null)
      .maybeSingle();

    if (educationError) throw educationError;
    if (!education?.collegeEducationId) return [];

    query = query.eq("collegeEducationId", education.collegeEducationId);
  }

  if (excludeUserId) {
    query = query.neq("userId", excludeUserId);
  }

  const { data, error } = await query.order("fullName", { ascending: true });
  if (error) throw error;

  return mapUsersToOptions(data ?? [], "Faculty");
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

  return mapUsersToOptions(data ?? [], "Admin");
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

  return mapUsersToOptions(data ?? [], taggedRole);
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
