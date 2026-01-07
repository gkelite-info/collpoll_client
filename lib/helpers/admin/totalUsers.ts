import { supabase } from "@/lib/supabaseClient";

export async function getUserRoleCounts() {
  const { data, error } = await supabase.from("users").select("role");

  if (error) throw error;

  const counts = {
    ADMIN: 0,
    FACULTY: 0,
    STUDENT: 0,
    PARENT: 0,
  };

  data.forEach((u: any) => {
    if (u.role in counts) counts[u.role as keyof typeof counts]++;
  });

  return counts;
}

export async function getDepartmentUserCounts() {
  const { data, error } = await supabase.from("departments").select(`
      departmentId,
      departmentName,
      student_academic_profiles(count),
      faculty_profile(count)
    `);

  if (error) throw error;

  return data.map((d: any) => {
    const faculty = d.faculty_profile?.[0]?.count ?? 0;
    const students = d.student_academic_profiles?.[0]?.count ?? 0;

    return {
      name: d.departmentName,
      faculty,
      students,
      total: faculty + students,
    };
  });
}
