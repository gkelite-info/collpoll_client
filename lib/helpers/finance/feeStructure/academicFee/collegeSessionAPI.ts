import { supabase } from "@/lib/supabaseClient";

export async function getOrCreateCollegeSession(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number,
  startYear: number,
  endYear: number,
) {
  const { data: existing } = await supabase
    .from("college_session")
    .select("collegeSessionId")
    .match({
      collegeId,
      collegeEducationId,
      collegeBranchId,
      startYear,
      endYear,
    })
    .maybeSingle();

  if (existing) {
    return { success: true, collegeSessionId: existing.collegeSessionId };
  }

  const sessionName = `${startYear}-${endYear}`;
  const now = new Date().toISOString();

  const { data: newSession, error } = await supabase
    .from("college_session")
    .insert({
      collegeId,
      collegeEducationId,
      collegeBranchId,
      sessionName,
      startYear,
      endYear,
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
