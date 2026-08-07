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
        updatedAt: now,
      })
      .eq("collegeSubjectUnitId", unitId);

    if (unitError) {
      console.error("DB Error deleting unit:", unitError);
      throw new Error("Unable to delete unit at this time. Please try again.");
    }

    const { error: topicError } = await supabase
      .from("college_subject_unit_topics")
      .update({
        isActive: false,
        updatedAt: now,
      })
      .eq("collegeSubjectUnitId", unitId)
      .eq("isActive", true);

    if (topicError) {
      console.error("DB Error deleting associated topics:", topicError);
      throw new Error("Unable to delete associated topics. Please try again.");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteUnitAction:", error);
    return { success: false, error: error.message };
  }
}
