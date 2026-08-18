"use server";

import { createClient } from "@/app/utils/supabase/server";
import { CardProps } from "@/lib/types/faculty";

export async function getFacultySubjectsPaginated(params: {
  collegeId: number;
  facultyId?: number; // Ensure facultyId is passed for accurate section mapping
  collegeEducationId?: number;
  collegeBranchId?: number;
  academicYearIds?: number[];
  subjectIds?: number[];
  sectionIds?: number[];
  subjectId?: number | null;
  sectionId?: number | null;
  page?: number;
  limit?: number;
}): Promise<{ data: CardProps[]; totalCount: number }> {
  const {
    collegeId,
    facultyId,
    subjectIds,
    sectionIds,
    subjectId = null,
    sectionId = null,
    page = 1,
    limit = 6,
  } = params;

  if (!facultyId) {
    console.warn("getFacultySubjectsPaginated called without facultyId, returning empty");
    return { data: [], totalCount: 0 };
  }

  const supabase = await createClient();

  // ── 1. Pagination over faculty_sections (subject-section pairs) ──
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let sectionQuery = supabase
    .from("faculty_sections")
    .select(`
      facultySectionId,
      collegeSubjectId,
      collegeSectionsId,
      college_sections!inner (collegeSections),
      college_subjects!inner (
        subjectName,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        college_branch (collegeBranchCode),
        college_academic_year (collegeAcademicYear),
        college_semester (collegeSemester),
        college_education (collegeEducationType)
      )
    `, { count: "exact" })
    .eq("facultyId", facultyId)
    .is("deletedAt", null);

  // Apply filters
  if (subjectId) {
    sectionQuery = sectionQuery.eq("collegeSubjectId", subjectId);
  } else if (subjectIds && subjectIds.length > 0) {
    sectionQuery = sectionQuery.in("collegeSubjectId", subjectIds);
  }

  if (sectionId) {
    sectionQuery = sectionQuery.eq("collegeSectionsId", sectionId);
  } else if (sectionIds && sectionIds.length > 0) {
    sectionQuery = sectionQuery.in("collegeSectionsId", sectionIds);
  }

  // Add pagination
  sectionQuery = sectionQuery.range(from, to);

  const { data: facultySections, count: totalCount, error: sectionErr } = await sectionQuery;
  if (sectionErr) throw sectionErr;

  if (!facultySections || facultySections.length === 0) {
    return { data: [], totalCount: totalCount ?? 0 };
  }

  const paginatedSubjectIds = Array.from(new Set(facultySections.map((fs: any) => fs.collegeSubjectId)));
  const paginatedSectionIds = Array.from(new Set(facultySections.map((fs: any) => fs.collegeSectionsId)));

  // ── 2. Fetch units (Section-Aware) ──
  // Units might have a collegeSectionsId or be NULL (legacy)
  const { data: units, error: unitErr } = await supabase
    .from("college_subject_units")
    .select(`
      collegeSubjectUnitId,
      collegeSubjectId,
      collegeSectionsId,
      unitNumber,
      unitTitle,
      completionPercentage,
      startDate,
      endDate
    `)
    .eq("collegeId", collegeId)
    .in("collegeSubjectId", paginatedSubjectIds)
    .eq("isActive", true);

  if (unitErr) throw unitErr;

  // Filter units to those matching our paginated sections OR global units (legacy NULL)
  const relevantUnits = (units ?? []).filter(u => 
    u.collegeSectionsId === null || paginatedSectionIds.includes(u.collegeSectionsId)
  );
  
  const unitIds = relevantUnits.map(u => u.collegeSubjectUnitId);

  // ── 3. Fetch topics (Section-Aware) ──
  let topics: any[] = [];
  if (unitIds.length > 0) {
    const { data: fetchedTopics, error: topicErr } = await supabase
      .from("college_subject_unit_topics")
      .select(`
        collegeSubjectUnitId,
        topicTitle,
        collegeSectionsId,
        isCompleted,
        displayOrder
      `)
      .eq("collegeId", collegeId)
      .in("collegeSubjectUnitId", unitIds)
      .eq("isActive", true)
      .order("displayOrder", { ascending: true });

    if (topicErr) throw topicErr;
    topics = fetchedTopics ?? [];
  }

  // ── 4. Fetch Student Counts Concurrently for Unique Batches ──
  const uniqueBatches = Array.from(
    new Set(facultySections.map((fs: any) => {
      const subject = Array.isArray(fs.college_subjects) ? fs.college_subjects[0] : fs.college_subjects;
      return `${subject.collegeEducationId}-${subject.collegeBranchId}-${subject.collegeAcademicYearId}-${subject.collegeSemesterId}-${fs.collegeSectionsId}`;
    }))
  ) as string[];

  const studentCounts = new Map<string, number>();
  await Promise.all(
    uniqueBatches.map(async (batchKey) => {
      const [eduIdStr, branchIdStr, yearIdStr, semIdStr, sectionIdStr] = batchKey.split("-");
      const eduId = eduIdStr !== "null" && eduIdStr !== "undefined" ? Number(eduIdStr) : null;
      const branchId = branchIdStr !== "null" && branchIdStr !== "undefined" ? Number(branchIdStr) : null;
      const yearId = yearIdStr !== "null" && yearIdStr !== "undefined" ? Number(yearIdStr) : null;
      const semId = semIdStr !== "null" && semIdStr !== "undefined" ? Number(semIdStr) : null;
      const secId = sectionIdStr !== "null" && sectionIdStr !== "undefined" ? Number(sectionIdStr) : null;

      let studentCountQuery = supabase
        .from("students")
        .select("studentId, student_academic_history!inner(studentAcademicHistoryId)", { count: "exact", head: true })
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .eq("status", "Active")
        .is("deletedAt", null)
        .eq("student_academic_history.isCurrent", true)
        .is("student_academic_history.deletedAt", null);

      if (eduId) {
        studentCountQuery = studentCountQuery.eq("collegeEducationId", eduId);
      } else {
        studentCountQuery = studentCountQuery.is("collegeEducationId", null);
      }

      if (branchId) {
        studentCountQuery = studentCountQuery.eq("collegeBranchId", branchId);
      } else {
        studentCountQuery = studentCountQuery.is("collegeBranchId", null);
      }

      if (secId) {
        studentCountQuery = studentCountQuery.eq("student_academic_history.collegeSectionsId", secId);
      } else {
        if (yearId) {
          studentCountQuery = studentCountQuery.eq("student_academic_history.collegeAcademicYearId", yearId);
        } else {
          studentCountQuery = studentCountQuery.is("student_academic_history.collegeAcademicYearId", null);
        }

        if (semId) {
          studentCountQuery = studentCountQuery.eq("student_academic_history.collegeSemesterId", semId);
        } else {
          studentCountQuery = studentCountQuery.is("student_academic_history.collegeSemesterId", null);
        }
      }

      const { count } = await studentCountQuery;
      studentCounts.set(batchKey, count ?? 0);
    })
  );

  // ── 5. Build card data for each subject-section pair ──
  const allCards: CardProps[] = facultySections.map((fs: any) => {
    const s = Array.isArray(fs.college_subjects) ? fs.college_subjects[0] : fs.college_subjects;
    
    // Filter units specifically for THIS section, prioritizing section-specific over global
    const unitsMap = new Map<number, any>();
    relevantUnits
      .filter(
        (u) =>
          u.collegeSubjectId === fs.collegeSubjectId &&
          (u.collegeSectionsId === fs.collegeSectionsId || u.collegeSectionsId === null)
      )
      .forEach((u) => {
        const existing = unitsMap.get(u.unitNumber);
        if (!existing || (existing.collegeSectionsId === null && u.collegeSectionsId !== null)) {
          unitsMap.set(u.unitNumber, u);
        }
      });
    const subjectUnits = Array.from(unitsMap.values());

    const branchCode = Array.isArray(s.college_branch)
      ? s.college_branch[0]?.collegeBranchCode
      : s.college_branch?.collegeBranchCode;

    const rawCS = fs.college_sections;
    const sectionName = Array.isArray(rawCS)
      ? rawCS[0]?.collegeSections ?? "-"
      : rawCS?.collegeSections ?? "-";

    const unitsCount = subjectUnits.length;
    const subjectUnitIds = subjectUnits.map((u) => u.collegeSubjectUnitId);
    
    // Filter topics specifically for THIS section (fallback to NULL global topics)
    const subjectTopics = topics.filter(
      (t) => subjectUnitIds.includes(t.collegeSubjectUnitId) && (t.collegeSectionsId === fs.collegeSectionsId || t.collegeSectionsId === null)
    );

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
          subjectUnits.reduce((sum, u) => sum + (u.completionPercentage ?? 0), 0) / subjectUnits.length
        );

    const joinedYear = Array.isArray(s.college_academic_year)
      ? s.college_academic_year[0]
      : s.college_academic_year;

    const yearName = joinedYear?.collegeAcademicYear || `Year ${s.collegeAcademicYearId}`;

    const semData = Array.isArray(s.college_semester)
      ? s.college_semester[0]
      : s.college_semester;

    const semesterDisplay = semData?.collegeSemester ? `Sem ${semData.collegeSemester}` : "-";

    const eduData = Array.isArray(s.college_education)
      ? s.college_education[0]
      : s.college_education;
    
    const educationType = eduData?.collegeEducationType || undefined;

    const batchKey = `${s.collegeEducationId}-${s.collegeBranchId}-${s.collegeAcademicYearId}-${s.collegeSemesterId}-${fs.collegeSectionsId}`;
    const students = studentCounts.get(batchKey) ?? 0;

    return {
      collegeId,
      collegeEducationId: s.collegeEducationId,
      educationType,
      collegeBranchId: s.collegeBranchId,
      branchCode: branchCode || "-",
      collegeAcademicYearId: s.collegeAcademicYearId,
      collegeSemesterId: s.collegeSemesterId,
      collegeSubjectId: fs.collegeSubjectId,
      collegeSectionId: fs.collegeSectionsId,
      sectionName,
      subjectTitle: s.subjectName,
      semester: semesterDisplay,
      year: yearName,
      units: unitsCount,
      topicsCovered,
      topicsTotal: subjectTopics.length,
      nextLesson,
      students: students ?? 0,
      percentage: subjectPercentage,
      fromDate,
      toDate,
    };
  });

  return { data: allCards, totalCount: totalCount ?? 0 };
}
