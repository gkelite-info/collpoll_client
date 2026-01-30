import { supabase } from "@/lib/supabaseClient";

export async function markUnitComplete(params: {
  collegeSubjectUnitId: number;
  completionPercentage?: number; // default 100
}) {
  const { collegeSubjectUnitId, completionPercentage = 100 } = params;

  const { data, error } = await supabase
    .from("college_subject_units")
    .update({
      completionPercentage,
      updatedAt: new Date().toISOString(),
    })
    .eq("collegeSubjectUnitId", collegeSubjectUnitId)
    .select("collegeSubjectUnitId, completionPercentage")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
