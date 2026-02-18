import { supabase } from "@/lib/supabaseClient";

export async function getOrCreateCollegeSession(
  collegeId: number,
  startYear: number,
  endYear: number,
) {
  // 1. Check if session already exists
  const { data: existing } = await supabase
    .from("college_session")
    .select("collegeSessionId")
    .match({
      collegeId,
      startYear,
      endYear,
    })
    .maybeSingle();

  if (existing) {
    return { success: true, collegeSessionId: existing.collegeSessionId };
  }

  // 2. Create new session if not found
  const sessionName = `${startYear}-${endYear}`;
  const now = new Date().toISOString();

  const { data: newSession, error } = await supabase
    .from("college_session")
    .insert({
      collegeId,
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
