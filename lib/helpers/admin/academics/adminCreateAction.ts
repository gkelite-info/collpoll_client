"use server";

import { supabase } from "@/lib/supabaseClient";

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

export async function getFacultyByBranch(collegeId: number, branchId: number) {
  const { data, error } = await supabase
    .from("faculty")
    .select("facultyId, fullName, email")
    .eq("collegeId", collegeId)
    .eq("collegeBranchId", branchId)
    .eq("isActive", true)
    .order("fullName");

  if (error) {
    console.error("Error fetching faculty:", error);
    return [];
  }
  return data;
}

type UpsertUnitPayload = {
  collegeId: number;
  collegeSubjectId: number;
  adminId: number;
  facultyId: number;
  unitNumber: number;
  unitTitle: string;
  startDate?: string;
  endDate?: string;
  topics: string[];
};

export async function upsertAdminSubjectUnit(payload: UpsertUnitPayload) {
  const {
    collegeId,
    collegeSubjectId,
    adminId,
    facultyId,
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
        createdBy: facultyId,
        isAdmin: adminId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      { onConflict: "collegeId,collegeSubjectId,unitNumber" },
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

  if (topics.length > 0) {
    const topicRows = topics.map((topic, index) => ({
      topicTitle: topic,
      displayOrder: index + 1,
      collegeSubjectUnitId,
      collegeSubjectId,
      collegeId,
      createdBy: facultyId,
      // isAdmin: adminId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));

    const { error: topicError } = await supabase
      .from("college_subject_unit_topics")
      .upsert(topicRows, {
        onConflict: "collegeSubjectUnitId,topicTitle",
      });

    if (topicError) throw topicError;
  }

  return { success: true, collegeSubjectUnitId };
}

export async function saveAdminAcademicUnit(params: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  collegeSubjectId: number;
  collegeSectionId: number;
  collegeSubjectUnitId: number;
  adminId: number;
  facultyId: number;
}) {
  const { error } = await supabase.from("academics").insert({
    collegeId: params.collegeId,
    collegeEducationId: params.collegeEducationId,
    collegeBranchId: params.collegeBranchId,
    collegeAcademicYearId: params.collegeAcademicYearId,
    collegeSemesterId: params.collegeSemesterId,
    collegeSubjectId: params.collegeSubjectId,
    collegeSectionsId: params.collegeSectionId,
    collegeSubjectUnitId: params.collegeSubjectUnitId,
    createdBy: params.facultyId, // ✅ Legit Faculty ID
    isAdmin: params.adminId, // ✅ Audit Trail
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (error) throw error;
}
