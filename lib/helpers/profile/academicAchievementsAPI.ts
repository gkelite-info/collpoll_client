import { supabase } from "@/lib/supabaseClient";

export interface AcademicAchievementEntry {
  studentId: number;
  achievementName: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function upsertAcademicAchievements(
  achievements: AcademicAchievementEntry[]
) {
  const { data, error } = await supabase
    .from("academic_achievements")
    .upsert(achievements, {
      onConflict: "studentId,achievementName",
    })
    .select();

  if (error) throw error;
  return data;
}

export async function getAcademicAchievements(studentId: number) {
  const { data, error } = await supabase
    .from("academic_achievements")
    .select("*")
    .eq("studentId", studentId)
    .eq("isDeleted", false);

  if (error) throw error;
  return data;
}
