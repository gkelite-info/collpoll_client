"use server";

import { createClient } from "@supabase/supabase-js";

export async function deleteUnitAction(unitId: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const now = new Date().toISOString();

  try {
    const { error: unitError } = await supabase
      .from("college_subject_units")
      .update({
        isActive: false,
        deletedAt: now,
        updatedAt: now,
      })
      .eq("collegeSubjectUnitId", unitId);

    if (unitError) {
      throw new Error(`Failed to delete unit: ${unitError.message}`);
    }

    const { error: topicError } = await supabase
      .from("college_subject_unit_topics")
      .update({
        isActive: false,
        deletedAt: now,
        updatedAt: now,
      })
      .eq("collegeSubjectUnitId", unitId)
      .eq("isActive", true);

    if (topicError) {
      throw new Error(`Failed to delete associated topics: ${topicError.message}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteUnitAction:", error);
    return { success: false, error: error.message };
  }
}
