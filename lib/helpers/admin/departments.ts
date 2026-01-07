import { supabase } from "@/lib/supabaseClient";

export async function getDepartmentOverview() {
  const { data, error } = await supabase.from("departments").select(`
      departmentId,
      departmentName,
      student_academic_profiles(count),
      faculty_profiles(count)
      admin_profiles(count)
    `);

  if (error) throw error;

  return (
    data?.map((d: any) => ({
      departmentId: d.departmentId,
      departmentName: d.departmentName,
      students: d.student_academic_profiles?.[0]?.count ?? 0,
      faculty: d.faculty_profiles?.[0]?.count ?? 0,
      admin: d.admin_profiles?.[0]?.count ?? 0,
    })) ?? []
  );
}
