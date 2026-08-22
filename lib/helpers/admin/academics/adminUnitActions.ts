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
  educationType: string;
  branchId: number;
  branchCode: string;
  academicYearId: number;
  semesterId: number;
  subjectId: number;
  sectionId: number;
  facultyId: number;
  facultyName: string;
  subjectName: string;
  academicYear: string;
  semester: string;
  sectionName?: string;
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
        college_academic_year ( collegeAcademicYear ),
        college_education ( collegeEducationType ),
        college_branch ( collegeBranchCode ),
        college_subject_units (
          collegeSubjectUnitId,
          unitNumber,
          unitTitle,
          startDate,
          endDate,
          completionPercentage,
          collegeSectionsId,
          isActive,
          college_subject_unit_topics (
            collegeSubjectUnitTopicId,
            topicTitle,
            isCompleted,
            displayOrder,
            collegeSubjectUnitId,
            collegeSectionsId,
            isActive
          )
        )
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
    const educationObj = Array.isArray(subject.college_education)
      ? subject.college_education[0]
      : subject.college_education;
    const branchObj = Array.isArray(subject.college_branch)
      ? subject.college_branch[0]
      : subject.college_branch;

    const semesterName = semesterObj?.collegeSemester ?? "N/A";
    const yearName = yearObj?.collegeAcademicYear ?? "N/A";
    const educationType = educationObj?.collegeEducationType ?? "Education";
    const branchCode = branchObj?.collegeBranchCode ?? "Branch";

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

    const { data: sectionData } = await supabase
      .from("college_sections")
      .select("collegeSections")
      .eq("collegeSectionsId", sectionId)
      .single();
    
    const sectionName = sectionData?.collegeSections ?? `Section ${sectionId}`;

    const context: SubjectContext = {
      collegeId,
      educationId: subject.collegeEducationId,
      educationType,
      branchId: subject.collegeBranchId,
      branchCode,
      academicYearId: subject.collegeAcademicYearId,
      semesterId: subject.collegeSemesterId,
      subjectId: subjectId,
      sectionId: sectionId,
      facultyId: facultyId,
      facultyName: facultyName,
      subjectName: subject.subjectName,
      academicYear: yearName,
      semester: semesterName,
      sectionName: sectionName,
    };

    // Units are fetched through the selected subject (and therefore its
    // academic year). A section-specific unit overrides its global version.
    const rawUnits = (subject.college_subject_units || []).filter(
      (unit: any) =>
        unit.isActive !== false &&
        (unit.collegeSectionsId == null || unit.collegeSectionsId === sectionId),
    );
    const unitsByNumber = new Map<number, any>();
    rawUnits.forEach((unit: any) => {
      const existing = unitsByNumber.get(unit.unitNumber);
      if (
        !existing ||
        (existing.collegeSectionsId == null && unit.collegeSectionsId != null)
      ) {
        unitsByNumber.set(unit.unitNumber, unit);
      }
    });
    const resolvedUnits = Array.from(unitsByNumber.values()).sort(
      (a, b) => a.unitNumber - b.unitNumber,
    );

    const uiUnits: UiUnit[] = resolvedUnits.map((u) => {
      const rawUnitTopics = (u.college_subject_unit_topics || []).filter(
        (topic: any) =>
          topic.isActive !== false &&
          (topic.collegeSectionsId == null || topic.collegeSectionsId === sectionId),
      );
      const topicsByTitle = new Map<string, (typeof rawUnitTopics)[number]>();
      rawUnitTopics.forEach((topic: any) => {
        const key = topic.topicTitle?.trim().toLowerCase() || String(topic.collegeSubjectUnitTopicId);
        const existing = topicsByTitle.get(key);
        if (
          !existing ||
          (existing.collegeSectionsId == null && topic.collegeSectionsId != null)
        ) {
          topicsByTitle.set(key, topic);
        }
      });
      const unitTopics = Array.from(topicsByTitle.values()).sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
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
