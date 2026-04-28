"use server";

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

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

const colorByUnitNumber = (n: number): UnitColor => {
  const mod = n % 3;
  if (mod === 1) return "purple";
  if (mod === 2) return "orange";
  return "blue";
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "TBD";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export async function getAdminSubjectDetails(
  collegeId: number,
  subjectId: number,
  sectionId: number,
) {
  try {
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

    const uiUnits: UiUnit[] = units.map((u) => {
      const unitTopics = allTopics.filter(
        (t) => t.collegeSubjectUnitId === u.collegeSubjectUnitId,
      );
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
        semester: semesterName,
        year: yearName,
      },
      context,
    };
  } catch (error) {
    console.error("Error fetching admin subject details:", error);
    return null;
  }
}

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
      isAdmin: adminId,
      updatedAt: now,
    })
    .eq("collegeSubjectUnitId", unitId);

  if (unitError) throw new Error("Failed to update unit percentage");

  revalidatePath("/admin/academics");
  return { success: true, newPercentage };
}

export async function deleteUnit(unitId: number, adminId: number) {
  const now = new Date().toISOString();
  try {
    const { error: unitError } = await supabase
      .from("college_subject_units")
      .update({
        isActive: false,
        deletedAt: now,
        isAdmin: adminId,
      })
      .eq("collegeSubjectUnitId", unitId);

    if (unitError) throw unitError;

    const { error: topicError } = await supabase
      .from("college_subject_unit_topics")
      .update({
        isActive: false,
        deletedAt: now,
      })
      .eq("collegeSubjectUnitId", unitId)
      .eq("isActive", true);

    if (topicError) throw topicError;

    revalidatePath("/admin/academics");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete unit and associated topics:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTopic(
  unitId: number,
  topicId: number,
  adminId: number,
) {
  const now = new Date().toISOString();
  try {
    const { error: deleteErr } = await supabase
      .from("college_subject_unit_topics")
      .update({
        isActive: false,
        deletedAt: now,
      })
      .eq("collegeSubjectUnitTopicId", topicId);

    if (deleteErr) throw deleteErr;

    const { data: topics, error: fetchError } = await supabase
      .from("college_subject_unit_topics")
      .select("isCompleted")
      .eq("collegeSubjectUnitId", unitId)
      .eq("isActive", true);

    if (fetchError) throw fetchError;

    const total = topics.length;
    const completed = topics.filter((t) => t.isCompleted).length;
    const newPercentage =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    const { error: unitError } = await supabase
      .from("college_subject_units")
      .update({
        completionPercentage: newPercentage,
        isAdmin: adminId,
        updatedAt: now,
      })
      .eq("collegeSubjectUnitId", unitId);

    if (unitError) throw unitError;

    revalidatePath("/admin/academics");
    return { success: true, newPercentage };
  } catch (error: any) {
    console.error("Failed to delete topic:", error);
    return { success: false, error: error.message };
  }
}
