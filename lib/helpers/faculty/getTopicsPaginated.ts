import { supabase } from "@/lib/supabaseClient";
import { DbTopic, UiTopic } from "./getUnitsWithTopics";

export async function getTopicsPaginated(params: {
  collegeId: number;
  collegeSubjectUnitId: number;
  collegeSectionsId?: number | null;
  page?: number;
  limit?: number;
}) {
  const { collegeId, collegeSubjectUnitId, collegeSectionsId, page = 1, limit = 10 } = params;

  // We fetch all topics for this specific unit to apply the global vs section fallback logic.
  // The number of topics per unit is small (e.g. 10-30), making this very fast.
  let topicsQuery = supabase
    .from("college_subject_unit_topics")
    .select(
      `
      collegeSubjectUnitTopicId,
      topicTitle,
      isCompleted,
      displayOrder,
      collegeSubjectUnitId,
      collegeSectionsId
    `
    )
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("collegeSubjectUnitId", collegeSubjectUnitId);

  if (collegeSectionsId) {
    topicsQuery = topicsQuery.or(`collegeSectionsId.eq.${collegeSectionsId},collegeSectionsId.is.null`);
  } else {
    topicsQuery = topicsQuery.is("collegeSectionsId", null);
  }

  const { data: rawTopics, error: topicsErr } = await topicsQuery.order("displayOrder", { ascending: true });

  if (topicsErr) throw new Error(topicsErr.message);

  // Filter to prefer section-specific topics over global topics with the same displayOrder / topicTitle
  // If your business logic expects topics to uniquely override by displayOrder:
  const topicsMap = new Map<string, DbTopic>();
  (rawTopics ?? []).forEach((t) => {
    const key = t.topicTitle ? t.topicTitle.toLowerCase().trim() : String(t.collegeSubjectUnitTopicId);
    const existing = topicsMap.get(key);
    if (!existing || (existing.collegeSectionsId === null && t.collegeSectionsId !== null)) {
      topicsMap.set(key, t);
    }
  });

  const allTopics = Array.from(topicsMap.values()).sort((a, b) => a.displayOrder - b.displayOrder);

  // Apply server-side pagination on the deduplicated topics
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedDbTopics = allTopics.slice(startIndex, endIndex);

  const uiTopics: UiTopic[] = paginatedDbTopics.map((x) => ({
    id: x.collegeSubjectUnitTopicId,
    title: x.topicTitle,
    isCompleted: x.isCompleted ?? false,
  }));

  const hasNextPage = endIndex < allTopics.length;

  return {
    topics: uiTopics,
    hasNextPage,
    nextCursor: hasNextPage ? page + 1 : undefined,
    totalCount: allTopics.length,
    totalCompletedCount: allTopics.filter((t) => t.isCompleted).length,
  };
}

