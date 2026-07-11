import { supabase } from "@/lib/supabaseClient";

export async function getOrCreateCollegeSession(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number,
  startYear: number,
  endYear: number,
  totalFeeAmount: number,
) {
  const { data: existing } = await supabase
    .from("college_session")
    .select("collegeSessionId, totalFeeAmount")
    .match({
      collegeId,
      startYear,
      endYear,
    })
    .maybeSingle();

  const now = new Date().toISOString();

  if (existing) {
    if (existing.totalFeeAmount !== totalFeeAmount) {
      await supabase
        .from("college_session")
        .update({ totalFeeAmount, updatedAt: now })
        .eq("collegeSessionId", existing.collegeSessionId);
    }
    return { success: true, collegeSessionId: existing.collegeSessionId };
  }

  const sessionName = `${startYear}-${endYear}`;

  const { data: newSession, error } = await supabase
    .from("college_session")
    .insert({
      collegeId,
      collegeEducationId,
      collegeBranchId,
      sessionName,
      startYear,
      endYear,
      totalFeeAmount,
      is_deleted: false,
      updatedAt: now,
      createdAt: now,
    })
    .select("collegeSessionId")
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return { success: false, error };
  }

  return { success: true, collegeSessionId: newSession.collegeSessionId };
}
