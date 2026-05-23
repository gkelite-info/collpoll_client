import { supabase } from "@/lib/supabaseClient";

export type ActiveManagersFilters = {
  collegeId: number;
  collegeEducationId?: number | null;
  collegeBranchId?: number | null;
  type?: "executive" | "manager" | null;
};

export type ActiveManagerRow = {
  financeManagerId: number;
  userId: number;
  managerName: string;
  employeeId: string;
  collegeEducationId: number;
  type: "executive" | "manager";
  educationType: string;
  studentsManaged: number;
};

type FinanceManagerRow = {
  financeManagerId: number;
  userId: number;
  collegeEducationId: number;
  type: "executive" | "manager";
  updatedAt?: string | null;
  createdAt?: string | null;
  users?: {
    fullName?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
  } | null;
  college_education?: {
    collegeEducationType?: string | null;
  } | null;
};

export async function fetchActiveManagersOverview(
  filters: ActiveManagersFilters,
  search?: string,
) {
  let managerQuery = supabase
    .from("finance_manager")
    .select(
      `
      financeManagerId,
      userId,
      collegeEducationId,
      type,
      updatedAt,
      createdAt,
      users!inner (
        fullName,
        role,
        collegeId,
        isActive,
        is_deleted,
        deletedAt,
        updatedAt,
        createdAt
      ),
      college_education:collegeEducationId (
        collegeEducationType
      )
    `,
    )
    .eq("collegeId", filters.collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .eq("users.collegeId", filters.collegeId)
    .eq("users.role", filters.type === "manager" ? "FinanceManager" : "Finance")
    .eq("users.isActive", true)
    .eq("users.is_deleted", false)
    .is("users.deletedAt", null);

  if (filters.collegeEducationId) {
    managerQuery = managerQuery.eq(
      "collegeEducationId",
      filters.collegeEducationId,
    );
  }

  if (filters.type) {
    managerQuery = managerQuery.eq("type", filters.type);
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    const [{ data: userMatches }, { data: employeeMatches }] =
      await Promise.all([
        supabase
          .from("users")
          .select("userId")
          .eq("collegeId", filters.collegeId)
          .eq("role", filters.type === "manager" ? "FinanceManager" : "Finance")
          .eq("isActive", true)
          .eq("is_deleted", false)
          .is("deletedAt", null)
          .ilike("fullName", `%${trimmedSearch}%`),
        supabase
          .from("employee_ids")
          .select("userId")
          .eq("collegeId", filters.collegeId)
          .eq("isActive", true)
          .is("deletedAt", null)
          .ilike("employeeId", `%${trimmedSearch}%`),
      ]);

    const userIds = Array.from(
      new Set(
        [...(userMatches ?? []), ...(employeeMatches ?? [])]
          .map((row) => Number(row.userId))
          .filter(Boolean),
      ),
    );

    managerQuery = managerQuery.in("userId", userIds.length ? userIds : [0]);
  }

  const { data: managers, error } = await managerQuery.order("createdAt", {
    ascending: false,
  });
  if (error) throw error;

  const managerRows = (managers ?? []) as FinanceManagerRow[];
  const managerUserIds = managerRows.map((manager) => manager.userId);
  const educationIds = Array.from(
    new Set(managerRows.map((manager) => manager.collegeEducationId)),
  );

  let studentCountQuery = supabase
    .from("students")
    .select(
      `
          collegeEducationId,
          users!inner (
            role,
            collegeId,
            isActive,
            is_deleted,
            deletedAt
          ),
          student_academic_history!inner ( isCurrent )
        `,
    )
    .eq("collegeId", filters.collegeId)
    .in("collegeEducationId", educationIds.length ? educationIds : [0])
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("users.role", "Student")
    .eq("users.collegeId", filters.collegeId)
    .eq("users.isActive", true)
    .eq("users.is_deleted", false)
    .is("users.deletedAt", null)
    .eq("student_academic_history.isCurrent", true);

  if (filters.collegeBranchId) {
    studentCountQuery = studentCountQuery.eq(
      "collegeBranchId",
      filters.collegeBranchId,
    );
  }

  const [{ data: employeeIds }, { data: studentCounts }] = await Promise.all([
      supabase
        .from("employee_ids")
        .select("userId, employeeId")
        .eq("collegeId", filters.collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .in("userId", managerUserIds.length ? managerUserIds : [0]),
      studentCountQuery,
    ]);

  const employeeIdMap = new Map(
    (employeeIds ?? []).map((row) => [Number(row.userId), row.employeeId]),
  );
  const studentsByEducation = new Map<number, number>();
  (studentCounts ?? []).forEach((student) => {
    const educationId = Number(student.collegeEducationId);
    studentsByEducation.set(
      educationId,
      (studentsByEducation.get(educationId) ?? 0) + 1,
    );
  });

  return managerRows.map((manager) => ({
    financeManagerId: manager.financeManagerId,
    userId: manager.userId,
    managerName: manager.users?.fullName?.trim() || "Unknown Manager",
    employeeId:
      String(employeeIdMap.get(manager.userId) ?? manager.financeManagerId) ||
      "N/A",
    collegeEducationId: manager.collegeEducationId,
    type: manager.type,
    educationType:
      manager.college_education?.collegeEducationType ?? "Education",
    studentsManaged: studentsByEducation.get(manager.collegeEducationId) ?? 0,
  })) satisfies ActiveManagerRow[];
}
