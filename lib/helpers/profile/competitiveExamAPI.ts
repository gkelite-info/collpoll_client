import { supabase } from "@/lib/supabaseClient";
import { CompetitiveExamEntry } from "./types";

export async function upsertCompetitiveExams(exams: CompetitiveExamEntry[]) {
  const { data, error } = await supabase
    .from("competitive_exams")
    .upsert(
      exams.map((e) => ({
        studentId: e.studentId,
        examName: e.examName,
        score: e.score,
        isDeleted: false,
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
