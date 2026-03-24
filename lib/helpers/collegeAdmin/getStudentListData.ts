import { supabase } from "@/lib/supabaseClient";
 
export type EduTypeDistribution = {
  collegeEducationId: number;
  eduType: string;
  totalUsers: number;
  admins: number;
  students: number;
  parents: number;
  faculty: number;
  finance: number;
  placement: number;
};
 
export type StudentRow = {
  studentId: number;
  fullName: string;
  collegeEducationId: number;
  eduType: string;
  collegeBranchId: number;
  branchCode: string;
  supportAdmin: string;
  academicYear: string;
  isActive: boolean;
};
 
export type AcademicYearOption = {
  collegeAcademicYearId: number;
  collegeAcademicYear: string;
  collegeEducationId: number;
  collegeBranchId: number;
};
 
export type StudentListData = {
  distributions: EduTypeDistribution[];
  students: StudentRow[];
  branches: { collegeBranchId: number; collegeBranchCode: string; collegeEducationId: number }[];
  admins: { adminId: number; fullName: string; collegeEducationId: number }[];
  academicYears: AcademicYearOption[];
};
 
export async function getStudentListData(
  collegeId: number,
  page: number = 1,
  limit: number = 10,
  filters?: {
    collegeEducationId?: number;
    collegeBranchId?: number;
    collegeAcademicYearId?: number;
    adminId?: number;
  }
): Promise<StudentListData & { totalCount: number }> {
 
  const from = (page - 1) * limit;
  const to = from + limit - 1;
 
  const { data: eduList, error: eduError } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .eq("isActive", true);
 
  if (eduError) throw eduError;
  if (!eduList || eduList.length === 0) {
    return { distributions: [], students: [], branches: [], admins: [], academicYears: [], totalCount: 0 };
  }
 
  const eduIds = eduList.map((e: any) => e.collegeEducationId) as number[];
 
  // All supporting queries — no pagination
  const [
    { data: adminData },
    { data: facultyData },
    { data: parentData },
    { data: financeData },
    { data: branchData },
    { data: academicYearData },
    { data: usersData },
    { data: academicHistoryData },
    { data: allStudentData },
  ] = await Promise.all([
 
    supabase
      .from("admins")
      .select("adminId, fullName, collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false),
 
    supabase
      .from("faculty")
      .select("collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("isActive", true),
 
    supabase
      .from("parents")
      .select("parentId, students ( collegeEducationId )")
      .eq("collegeId", collegeId)
      .eq("isActive", true),
 
    supabase
      .from("finance_manager")
      .select("collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false),
 
    supabase
      .from("college_branch")
      .select("collegeBranchId, collegeBranchCode, collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .in("collegeEducationId", eduIds),
 
    supabase
      .from("college_academic_year")
      .select("collegeAcademicYearId, collegeAcademicYear, collegeEducationId, collegeBranchId")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .in("collegeEducationId", eduIds),
 
    supabase
      .from("users")
      .select("userId, fullName")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false),
 
    supabase
      .from("student_academic_history")
      .select("studentId, collegeAcademicYearId")
      .eq("isCurrent", true)
      .is("deletedAt", null),
 
    // All students for distributions (no pagination)
    supabase
      .from("students")
      .select("studentId, collegeEducationId")
      .eq("collegeId", collegeId)
      .is("deletedAt", null),
  ]);
 
  // ── Lookup maps ──────────────────────────────────────────────────────────────
 
  const branchMap       = new Map((branchData ?? []).map((b: any) => [b.collegeBranchId, b.collegeBranchCode]));
  const adminByIdMap    = new Map((adminData ?? []).map((a: any) => [a.adminId, a.fullName]));
  const userNameMap     = new Map((usersData ?? []).map((u: any) => [u.userId, u.fullName]));
  const academicYearMap = new Map((academicYearData ?? []).map((y: any) => [y.collegeAcademicYearId, y.collegeAcademicYear]));
  const studentYearMap  = new Map((academicHistoryData ?? []).map((h: any) => [h.studentId, h.collegeAcademicYearId]));
 
  // ── Build student filter ids for server-side filtering ────────────────────
 
  // Get studentIds matching year filter (via academic history)
  let yearFilteredStudentIds: Set<number> | null = null;
  if (filters?.collegeAcademicYearId) {
    yearFilteredStudentIds = new Set<number>();
    (academicHistoryData ?? []).forEach((h: any) => {
      if (h.collegeAcademicYearId === filters.collegeAcademicYearId) {
        yearFilteredStudentIds!.add(h.studentId);
      }
    });
  }
 
  // ── Paginated students query ──────────────────────────────────────────────
 
  let studentQuery = supabase
    .from("students")
    .select("studentId, userId, collegeEducationId, collegeBranchId, createdBy, isActive", { count: "exact" })
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .range(from, to);
 
  if (filters?.collegeEducationId) studentQuery = studentQuery.eq("collegeEducationId", filters.collegeEducationId);
  if (filters?.collegeBranchId)    studentQuery = studentQuery.eq("collegeBranchId", filters.collegeBranchId);
  if (filters?.adminId)            studentQuery = studentQuery.eq("createdBy", filters.adminId);
  if (yearFilteredStudentIds && yearFilteredStudentIds.size > 0) {
    studentQuery = studentQuery.in("studentId", Array.from(yearFilteredStudentIds));
  }
 
  const { data: studentData, count: studentCount } = await studentQuery;
 
  // ── Distributions — always college-wide ───────────────────────────────────
 
  const distributions: EduTypeDistribution[] = eduList.map((edu: any) => {
    const eduId = edu.collegeEducationId;
    return {
      collegeEducationId: eduId,
      eduType:    edu.collegeEducationType,
      totalUsers: [adminData, allStudentData, parentData, facultyData, financeData]
        .map((arr) => (arr ?? []).filter((r: any) =>
          r.collegeEducationId === eduId || (r.students as any)?.collegeEducationId === eduId
        ).length)
        .reduce((a, b) => a + b, 0),
      admins:     (adminData      ?? []).filter((r: any) => r.collegeEducationId === eduId).length,
      students:   (allStudentData ?? []).filter((r: any) => r.collegeEducationId === eduId).length,
      parents:    (parentData     ?? []).filter((r: any) => (r.students as any)?.collegeEducationId === eduId).length,
      faculty:    (facultyData    ?? []).filter((r: any) => r.collegeEducationId === eduId).length,
      finance:    (financeData    ?? []).filter((r: any) => r.collegeEducationId === eduId).length,
      placement:  0,
    };
  });
 
  // ── Student rows ──────────────────────────────────────────────────────────
 
  const students: StudentRow[] = (studentData ?? []).map((s: any) => {
    const yearId = studentYearMap.get(s.studentId);
    const academicYear = yearId ? (academicYearMap.get(yearId) ?? "—") : "—";
    return {
      studentId:          s.studentId,
      fullName:           userNameMap.get(s.userId) ?? "—",
      collegeEducationId: s.collegeEducationId,
      eduType:            eduList.find((e: any) => e.collegeEducationId === s.collegeEducationId)?.collegeEducationType ?? "N/A",
      collegeBranchId:    s.collegeBranchId,
      branchCode:         branchMap.get(s.collegeBranchId) ?? "—",
      supportAdmin:       adminByIdMap.get(s.createdBy) ?? "—",
      academicYear,
      isActive:           s.isActive ?? true,
    };
  });
 
  const academicYears: AcademicYearOption[] = (academicYearData ?? []).map((y: any) => ({
    collegeAcademicYearId: y.collegeAcademicYearId,
    collegeAcademicYear:   y.collegeAcademicYear,
    collegeEducationId:    y.collegeEducationId,
    collegeBranchId:       y.collegeBranchId,
  }));
 
  return {
    distributions,
    students,
    branches:     branchData ?? [],
    admins:       adminData  ?? [],
    academicYears,
    totalCount:   studentCount ?? 0,
  };
}