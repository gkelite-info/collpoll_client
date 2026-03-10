import { supabase } from "@/lib/supabaseClient";

export async function getDepartmentOverview(
  collegeId: number,
  collegeEducationId: number,
) {
  const { data, error } = await supabase
    .from("college_branch")
    .select(
      `
      collegeBranchId,
      collegeBranchType,
      students(count),
      faculty(count)
    `,
    )
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;

  return (
    data?.map((d: any) => {
      const studentsCount = d.students?.[0]?.count ?? d.students?.count ?? 0;
      const facultyCount = d.faculty?.[0]?.count ?? d.faculty?.count ?? 0;

      return {
        departmentId: d.collegeBranchId,
        departmentName: d.collegeBranchType,
        students: studentsCount,
        faculty: facultyCount,
        total: studentsCount + facultyCount,
      };
    }) ?? []
  );
}
