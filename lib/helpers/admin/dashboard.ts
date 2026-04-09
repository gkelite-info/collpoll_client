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
    { count: financeCount },
    { count: hrCount },
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

    supabase
      .from("parents")
      .select("parentId, students!inner(collegeEducationId)", {
        count: "exact",
        head: true,
      })
      .eq("collegeId", collegeId)
      .eq("students.collegeEducationId", collegeEducationId)
      .eq("is_deleted", false),

    supabase
      .from("finance_manager")
      .select("financeManagerId", { count: "exact", head: true })
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .eq("is_deleted", false),

    supabase
      .from("college_hr")
      .select("collegeHrId", { count: "exact", head: true })
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("is_deleted", false),
  ]);

  const totalUsers =
    (studentsCount ?? 0) +
    (facultyCount ?? 0) +
    (adminsCount ?? 0) +
    (parentsCount ?? 0) +
    (financeCount ?? 0) +
    (hrCount ?? 0);

  return {
    totalUsers,
    pendingApprovals: 34,
    systemHealth: "Good",
    automations: 12,
  };
}
