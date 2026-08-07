"use server";

import { createClient } from "@supabase/supabase-js";

type UpsertUnitPayload = {
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

/* -------------------------------
 * 🔹 Helpers
 * ------------------------------- */

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

export async function upsertCollegeSubjectUnitWithTopics(
  payload: UpsertUnitPayload
) {
  const {
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
   * 1️⃣ UPSERT SUBJECT UNIT
   * ------------------------------- */

  const { data: unit, error: unitError } = await supabaseAdmin
    .from("college_subject_units")
    .upsert(
      {
        collegeId,
        collegeSubjectId,
        unitNumber,
        unitTitle,
        startDate: startISO,
        endDate: endISO,
        createdBy,
        collegeSectionsId,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
      {
        onConflict: "collegeId,collegeSubjectId,unitNumber,collegeSectionsId",
      }
    )
    .select()
    .single();

  if (unitError) {
    console.error("❌ Unit upsert failed:", unitError);

    if (unitError.code === "23505") {
      throw new Error("Unit number already exists for this subject");
    }

    if (unitError.code === "42501") {
      throw new Error("Unable to save this unit. It may already exist or you lack permission to modify it.");
    }

    throw new Error(unitError.message || "Failed to save unit to the database.");
  }

  const collegeSubjectUnitId = unit.collegeSubjectUnitId;

  /* -------------------------------
   * 2️⃣ UPSERT TOPICS
   * ------------------------------- */

  if (topics.length > 0) {
    const topicRows = topics.map((topic, index) => ({
      topicTitle: topic,
      displayOrder: index + 1,
      collegeSubjectUnitId,
      collegeSubjectId,
      collegeId,
      createdBy,
      collegeSectionsId,
      createdAt: now,   // ✅ REQUIRED
      updatedAt: now,   // ✅ REQUIRED
      isActive: true,
    }));

    const { error: topicError } = await supabaseAdmin
      .from("college_subject_unit_topics")
      .upsert(topicRows, {
        onConflict: "collegeSubjectUnitId,topicTitle",
      });

    if (topicError) {
      console.error("❌ Topic upsert failed:", topicError);
      if (topicError.code === "23505") {
        throw new Error("One or more topics already exist in this unit.");
      }
      if (topicError.code === "42501") {
        throw new Error("Unable to save topics. You may lack permission to modify them.");
      }
      throw new Error(topicError.message || "Failed to save topics to the database.");
    }
  }

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
