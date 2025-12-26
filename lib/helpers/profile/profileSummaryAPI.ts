import { supabase } from "@/lib/supabaseClient";
import { ProfileSummaryInput } from "./types";

export async function insertProfileSummary(summary: ProfileSummaryInput) {
  try {
    const { data, error } = await supabase
      .from("profile_summary")
      .upsert(
        [
          {
            studentId: summary.studentId,
            summary: summary.summary,
            isDeleted: summary.isDeleted,
            createdAt: summary.createdAt,
            updatedAt: summary.updatedAt,
          },
        ],

        { onConflict: "studentId" }
      )
      .select();

    if (error) {
      throw error;
    }
    return data;
  } catch (err) {
    console.error("Error inserting project:", err);
    throw err;
  }
}

export async function getProfileSummary(studentId: number) {
  try {
    const { data, error } = await supabase
      .from("profile_summary")
      .select("*")
      .eq("studentId", studentId)
      .maybeSingle();
    return data;
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw error;
  }
}
