"use server";

import { supabase } from "@/lib/supabaseClient";

type UpsertUnitPayload = {
  collegeId: number;
  collegeSubjectId: number;
  createdBy: number;

  unitNumber: number;
  unitTitle: string;
  startDate?: string;
  endDate?: string;

  topics: string[];
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
  } = payload;

  const startISO = toISODate(startDate);
  const endISO = toISODate(endDate);

  if (!isValidDateRange(startISO, endISO)) {
    throw new Error("Start date must be before end date");
  }

  const now = new Date().toISOString();

  /* -------------------------------
   * 1️⃣ UPSERT SUBJECT UNIT
   * ------------------------------- */

  const { data: unit, error: unitError } = await supabase
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
        createdAt: now,   // ✅ REQUIRED
        updatedAt: now,   // ✅ REQUIRED
      },
      {
        onConflict: "collegeId,collegeSubjectId,unitNumber",

      }
    )
    .select()
    .single();

  if (unitError) {
    console.error("❌ Unit upsert failed:", unitError);

    if (unitError.code === "23505") {
      throw new Error("Unit number already exists for this subject");
    }

    throw unitError;
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
      createdAt: now,   // ✅ REQUIRED
      updatedAt: now,   // ✅ REQUIRED
    }));

    const { error: topicError } = await supabase
      .from("college_subject_unit_topics")
      .upsert(topicRows, {
        onConflict: "collegeSubjectUnitId,topicTitle",
      });

    if (topicError) {
      console.error("❌ Topic upsert failed:", topicError);
      throw topicError;
    }
  }

  return {
    success: true,
    collegeSubjectUnitId,
  };
}
