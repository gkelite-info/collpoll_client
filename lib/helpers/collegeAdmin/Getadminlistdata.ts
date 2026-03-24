import { supabase } from "@/lib/supabaseClient";
 
export type AdminListRow = {
  adminId: number;
  adminName: string;
  educationType: string;
  branches: string;
  createdBy: string;
  faculty: number;
  student: number;
  parent: number;
  finance: number;
};
 
export async function getAdminListData(
  collegeId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: AdminListRow[]; totalCount: number }> {
 
  const from = (page - 1) * limit;
  const to = from + limit - 1;
 
  // 1. Paginated admins query
  const { data: admins, error: adminsError, count } = await supabase
    .from("admins")
    .select(`
      adminId, userId, fullName, collegeEducationId, createdBy, is_deleted,
      college_education ( collegeEducationType )
    `, { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .range(from, to);
 
  if (adminsError) throw adminsError;
  if (!admins || admins.length === 0) return { data: [], totalCount: count ?? 0 };
 
  const eduIds = [...new Set(admins.map((a: any) => a.collegeEducationId))] as number[];
  const createdByIds = [...new Set(admins.map((a: any) => a.createdBy).filter(Boolean))] as number[];
 
  // 2. Run all supporting queries in parallel
  const [
    { data: branches },
    { data: facultyData },
    { data: studentData },
    { data: parentData },
    { data: financeData },
    { data: creatorUsers },
  ] = await Promise.all([
 
    supabase
      .from("college_branch")
      .select("collegeEducationId, collegeBranchCode")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .in("collegeEducationId", eduIds),
 
    supabase
      .from("faculty")
      .select("collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("isActive", true),
 
    supabase
      .from("students")
      .select("studentId, collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("isActive", true),
 
    supabase
      .from("parents")
      .select("parentId, students ( collegeEducationId )")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("is_deleted", false),
 
    supabase
      .from("finance_manager")
      .select("collegeEducationId")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("is_deleted", false),
 
    supabase
      .from("users")
      .select("userId, fullName")
      .in("userId", createdByIds),
  ]);
 
  const creatorMap = new Map(
    (creatorUsers ?? []).map((u: any) => [u.userId, u.fullName])
  );
 
  const facultyByEdu  = (eduId: number) => (facultyData ?? []).filter((r: any) => r.collegeEducationId === eduId).length;
  const studentByEdu  = (eduId: number) => (studentData ?? []).filter((r: any) => r.collegeEducationId === eduId).length;
  const parentByEdu   = (eduId: number) => (parentData ?? []).filter((r: any) => (r.students as any)?.collegeEducationId === eduId).length;
  const financeByEdu  = (eduId: number) => (financeData ?? []).filter((r: any) => r.collegeEducationId === eduId).length;
 
  const data: AdminListRow[] = admins.map((a: any) => {
    const eduId = a.collegeEducationId;
    return {
      adminId:       a.adminId,
      adminName:     a.fullName,
      educationType: (a.college_education as any)?.collegeEducationType ?? "N/A",
      branches:      (branches ?? [])
        .filter((b: any) => b.collegeEducationId === eduId)
        .map((b: any) => b.collegeBranchCode)
        .join(", ") || "—",
      createdBy: creatorMap.get(a.createdBy) ?? "—",
      faculty:   facultyByEdu(eduId),
      student:   studentByEdu(eduId),
      parent:    parentByEdu(eduId),
      finance:   financeByEdu(eduId),
    };
  });
 
  return { data, totalCount: count ?? 0 };
}