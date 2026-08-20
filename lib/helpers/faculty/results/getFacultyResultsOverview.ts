import { supabase } from "@/lib/supabaseClient";

export type ResultsOverviewParams = {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number | null;
  facultyId: number;
  isSchool: boolean;
  subjectName?: string;
  sectionName?: string;
  page?: number;
  pageSize?: number;
  branchName?: string;
};

export type ResultsOverviewRow = {
  id: string;
  examType: string;
  semesterId: number;
  branch: string;
  branchId: number | null;
  year: string;
  section: string;
  students: number;
  status: "UPLOADED" | "NOT UPLOADED";
  sectionId: number;
  academicYearId: number;
  collegeExamScheduleId: number;
};

export type ResultsOverviewResponse = {
  items: ResultsOverviewRow[];
  totalCount: number;
  totalUploaded: number;
  totalPending: number;
  subjects: string[];
  sections: string[];
};

export async function getFacultyResultsOverview(
  params: ResultsOverviewParams
): Promise<ResultsOverviewResponse> {
  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    facultyId,
    isSchool,
    subjectName = "",
    sectionName = "all",
    page = 1,
    pageSize = 10,
    branchName = "N/A",
  } = params;

  try {
    // 1. Fetch assigned sections for this faculty
    //    Using the same proven join pattern as facultyContextAPI.tsx
    //    faculty_branch:collegeBranchId resolves the branch code directly per row
    const { data: facultySections, error: facultyError } = await supabase
      .from("faculty_sections")
      .select(`
        facultySectionId,
        collegeSectionsId,
        collegeAcademicYearId,
        collegeBranchId,
        college_sections:collegeSectionsId (
          collegeSections,
          collegeBranchId
        ),
        college_academic_year:collegeAcademicYearId (
          collegeAcademicYear
        ),
        college_subjects:college_subjects!inner (
          collegeSubjectId,
          subjectName,
          collegeBranchId
        ),
        faculty_branch:collegeBranchId (
          collegeBranchCode
        )
      `)
      .eq("facultyId", facultyId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (facultyError) throw facultyError;

    // Helper to safely extract first item from Supabase nested relation (array or object)
    const getFirst = (rel: any) => (Array.isArray(rel) ? rel[0] : rel) ?? null;

    // Build lists for dropdowns
    const subjectSet = new Set<string>();
    const sectionSet = new Set<string>();

    facultySections?.forEach((fs: any) => {
      const subjectData = getFirst(fs.college_subjects);
      const sName = subjectData?.subjectName;
      if (sName) subjectSet.add(sName);
    });

    const subjects = Array.from(subjectSet).sort();

    // Filter sections by selected subject
    const targetSubject = subjectName || (subjects.length > 0 ? subjects[0] : "");
    const filteredBySubject =
      facultySections?.filter((fs: any) => {
        const subjectData = getFirst(fs.college_subjects);
        return subjectData?.subjectName === targetSubject;
      }) || [];

    filteredBySubject.forEach((fs: any) => {
      const secData = getFirst(fs.college_sections);
      const secName = secData?.collegeSections;
      if (secName) sectionSet.add(secName);
    });

    const allSectionsForSubject = Array.from(sectionSet).sort();

    // Apply section filter if provided
    let finalSections = filteredBySubject;
    if (sectionName && sectionName !== "all") {
      finalSections = finalSections.filter((fs: any) => {
        const secData = getFirst(fs.college_sections);
        return secData?.collegeSections === sectionName;
      });
    }

    if (finalSections.length === 0) {
      return {
        items: [],
        totalCount: 0,
        totalUploaded: 0,
        totalPending: 0,
        subjects,
        sections: allSectionsForSubject,
      };
    }

    // 2. Get active exam schedules
    const { data: schedules, error: scheduleError } = await supabase
      .from("college_exam_schedules")
      .select("*")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (scheduleError) throw scheduleError;

    // Fetch branches map for fallback branch resolution
    const { data: branches } = await supabase
      .from("college_branches")
      .select("collegeBranchId, collegeBranchCode")
      .eq("collegeId", collegeId)
      .is("deletedAt", null);

    const branchMap: Record<number, string> = {};
    branches?.forEach((b) => {
      branchMap[b.collegeBranchId] = b.collegeBranchCode;
    });

    // 3. For each section, find students and matching schedules
    let allDynamicClasses: ResultsOverviewRow[] = [];

    const sectionPromises = finalSections.map(async (sec: any) => {
      const yearData = getFirst(sec.college_academic_year);
      const secData = getFirst(sec.college_sections);
      const subjectData = getFirst(sec.college_subjects);
      const branchData = getFirst(sec.faculty_branch);

      const yearName = yearData?.collegeAcademicYear || "N/A";
      const secName = secData?.collegeSections || "N/A";

      // ============================================================================
      // BRANCH RESOLUTION (per schoolHelper.ts guidelines)
      // ============================================================================
      // For Schools: No branch concept → always "N/A"
      // For Inter/College: Resolve the SINGLE branch for this faculty_sections row
      //
      // Priority chain:
      //   1. faculty_branch join (faculty_sections.collegeBranchId → college_branches.collegeBranchCode)
      //      This is the PROVEN pattern from facultyContextAPI.tsx — each faculty_sections
      //      row is assigned to exactly ONE branch.
      //   2. college_subjects.collegeBranchId → branchMap lookup
      //   3. college_sections.collegeBranchId → branchMap lookup
      //   4. "N/A" safe fallback (NEVER the comma-joined multi-branch string)
      // ============================================================================
      let resolvedBranchName = "N/A";
      if (!isSchool) {
        if (branchData?.collegeBranchCode) {
          // Best source: direct join from faculty_sections.collegeBranchId → college_branches
          resolvedBranchName = branchData.collegeBranchCode;
        } else if (subjectData?.collegeBranchId && branchMap[subjectData.collegeBranchId]) {
          // Fallback: subject's own branch
          resolvedBranchName = branchMap[subjectData.collegeBranchId];
        } else if (secData?.collegeBranchId && branchMap[secData.collegeBranchId]) {
          // Fallback: section's branch
          resolvedBranchName = branchMap[secData.collegeBranchId];
        } else if (collegeBranchId && branchMap[collegeBranchId]) {
          // Fallback: Global context branch (works for single branch faculty)
          resolvedBranchName = branchMap[collegeBranchId];
        } else if (branchName && branchName !== "N/A" && !branchName.includes(",")) {
           // Absolute last resort: if branchName is a single exact branch string, use it
           resolvedBranchName = branchName;
        }
      }

      // Find matching schedules
      // For multi-branch faculty, use the resolved branch to match schedules more precisely
      const resolvedBranchId =
        sec.collegeBranchId ||
        subjectData?.collegeBranchId ||
        secData?.collegeBranchId ||
        collegeBranchId;

      const matchingSchedules =
        schedules?.filter((s) => {
          const isSpecificMatch =
            s.collegeBranchId === resolvedBranchId &&
            s.academicYear === yearName &&
            s.collegeSectionsId === sec.collegeSectionsId;

          const isGeneralMatch =
            !s.collegeBranchId &&
            (!s.academicYear || s.academicYear === "") &&
            !s.collegeSectionsId;

          return isSpecificMatch || isGeneralMatch;
        }) || [];

      if (matchingSchedules.length === 0) return;

      // Fetch students for this section
      const { data: studentHistory } = await supabase
        .from("student_academic_history")
        .select("studentId")
        .eq("collegeSectionsId", sec.collegeSectionsId)
        .eq("collegeAcademicYearId", sec.collegeAcademicYearId)
        .eq("isCurrent", true)
        .is("deletedAt", null);

      const studentIds = studentHistory?.map((h) => h.studentId) || [];
      const studentCount = studentIds.length;

      // Resolve subject ID for results lookup — use the exact subject from the faculty_sections join
      const targetSubjectId = subjectData?.collegeSubjectId;

      // Fetch uploaded results for these students, subject, and schedules
      const scheduleIds = matchingSchedules.map((s) => s.collegeExamScheduleId);

      let uploadedScheduleIds = new Set<number>();

      if (studentCount > 0 && targetSubjectId && scheduleIds.length > 0) {
        const { data: results } = await supabase
          .from("results")
          .select("collegeExamScheduleId")
          .in("studentId", studentIds)
          .eq("subjectId", targetSubjectId)
          .in("collegeExamScheduleId", scheduleIds)
          .is("deletedAt", null);

        results?.forEach((r) => {
          if (r.collegeExamScheduleId != null) {
            uploadedScheduleIds.add(r.collegeExamScheduleId);
          }
        });
      }

      // Build row objects
      matchingSchedules.forEach((sch) => {
        const scheduleKey = `${sec.facultySectionId}-${sch.collegeExamScheduleId}`;
        const isUploaded = uploadedScheduleIds.has(sch.collegeExamScheduleId);

        let rowBranchName = resolvedBranchName;
        if (!isSchool && sch.collegeBranchId && branchMap[sch.collegeBranchId]) {
          rowBranchName = branchMap[sch.collegeBranchId];
        }

        allDynamicClasses.push({
          id: scheduleKey,
          examType: sch.scheduleTitle || sch.examType || "Exam",
          semesterId: sch.collegeSemesterId || 1,
          branch: rowBranchName,
          branchId: resolvedBranchId || null,
          year: yearName,
          section: secName,
          students: studentCount,
          status: isUploaded ? "UPLOADED" : "NOT UPLOADED",
          sectionId: sec.collegeSectionsId,
          academicYearId: sec.collegeAcademicYearId,
          collegeExamScheduleId: sch.collegeExamScheduleId,
        });
      });
    });

    await Promise.all(sectionPromises);

    // Calculate Upload stats
    let totalUploaded = 0;
    let totalPending = 0;
    allDynamicClasses.forEach((row) => {
      if (row.status === "UPLOADED") totalUploaded++;
      else totalPending++;
    });

    // Sort to ensure deterministic pagination (by year, then section, then examType)
    allDynamicClasses.sort((a, b) => {
      const yearA = String(a.year || "");
      const yearB = String(b.year || "");
      if (yearA !== yearB) return yearA.localeCompare(yearB);

      const secA = String(a.section || "");
      const secB = String(b.section || "");
      if (secA !== secB) return secA.localeCompare(secB);

      const examA = String(a.examType || "");
      const examB = String(b.examType || "");
      return examA.localeCompare(examB);
    });

    // Apply Pagination
    const totalCount = allDynamicClasses.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = allDynamicClasses.slice(
      startIndex,
      startIndex + pageSize
    );

    return {
      items: paginatedItems,
      totalCount,
      totalUploaded,
      totalPending,
      subjects,
      sections: allSectionsForSubject,
    };
  } catch (error: any) {
    console.error(
      "Error in getFacultyResultsOverview:",
      error?.message || error
    );
    return {
      items: [],
      totalCount: 0,
      totalUploaded: 0,
      totalPending: 0,
      subjects: [],
      sections: [],
    };
  }
}
