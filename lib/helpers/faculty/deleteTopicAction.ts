"use server";

import { createClient } from "@supabase/supabase-js";

export async function deleteTopicAction(unitId: number, topicId: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const now = new Date().toISOString();

  try {
    const { error: deleteError } = await supabase
      .from("college_subject_unit_topics")
      .update({
        isActive: false,
        updatedAt: now,
      })
      .eq("collegeSubjectUnitTopicId", topicId);

    if (deleteError) {
      console.error("DB Error deleting topic:", deleteError);
      throw new Error("Unable to delete topic at this time. Please try again.");
    }

    const { data: remainingTopics, error: fetchError } = await supabase
      .from("college_subject_unit_topics")
      .select("isCompleted")
      .eq("collegeSubjectUnitId", unitId)
      .eq("isActive", true);

    if (fetchError) {
      console.error("DB Error fetching remaining topics:", fetchError);
      throw new Error("Unable to verify remaining topics. Please refresh the page.");
    }

    const total = remainingTopics.length;
    const completed = remainingTopics.filter((t) => t.isCompleted).length;
    const newPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    const { error: unitError } = await supabase
      .from("college_subject_units")
      .update({
        completionPercentage: newPercentage,
        updatedAt: now,
      })
      .eq("collegeSubjectUnitId", unitId);

    if (unitError) {
      console.error("DB Error updating unit percentage:", unitError);
      throw new Error("Failed to update the unit's overall progress. Please refresh.");
    }

    return { success: true, newPercentage };
  } catch (error: any) {
    console.error("Error in deleteTopicAction:", error);
    return { success: false, error: error.message };
  }
}
