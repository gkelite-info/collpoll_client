"use server";

import { createClient } from "@supabase/supabase-js";

type UpdateUnitPayload = {
  collegeSubjectUnitId: number;
  collegeId: number;
  collegeSubjectId: number;
  createdBy: number;

  unitNumber: number;
  unitTitle: string;
  startDate?: string;
  endDate?: string;

  topics: string[];
  collegeSectionsId: number;
};

type SavedTopic = {
  collegeSubjectUnitTopicId: number;
  topicTitle: string;
  displayOrder: number;
  collegeSubjectUnitId: number;
  collegeSubjectId: number;
  collegeId: number;
};

// Convert DD/MM/YYYY → YYYY-MM-DD (safe)
function toISODate(date?: string) {
  if (!date) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const [dd, mm, yyyy] = date.split("/");
  if (!dd || !mm || !yyyy) return null;

  return `${yyyy}-${mm}-${dd}`;
}

function isValidDateRange(start?: string | null, end?: string | null) {
  if (!start || !end) return true;
  return new Date(start).getTime() <= new Date(end).getTime();
}

export async function updateCollegeSubjectUnitWithTopics(
  payload: UpdateUnitPayload
) {
  const {
    collegeSubjectUnitId,
    collegeId,
    collegeSubjectId,
    createdBy,
    unitNumber,
    unitTitle,
    startDate,
    endDate,
    topics,
    collegeSectionsId,
  } = payload;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const startISO = toISODate(startDate);
  const endISO = toISODate(endDate);

  if (!isValidDateRange(startISO, endISO)) {
    throw new Error("Start date must be before end date");
  }

  const now = new Date().toISOString();

  /* -------------------------------
   * 1️⃣ CHECK FOR DUPLICATES
   * ------------------------------- */

  const { data: existingUnits, error: checkError } = await supabaseAdmin
    .from("college_subject_units")
    .select("collegeSubjectUnitId, unitTitle, unitNumber")
    .eq("collegeId", collegeId)
    .eq("collegeSubjectId", collegeSubjectId)
    .eq("collegeSectionsId", collegeSectionsId)
    .eq("isActive", true)
    .neq("collegeSubjectUnitId", collegeSubjectUnitId); // Exclude the current unit being edited!

  if (checkError) {
    console.error("❌ Failed to check existing units:", checkError);
    throw new Error("Failed to validate unit uniqueness.");
  }

  if (existingUnits && existingUnits.length > 0) {
    const duplicateName = existingUnits.find(u => u.unitTitle.toLowerCase().trim() === unitTitle.toLowerCase().trim());
    if (duplicateName) {
      throw new Error(`Unit "${unitTitle}" is already added for a selected section!`);
    }

    const duplicateNum = existingUnits.find(u => Number(u.unitNumber) === Number(unitNumber));
    if (duplicateNum) {
      throw new Error(`Unit ${unitNumber} is already added for a selected section!`);
    }
  }

  /* -------------------------------
   * 2️⃣ UPDATE SUBJECT UNIT
   * ------------------------------- */

  const { data: unit, error: unitError } = await supabaseAdmin
    .from("college_subject_units")
    .update({
      unitNumber,
      unitTitle,
      startDate: startISO,
      endDate: endISO,
      updatedAt: now,
    })
    .eq("collegeSubjectUnitId", collegeSubjectUnitId)
    .select()
    .single();

  if (unitError) {
    console.error("❌ Unit update failed:", unitError);

    if (unitError.code === "23505") {
      throw new Error("Unit number already exists for this subject");
    }

    throw new Error("Failed to update unit to the database.");
  }

  /* -------------------------------
   * 2️⃣ MANAGE TOPICS (UPSERT + DELETE REMOVED)
   * ------------------------------- */

  // First, fetch ALL existing topics for this unit (including inactive ones and ignoring sections)
  // The database unique constraint is on (collegeSubjectUnitId, topicTitle)
  const { data: existingTopics, error: fetchError } = await supabaseAdmin
    .from("college_subject_unit_topics")
    .select("collegeSubjectUnitTopicId, topicTitle, isActive")
    .eq("collegeSubjectUnitId", collegeSubjectUnitId);

  if (fetchError) {
    throw new Error("Failed to fetch existing topics to determine updates.");
  }

  // Deduplicate incoming topics case-insensitively to prevent intra-request unique constraint violations
  const uniqueTopicsMap = new Map<string, string>();
  topics.forEach(t => {
    const key = t.trim().toLowerCase();
    if (key && !uniqueTopicsMap.has(key)) {
      uniqueTopicsMap.set(key, t.trim());
    }
  });
  const uniqueTopics = Array.from(uniqueTopicsMap.values());

  // STEP 1: Clear the displayOrder number space by shifting ALL existing topics to temporary high values.
  // This prevents unique constraint violations on (collegeSubjectUnitId, displayOrder) during reorder.
  const allExistingIds = existingTopics?.map(t => t.collegeSubjectUnitTopicId) || [];
  if (allExistingIds.length > 0) {
    // Shift each topic to a unique high displayOrder (PK + 100000) to guarantee no collisions
    const clearPromises = allExistingIds.map((id, i) =>
      supabaseAdmin
        .from("college_subject_unit_topics")
        .update({ displayOrder: 100000 + i + 1, updatedAt: now })
        .eq("collegeSubjectUnitTopicId", id)
    );
    await Promise.all(clearPromises);
  }

  // STEP 2: Deactivate removed topics (they are active in DB but not in the incoming payload)
  const incomingTopicsSet = new Set(uniqueTopicsMap.keys());
  const topicsToDeactivate = existingTopics?.filter(t => t.isActive && !incomingTopicsSet.has(t.topicTitle.trim().toLowerCase())) || [];

  if (topicsToDeactivate.length > 0) {
    const { error: deactivateError } = await supabaseAdmin
      .from("college_subject_unit_topics")
      .update({ isActive: false, updatedAt: now })
      .in("collegeSubjectUnitTopicId", topicsToDeactivate.map(t => t.collegeSubjectUnitTopicId));

    if (deactivateError) {
      console.error("❌ Failed to deactivate removed topics:", deactivateError);
      throw new Error("Failed to remove deleted topics from the database.");
    }
  }

  // STEP 3: Separate incoming topics into existing (update) and new (insert)
  const existingTopicTitlesMap = new Map(existingTopics?.map(t => [t.topicTitle.trim().toLowerCase(), t]));

  const topicsToUpdate: { collegeSubjectUnitTopicId: number; displayOrder: number }[] = [];
  const topicsToInsert: any[] = [];

  uniqueTopics.forEach((topic, index) => {
    const existing = existingTopicTitlesMap.get(topic.toLowerCase());
    const displayOrder = index + 1;

    if (existing) {
      topicsToUpdate.push({
        collegeSubjectUnitTopicId: existing.collegeSubjectUnitTopicId,
        displayOrder,
      });
    } else {
      topicsToInsert.push({
        topicTitle: topic,
        displayOrder,
        collegeSubjectUnitId,
        collegeSubjectId,
        collegeId,
        createdBy,
        collegeSectionsId,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      });
    }
  });

  // STEP 4a: Update existing topics with their final displayOrder (preserves isCompleted)
  if (topicsToUpdate.length > 0) {
    const updatePromises = topicsToUpdate.map(t =>
      supabaseAdmin
        .from("college_subject_unit_topics")
        .update({
          displayOrder: t.displayOrder,
          isActive: true,
          updatedAt: now,
          collegeSectionsId: collegeSectionsId,
        })
        .eq("collegeSubjectUnitTopicId", t.collegeSubjectUnitTopicId)
    );

    const updateResults = await Promise.all(updatePromises);
    const failedUpdate = updateResults.find(r => r.error);
    if (failedUpdate?.error) {
      console.error("❌ Failed to update existing topics:", failedUpdate.error);
      throw new Error("Failed to update existing topics order.");
    }
  }

  // STEP 4b: Insert genuinely new topics
  if (topicsToInsert.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from("college_subject_unit_topics")
      .insert(topicsToInsert);

    if (insertError) {
      console.error("❌ Failed to insert new topics:", insertError);
      throw new Error(insertError.message || "Failed to save new topics to the database.");
    }
  }

  /* -------------------------------
   * 3️⃣ FETCH AND RETURN UPDATED TOPICS
   * ------------------------------- */

  const { data: savedTopics, error: savedTopicsError } = await supabaseAdmin
    .from("college_subject_unit_topics")
    .select(
      `
      collegeSubjectUnitTopicId,
      topicTitle,
      displayOrder,
      collegeSubjectUnitId,
      collegeSubjectId,
      collegeId
    `,
    )
    .eq("collegeSubjectUnitId", collegeSubjectUnitId)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .order("displayOrder", { ascending: true });

  if (savedTopicsError) {
    console.error("❌ Saved topics fetch failed:", savedTopicsError);
    throw new Error(savedTopicsError.message || "Failed to retrieve saved topics.");
  }

  return {
    success: true,
    collegeSubjectUnitId,
    topics: (savedTopics ?? []) as SavedTopic[],
  };
}
