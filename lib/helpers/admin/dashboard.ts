import { supabase } from "@/lib/supabaseClient";

export async function getAdminDashboardSummary(
  collegeId: number,
  collegeEducationId: number,
) {
  const [
    { count: studentsCount },
    { count: facultyCount },
    { count: adminsCount },
    { count: parentsCount },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("studentId", { count: "exact", head: true })
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true),

    supabase
      .from("faculty")
      .select("facultyId", { count: "exact", head: true })
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true),

    supabase
      .from("admins")
      .select("adminId", { count: "exact", head: true })
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("is_deleted", false),

    // Parents don't have collegeEducationId, so we inner join students to filter them securely
    supabase
      .from("parents")
      .select("parentId, students!inner(collegeEducationId)", {
        count: "exact",
        head: true,
      })
      .eq("collegeId", collegeId)
      .eq("students.collegeEducationId", collegeEducationId)
      .eq("is_deleted", false),
  ]);

  const totalUsers =
    (studentsCount ?? 0) +
    (facultyCount ?? 0) +
    (adminsCount ?? 0) +
    (parentsCount ?? 0);

  return {
    totalUsers,
    pendingApprovals: 34, // placeholder for now
    systemHealth: "Good", // placeholder for now
    automations: 12, // placeholder for now
  };
}
