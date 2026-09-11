import { supabase } from "@/lib/supabaseClient";

export type DashboardRoleKey = "ADMIN" | "FACULTY" | "STUDENT" | "PARENT" | "FINANCE" | "FINANCE_MANAGER" | "ACCOUNTANT" | "COLLEGE_HR" | "PLACEMENT_OFFICER" | "WELLBEING_EXECUTIVE" | "WELLBEING_MANAGER" | "GROUND_STAFF";
export type MemberScope = { collegeId: number; educationId?: number | null; branchId?: number | null };
export type Member = { userId: number; fullName: string; email: string; mobile: string; gender: string | null; role: string; dateOfJoining: string | null };
export const ROLE_ALIASES: Record<DashboardRoleKey, string[]> = {
  ADMIN: ["Admin"], FACULTY: ["Faculty"], STUDENT: ["Student"], PARENT: ["Parent"],
  FINANCE: ["Finance"], FINANCE_MANAGER: ["FinanceManager", "Finance Manager"], ACCOUNTANT: ["Accountant"],
  COLLEGE_HR: ["CollegeHr"], PLACEMENT_OFFICER: ["PlacementOfficer"],
  WELLBEING_EXECUTIVE: ["WellbeingExecutive"], WELLBEING_MANAGER: ["WellbeingManager"], GROUND_STAFF: ["GroundStaff"],
};

// Fetch every matching identifier, rather than silently truncating at PostgREST's row limit.
type IdQuery = {
  order(column: string): {
    range(from: number, to: number): PromiseLike<{ data: unknown[] | null; error: unknown }>;
  };
};
async function readIds(query: IdQuery, column: string) {
  const ids = new Set<number>();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await query.order(column).range(offset, offset + 499);
    if (error) throw error;
    for (const row of data ?? []) {
      const id = Number((row as unknown as Record<string, unknown>)[column]);
      if (id) ids.add(id);
    }
    if ((data?.length ?? 0) < 500) return [...ids];
  }
}

type FacultyAssignment = { facultySectionId: number; facultyId: number; collegeSubjectId: number; collegeSectionsId: number; collegeAcademicYearId: number };
const pendingAssignments = new Map<string, Promise<FacultyAssignment[]>>();

export function getFacultyAssignments(scope: MemberScope, yearId?: number | null, sectionId?: number | null): Promise<FacultyAssignment[]> {
  const key = JSON.stringify([scope.collegeId, scope.educationId ?? null, scope.branchId ?? null, yearId ?? null, sectionId ?? null]);
  const existing = pendingAssignments.get(key);
  if (existing) return existing;
  const pending = loadFacultyAssignments(scope, yearId, sectionId).finally(() => pendingAssignments.delete(key));
  pendingAssignments.set(key, pending);
  return pending;
}

async function loadFacultyAssignments(scope: MemberScope, yearId?: number | null, sectionId?: number | null): Promise<FacultyAssignment[]> {
  const educationSources = scope.educationId ? ["direct", "subject", "section"] : ["direct"];
  const branchSources = scope.branchId ? ["direct", "subject", "section"] : ["direct"];
  const results = await Promise.all(educationSources.flatMap((educationSource) => branchSources.map(async (branchSource) => {
    const subjectRequired = educationSource === "subject" || branchSource === "subject";
    const sectionRequired = educationSource === "section" || branchSource === "section";
    let query = supabase.from("faculty_sections")
      .select(`facultySectionId, facultyId, collegeSubjectId, collegeSectionsId, collegeAcademicYearId, faculty!inner(collegeId, isActive, deletedAt), college_subjects${subjectRequired ? "!inner" : ""}(collegeEducationId, collegeBranchId), college_sections${sectionRequired ? "!inner" : ""}(collegeEducationId, collegeBranchId), education_subject:college_subjects(collegeEducationId), branch_subject:college_subjects(collegeBranchId)`)
      .eq("faculty.collegeId", scope.collegeId).eq("faculty.isActive", true).is("faculty.deletedAt", null)
      .eq("isActive", true).is("deletedAt", null);
    for (const [column, value, source] of [["collegeEducationId", scope.educationId, educationSource], ["collegeBranchId", scope.branchId, branchSource]] as const) {
      if (!value) continue;
      if (source === "direct") query = query.eq(column, value);
      else {
        query = query.is(column, null);
        if (source === "subject") query = query.eq(`college_subjects.${column}`, value);
        else {
          const alias = column === "collegeEducationId" ? "education_subject" : "branch_subject";
          query = query.not(`${alias}.${column}`, "is", null).is(alias, null).eq(`college_sections.${column}`, value);
        }
      }
    }
    if (yearId) query = query.eq("collegeAcademicYearId", yearId);
    if (sectionId) query = query.eq("collegeSectionsId", sectionId);
    const rows: FacultyAssignment[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await query.order("facultySectionId").range(offset, offset + 499);
      if (error) throw error;
      rows.push(...(data ?? []) as unknown as FacultyAssignment[]);
      if ((data?.length ?? 0) < 500) return rows;
    }
  })));
  return [...new Map(results.flat().map((row) => [row.facultySectionId, row])).values()];
}

export async function getFacultyIds(scope: MemberScope) {
  let primary = supabase.from("faculty").select("facultyId")
    .eq("collegeId", scope.collegeId).eq("isActive", true).is("deletedAt", null);
  if (scope.educationId) primary = primary.eq("collegeEducationId", scope.educationId);
  if (scope.branchId) primary = primary.eq("collegeBranchId", scope.branchId);
  if (!scope.educationId && !scope.branchId) return readIds(primary, "facultyId");
  const [primaryIds, assignments] = await Promise.all([readIds(primary, "facultyId"), getFacultyAssignments(scope)]);
  return [...new Set([...primaryIds, ...assignments.map((row) => row.facultyId)])];
}

async function profileIds(table: string, scope: MemberScope, educationScoped = true) {
  let query = supabase.from(table).select("userId").eq("collegeId", scope.collegeId)
    .eq("isActive", true).eq("is_deleted", false).is("deletedAt", null);
  if (educationScoped && scope.educationId) query = query.eq("collegeEducationId", scope.educationId);
  return readIds(query, "userId");
}

async function wellbeingIds(scope: MemberScope, manager: boolean): Promise<number[]> {
  let query = supabase.from("well_beings")
    .select("userId, wellbeing_college_details!inner(collegeEducationId, collegeBranchId)")
    .eq("collegeId", scope.collegeId).eq("roleType", manager ? "wellbeingManager" : "wellbeingExecutive")
    .eq("isActive", true).eq("is_deleted", false).is("deletedAt", null);
  if (scope.educationId) query = query.eq("wellbeing_college_details.collegeEducationId", scope.educationId);
  if (scope.branchId) query = query.eq("wellbeing_college_details.collegeBranchId", scope.branchId);
  const direct = await readIds(query, "userId");
  if (manager) return direct;
  const managers = await wellbeingIds(scope, true);
  if (!managers.length) return direct;
  const inherited = await readIds(supabase.from("well_beings").select("userId")
    .eq("collegeId", scope.collegeId).eq("roleType", "wellbeingExecutive")
    .in("byManager", managers).eq("isActive", true).eq("is_deleted", false).is("deletedAt", null), "userId");
  return [...new Set([...direct, ...inherited])];
}

export async function getRoleMemberIds(role: DashboardRoleKey, scope: MemberScope): Promise<number[] | null> {
  if (role === "FACULTY") {
    const ids = await getFacultyIds(scope);
    if (!ids.length) return [];
    return readIds(supabase.from("faculty").select("userId").eq("collegeId", scope.collegeId).in("facultyId", ids), "userId");
  }
  if (role === "STUDENT" || role === "PARENT") {
    let query = supabase.from(role === "STUDENT" ? "students" : "parents")
      .select(role === "STUDENT" ? "userId" : "userId, students!inner(collegeEducationId, collegeBranchId, isActive, deletedAt)")
      .eq("collegeId", scope.collegeId).eq("isActive", true).is("deletedAt", null);
    const prefix = role === "STUDENT" ? "" : "students.";
    if (role === "PARENT") query = query.eq("is_deleted", false).eq("students.isActive", true).is("students.deletedAt", null);
    if (scope.educationId) query = query.eq(`${prefix}collegeEducationId`, scope.educationId);
    if (scope.branchId) query = query.eq(`${prefix}collegeBranchId`, scope.branchId);
    return readIds(query, "userId");
  }
  if (role === "WELLBEING_EXECUTIVE" || role === "WELLBEING_MANAGER") return wellbeingIds(scope, role === "WELLBEING_MANAGER");
  if (role === "GROUND_STAFF") return profileIds("ground_staff", scope);
  // These registrations have no education or branch assignment. They serve the institution.
  if (role === "COLLEGE_HR" || role === "PLACEMENT_OFFICER") return null;

  const admin = role === "ADMIN";
  const accountant = role === "ACCOUNTANT";
  const table = admin ? "admins" : accountant ? "accountants" : "finance_manager";
  const mapping = admin ? "admin_education_types" : accountant ? "accountant_education_types" : "finance_manager_education_types";
  const base = (select: string) => {
    let query = supabase.from(table).select(select).eq("collegeId", scope.collegeId).eq("is_deleted", false).is("deletedAt", null);
    if (!admin) query = query.eq("isActive", true);
    if (!admin && !accountant) query = query.eq("type", role === "FINANCE" ? "executive" : "manager");
    return query;
  };
  if (!scope.educationId) return readIds(base("userId"), "userId");
  const mappingQuery = base(`userId, ${mapping}!inner(collegeEducationId)`)
    .eq(`${mapping}.collegeEducationId`, scope.educationId)
    .eq(`${mapping}.isActive`, true).eq(`${mapping}.is_deleted`, false).is(`${mapping}.deletedAt`, null);
  let legacyQuery = base(admin ? `userId, ${mapping}(collegeEducationId)` : "userId")
    .eq("collegeEducationId", scope.educationId);
  if (admin) legacyQuery = legacyQuery.eq(`${mapping}.isActive`, true).eq(`${mapping}.is_deleted`, false).is(`${mapping}.deletedAt`, null).is(mapping, null);
  const results = await Promise.all([readIds(mappingQuery, "userId"), readIds(legacyQuery, "userId")]);
  return [...new Set(results.flat())];
}

export async function fetchRoleMembers(role: DashboardRoleKey, scope: MemberScope, page = 1, pageSize = 10, countOnly = false) {
  // Education-wide roles cover every branch of their education. Resolve the
  // selected branch on the backend rather than inventing a staff branch field.
  if (scope.branchId) {
    let query = supabase.from("college_branch").select("collegeEducationId")
      .eq("collegeId", scope.collegeId).eq("collegeBranchId", scope.branchId).eq("isActive", true).is("deletedAt", null);
    if (scope.educationId) query = query.eq("collegeEducationId", scope.educationId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return { members: [] as Member[], count: 0 };
    scope = { ...scope, educationId: data.collegeEducationId };
  }
  const ids = await getRoleMemberIds(role, scope);
  if (ids && !ids.length) return { members: [] as Member[], count: 0 };
  let query = supabase.from("users")
    .select("userId, fullName, email, mobile, gender, role, dateOfJoining", { count: "exact", head: countOnly })
    .eq("collegeId", scope.collegeId).eq("isActive", true).eq("is_deleted", false);
  if (ids) query = query.in("userId", ids);
  else query = query.in("role", ROLE_ALIASES[role]);
  if (!countOnly) query = query.order("fullName").order("userId").range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { members: (data ?? []) as Member[], count: count ?? 0 };
}
