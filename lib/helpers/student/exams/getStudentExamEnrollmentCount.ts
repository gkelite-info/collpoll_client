import { supabase } from "@/lib/supabaseClient";

export async function getStudentExamEnrollmentCount(
  studentId: number,
): Promise<number> {
  const { count, error } = await supabase
    .from("student_exam_enrollments")
    .select("collegeExamScheduleId", { count: "exact", head: true })
    .eq("studentId", studentId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;

  return count ?? 0;
}
