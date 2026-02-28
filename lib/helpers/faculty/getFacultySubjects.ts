"use server";

import { supabase } from "@/lib/supabaseClient";
import { getStudentCountForAcademics } from "@/lib/helpers/profile/getStudentCountForAcademics";
import type { CardProps } from "@/app/(screens)/faculty/academics/components/subjectCards"; 
// 👆 adjust this import path to wherever CardProps is defined

export async function getFacultySubjects(params: {
  collegeId: number;
  facultyId: number;
}) {
  const { collegeId } = params;

  const { data: subjects, error: subjectErr } = await supabase
    .from("college_subjects")
    .select(`
      collegeSubjectId,
      subjectName,

      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSemesterId,

      collegeId
    `)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (subjectErr) throw subjectErr;

  console.log(
    "📚 SUBJECTS FROM DB:",
    (subjects ?? []).map((s) => ({
      id: s.collegeSubjectId,
      name: s.subjectName,
      edu: s.collegeEducationId,
      branch: s.collegeBranchId,
      year: s.collegeAcademicYearId,
      sem: s.collegeSemesterId,
    }))
  );

  const { data: units, error: unitErr } = await supabase
    .from("college_subject_units")
    .select(`
      collegeSubjectUnitId,
      collegeSubjectId,
      unitNumber,
      unitTitle,
      completionPercentage,
      startDate,
      endDate
    `)
    .eq("collegeId", collegeId)
    .eq("isActive", true);

  if (unitErr) throw unitErr;

  const { data: topics, error: topicErr } = await supabase
    .from("college_subject_unit_topics")
    .select(`
      collegeSubjectUnitId,
      topicTitle,
      isCompleted,
      displayOrder,
      collegeSubjectId
    `)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .order("displayOrder", { ascending: true });

  if (topicErr) throw topicErr;

  const topicsBySubject = new Map<number, typeof topics>();

  for (const t of topics ?? []) {
    const arr = topicsBySubject.get(t.collegeSubjectId) ?? [];
    arr.push(t);
    topicsBySubject.set(t.collegeSubjectId, arr);
  }

  const result: CardProps[] = await Promise.all(
    (subjects ?? []).map(async (s) => {
      const subjectUnits = (units ?? []).filter(
        (u) => u.collegeSubjectId === s.collegeSubjectId
      );

      const unitsCount = subjectUnits.length;
      const subjectTopics = topicsBySubject.get(s.collegeSubjectId) ?? [];

      const topicsCovered = subjectTopics.filter((t) => t.isCompleted === true).length;

      let nextLesson = "-";
      const sortedUnits = [...subjectUnits].sort((a, b) => a.unitNumber - b.unitNumber);

      for (const unit of sortedUnits) {
        const unitTopics = subjectTopics
          .filter((t) => t.collegeSubjectUnitId === unit.collegeSubjectUnitId)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        const firstIncompleteTopic = unitTopics.find((t) => t.isCompleted === false);

        if (firstIncompleteTopic) {
          nextLesson = firstIncompleteTopic.topicTitle;
          break;
        }
      }

      if (nextLesson === "-") nextLesson = "Completed";

      const subjectUnitDates = subjectUnits.filter((u) => u.startDate && u.endDate);

      const fromDate =
        subjectUnitDates.length > 0
          ? new Date(
              Math.min(...subjectUnitDates.map((u) => new Date(u.startDate).getTime()))
            ).toLocaleDateString("en-GB")
          : "-";

      const toDate =
        subjectUnitDates.length > 0
          ? new Date(
              Math.max(...subjectUnitDates.map((u) => new Date(u.endDate).getTime()))
            ).toLocaleDateString("en-GB")
          : "-";

      const subjectPercentage =
        subjectUnits.length === 0
          ? 0
          : Math.round(
              subjectUnits.reduce((sum, u) => sum + (u.completionPercentage ?? 0), 0) /
                subjectUnits.length
            );

      console.log("➡️ Fetching student count for subject:", {
        collegeId,
        collegeAcademicYearId: s.collegeAcademicYearId,
        collegeSemesterId: s.collegeSemesterId,
        collegeSubjectId: s.collegeSubjectId,
      });

      const students = await getStudentCountForAcademics({
        collegeId: collegeId,
        collegeAcademicYearId: s.collegeAcademicYearId,
        collegeSemesterId: s.collegeSemesterId,
      });

      return {
        collegeId,
        collegeEducationId: s.collegeEducationId,
        collegeBranchId: s.collegeBranchId,
        collegeAcademicYearId: s.collegeAcademicYearId,
        collegeSemesterId: s.collegeSemesterId,
        collegeSubjectId: s.collegeSubjectId,
        subjectTitle: s.subjectName,
        semester: `Sem ${s.collegeSemesterId}`,
        year: `Year ${s.collegeAcademicYearId}`,
        units: unitsCount,
        topicsCovered,
        topicsTotal: subjectTopics.length,
        nextLesson,
        students,
        percentage: subjectPercentage,
        fromDate,
        toDate,
      };
    })
  );

  return result;
}