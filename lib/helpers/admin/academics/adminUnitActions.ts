"use server";

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

/* =========================================
   TYPES
   ========================================= */
export type UnitColor = "purple" | "orange" | "blue";

export type UiTopic = {
  id: number;
  title: string;
  isCompleted: boolean;
};

export type UiUnit = {
  id: number;
  unitLabel: string;
  title: string;
  color: UnitColor;
  dateRange: string;
  percentage: number;
  topics: UiTopic[];
};

export type SubjectContext = {
  collegeId: number;
  educationId: number;
  branchId: number;
  academicYearId: number;
  semesterId: number;
  subjectId: number;
  sectionId: number;
  facultyId: number;
  facultyName: string;
  subjectName: string;
  academicYear: string;
  semester: string;
};

/* =========================================
   HELPERS
   ========================================= */

const colorByUnitNumber = (n: number): UnitColor => {
  const mod = n % 3;
  if (mod === 1) return "purple";
  if (mod === 2) return "orange";
  return "blue"; // covers 0 (unit 3, 6, 9)
};

// 🟢 FIX: Better Date Formatting
const formatDate = (dateString: string | null) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "TBD";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

/* =========================================
   FETCH LOGIC
   ========================================= */

export async function getAdminSubjectDetails(
  collegeId: number,
  subjectId: number,
  sectionId: number,
) {
  try {
    // 1. Fetch Subject & Hierarchy
    const { data: rawSubject, error: subError } = await supabase
      .from("college_subjects")
      .select(
        `
        subjectName,
        credits,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        college_semester ( collegeSemester ),
        college_academic_year ( collegeAcademicYear )
      `,
      )
      .eq("collegeSubjectId", subjectId)
      .single();

    if (subError) throw subError;

    const subject = rawSubject as any;

    const semesterObj = Array.isArray(subject.college_semester)
      ? subject.college_semester[0]
      : subject.college_semester;

    const yearObj = Array.isArray(subject.college_academic_year)
      ? subject.college_academic_year[0]
      : subject.college_academic_year;

    const semesterName = semesterObj?.collegeSemester ?? "N/A";
    const yearName = yearObj?.collegeAcademicYear ?? "N/A";

    const { data: assignment } = await supabase
      .from("faculty_sections")
      .select("facultyId, faculty ( fullName )")
      .eq("collegeSectionsId", sectionId)
      .eq("collegeSubjectId", subjectId)
      .eq("isActive", true)
      .maybeSingle();

    const facultyId = assignment?.facultyId ?? 0;
    // @ts-ignore
    const facultyName = assignment?.faculty?.fullName ?? "Not Assigned";

    // 3. Build Context
    const context: SubjectContext = {
      collegeId,
      educationId: subject.collegeEducationId,
      branchId: subject.collegeBranchId,
      academicYearId: subject.collegeAcademicYearId,
      semesterId: subject.collegeSemesterId,
      subjectId: subjectId,
      sectionId: sectionId,
      facultyId: facultyId,
      facultyName: facultyName,
      subjectName: subject.subjectName,
      academicYear: yearName,
      semester: semesterName,
    };

    const { data: units, error: unitError } = await supabase
      .from("college_subject_units")
      .select(
        `
        collegeSubjectUnitId,
        unitNumber,
        unitTitle,
        startDate,
        endDate,
        completionPercentage
      `,
      )
      .eq("collegeSubjectId", subjectId)
      .eq("isActive", true)
      .order("unitNumber", { ascending: true });

    if (unitError) throw unitError;

    // 5. Fetch Topics...
    const unitIds = units.map((u) => u.collegeSubjectUnitId);
    let allTopics: any[] = [];

    if (unitIds.length > 0) {
      const { data: topics, error: topicError } = await supabase
        .from("college_subject_unit_topics")
        .select(
          `
            collegeSubjectUnitTopicId,
            topicTitle,
            isCompleted,
            displayOrder,
            collegeSubjectUnitId
        `,
        )
        .in("collegeSubjectUnitId", unitIds)
        .eq("isActive", true)
        .order("displayOrder", { ascending: true });

      if (topicError) throw topicError;
      allTopics = topics;
    }

    // 6. Transform to UI Model
    const uiUnits: UiUnit[] = units.map((u) => {
      // ... (Same mapping logic as before) ...
      const unitTopics = allTopics.filter(
        (t) => t.collegeSubjectUnitId === u.collegeSubjectUnitId,
      );
      // Reusing the formatting logic from previous step
      const sDate = formatDate(u.startDate);
      const eDate = formatDate(u.endDate);
      const dateRangeDisplay =
        sDate === "TBD" && eDate === "TBD"
          ? "Date Not Set"
          : `${sDate} - ${eDate}`;

      return {
        id: u.collegeSubjectUnitId,
        unitLabel: `Unit - ${u.unitNumber}`,
        title: u.unitTitle,
        color: colorByUnitNumber(u.unitNumber),
        dateRange: dateRangeDisplay,
        percentage: u.completionPercentage ?? 0,
        topics: unitTopics.map((t) => ({
          id: t.collegeSubjectUnitTopicId,
          title: t.topicTitle,
          isCompleted: t.isCompleted ?? false,
        })),
      };
    });

    return {
      units: uiUnits,
      details: {
        subjectName: subject.subjectName,
        credits: subject.credits,
        semester: semesterName, // ✅ Now strictly typed string
        year: yearName, // ✅ Now strictly typed string
      },
      context,
    };
  } catch (error) {
    console.error("Error fetching admin subject details:", error);
    return null;
  }
}

// ... (Keep updateUnitProgress logic same as before) ...
export async function updateUnitProgress(
  unitId: number,
  updates: { topicId: number; isCompleted: boolean }[],
  adminId: number,
) {
  const now = new Date().toISOString();

  const updatePromises = updates.map((u) =>
    supabase
      .from("college_subject_unit_topics")
      .update({
        isCompleted: u.isCompleted,
        isAdmin: adminId,
        updatedAt: now,
      })
      .eq("collegeSubjectUnitTopicId", u.topicId),
  );

  await Promise.all(updatePromises);

  const { data: topics, error: fetchError } = await supabase
    .from("college_subject_unit_topics")
    .select("isCompleted")
    .eq("collegeSubjectUnitId", unitId)
    .eq("isActive", true);

  if (fetchError) throw new Error("Failed to fetch sibling topics");

  const total = topics.length;
  const completed = topics.filter((t) => t.isCompleted).length;
  const newPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const { error: unitError } = await supabase
    .from("college_subject_units")
    .update({
      completionPercentage: newPercentage,
      updatedAt: now,
    })
    .eq("collegeSubjectUnitId", unitId);

  if (unitError) throw new Error("Failed to update unit percentage");

  revalidatePath("/admin/academics");
  return { success: true, newPercentage };
}
