import { supabase } from "@/lib/supabaseClient";

export async function softDeleteExam(studentId: number, examName: string) {
  const { error } = await supabase
    .from("competitive_exams")
    .update({ isDeleted: true })
    .eq("studentId", studentId)
    .eq("examName", examName);

  if (error) {
    console.error("Soft delete failed:", error);
    throw error;
  }
}

export async function upsertCompetitiveExams(exams: any[]) {
  const { data, error } = await supabase
    .from("competitive_exams")
    .upsert(
      exams.map((e) => ({
        studentId: e.studentId,
        examName: e.examName,
        score: e.score,
        isDeleted: e.isDeleted ?? false,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
      {
        onConflict: "studentId,examName",
      }
    )
    .select();

  if (error) throw error;
  return data;
}

export async function getCompetitiveExam(studentId: number) {
  try {
    const { data, error } = await supabase
      .from("competitive_exams")
      .select("*")
      .eq("studentId", studentId)
      .maybeSingle();
    return data;
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw error;
  }
}
