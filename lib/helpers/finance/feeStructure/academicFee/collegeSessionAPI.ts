import { supabase } from "@/lib/supabaseClient";

export async function getOrCreateCollegeSession(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number,
  startYear: number,
  endYear: number,
  totalFeeAmount: number, // 🟢 Passing the calculated total fee
) {
  // 🟢 FIXED: Match strictly by the DB's unique constraint columns
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
    // Update the total fee if it has changed or was previously null
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
      totalFeeAmount, // 🟢 Save it during creation
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
