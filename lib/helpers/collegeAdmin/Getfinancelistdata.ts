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
 
export type FinanceRow = {
  financeManagerId: number;
  fullName: string;
  collegeEducationId: number;
  eduType: string;
  supportAdmin: string;
};
 
export type FinanceListData = {
  distributions: EduTypeDistribution[];
  finance: FinanceRow[];
};
 
export async function getFinanceListData(
  collegeId: number,
  page: number = 1,
  limit: number = 10,
  filters?: {
    collegeEducationId?: number;
    adminId?: number;
  }
): Promise<FinanceListData & { totalCount: number }> {
 
  const from = (page - 1) * limit;
  const to = from + limit - 1;
 
  const { data: eduList, error: eduError } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .eq("isActive", true);
 
  if (eduError) throw eduError;
  if (!eduList || eduList.length === 0) {
    return { distributions: [], finance: [], totalCount: 0 };
  }
 
  const eduIds = eduList.map((e: any) => e.collegeEducationId) as number[];
 
  // Paginated finance query
  let financeQuery = supabase
    .from("finance_manager")
    .select("financeManagerId, userId, collegeEducationId, createdBy, isActive", { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .range(from, to);
 
  if (filters?.collegeEducationId) financeQuery = financeQuery.eq("collegeEducationId", filters.collegeEducationId);
  if (filters?.adminId)            financeQuery = financeQuery.eq("createdBy", filters.adminId);
 
  const { data: financeData, count: financeCount } = await financeQuery;
 
  const [
    { data: adminData },
    { data: studentData },
    { data: facultyData },
    { data: parentData },
    { data: usersData },
  ] = await Promise.all([
 
    supabase
      .from("admins")
      .select("adminId, fullName, collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false),
 
    supabase
      .from("students")
      .select("collegeEducationId")
      .eq("collegeId", collegeId)
      .is("deletedAt", null),
 
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
      .from("users")
      .select("userId, fullName")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false),
  ]);
 
  const userNameMap = new Map((usersData ?? []).map((u: any) => [u.userId, u.fullName]));
  const adminMap    = new Map((adminData ?? []).map((a: any) => [a.adminId, a.fullName]));
 
  // Full college-wide finance count for distributions
  const { data: allFinanceData } = await supabase
    .from("finance_manager")
    .select("collegeEducationId")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false);
 
  const distributions: EduTypeDistribution[] = eduList.map((edu: any) => {
    const eduId = edu.collegeEducationId;
    const adminsCount   = (adminData      ?? []).filter((r: any) => r.collegeEducationId === eduId).length;
    const studentsCount = (studentData    ?? []).filter((r: any) => r.collegeEducationId === eduId).length;
    const facultyCount  = (facultyData    ?? []).filter((r: any) => r.collegeEducationId === eduId).length;
    const financeCount  = (allFinanceData ?? []).filter((r: any) => r.collegeEducationId === eduId).length;
    const parentsCount  = (parentData     ?? []).filter((r: any) => (r.students as any)?.collegeEducationId === eduId).length;
    return {
      collegeEducationId: eduId,
      eduType:    edu.collegeEducationType,
      totalUsers: adminsCount + studentsCount + parentsCount + facultyCount + financeCount,
      admins:     adminsCount,
      students:   studentsCount,
      parents:    parentsCount,
      faculty:    facultyCount,
      finance:    financeCount,
      placement:  0,
    };
  });
 
  const finance: FinanceRow[] = (financeData ?? []).map((f: any) => ({
    financeManagerId:   f.financeManagerId,
    fullName:           userNameMap.get(f.userId) ?? "—",
    collegeEducationId: f.collegeEducationId,
    eduType:            eduList.find((e: any) => e.collegeEducationId === f.collegeEducationId)?.collegeEducationType ?? "—",
    supportAdmin:       adminMap.get(f.createdBy) ?? "—",
  }));
 
  return { distributions, finance, totalCount: financeCount ?? 0 };
}
