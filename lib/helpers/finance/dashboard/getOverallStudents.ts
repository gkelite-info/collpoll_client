import { supabase } from "@/lib/supabaseClient";

export async function getOverallStudents(
  collegeId: number,
  collegeEducationId: number
) {
  const { count, error } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("Error fetching overall students:", error);
    throw error;
  }

  return count ?? 0;
}
