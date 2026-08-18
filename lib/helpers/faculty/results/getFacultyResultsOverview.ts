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
};

export type ResultsOverviewRow = {
  id: string;
  examType: string;
  semesterId: number;
  branch: string;
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
  } = params;

  try {
    // 1. Fetch assigned sections for this faculty
    const { data: facultySections, error: facultyError } = await supabase
      .from("faculty_sections")
      .select(`
        facultySectionId,
        collegeSectionsId,
        collegeAcademicYearId,
        college_sections ( collegeSections ),
        college_academic_year ( collegeAcademicYear ),
        college_subjects (
          collegeSubjectId,
          subjectName
        )
      `)
      .eq("facultyId", facultyId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (facultyError) throw facultyError;

    // Build lists for dropdowns
    const subjectSet = new Set<string>();
    const sectionSet = new Set<string>();

    facultySections?.forEach((fs: any) => {
      const subjectData = Array.isArray(fs.college_subjects) ? fs.college_subjects[0] : fs.college_subjects;
      const sName = subjectData?.subjectName;
      if (sName) subjectSet.add(sName);
    });

    const subjects = Array.from(subjectSet).sort();
    
    // Filter sections by selected subject
    const targetSubject = subjectName || (subjects.length > 0 ? subjects[0] : "");
    const filteredBySubject = facultySections?.filter((fs: any) => {
      const subjectData = Array.isArray(fs.college_subjects) ? fs.college_subjects[0] : fs.college_subjects;
      return subjectData?.subjectName === targetSubject;
    }) || [];

    filteredBySubject.forEach((fs: any) => {
      // Supabase nested relation might return object or array depending on mapping
      const secData = Array.isArray(fs.college_sections) ? fs.college_sections[0] : fs.college_sections;
      const secName = secData?.collegeSections;
      if (secName) sectionSet.add(secName);
    });
    
    const allSectionsForSubject = Array.from(sectionSet).sort();
    
    // Apply section filter if provided
    let finalSections = filteredBySubject;
    if (sectionName && sectionName !== "all") {
      finalSections = finalSections.filter((fs: any) => {
        const secData = Array.isArray(fs.college_sections) ? fs.college_sections[0] : fs.college_sections;
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

    // 3. For each section, find students and matching schedules
    let allDynamicClasses: ResultsOverviewRow[] = [];

    const sectionPromises = finalSections.map(async (sec: any) => {
      const yearData = Array.isArray(sec.college_academic_year) ? sec.college_academic_year[0] : sec.college_academic_year;
      const secData = Array.isArray(sec.college_sections) ? sec.college_sections[0] : sec.college_sections;
      const subjectData = Array.isArray(sec.college_subjects) ? sec.college_subjects[0] : sec.college_subjects;

      const yearName = yearData?.collegeAcademicYear || "N/A";
      const secName = secData?.collegeSections || "N/A";

      // Find matching schedules
      const matchingSchedules = schedules?.filter((s) => {
        const isSpecificMatch =
          s.collegeBranchId === collegeBranchId &&
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

      // Resolve subject exactly like uploadFacultyResults does
      let subjectQuery = supabase
        .from("college_subjects")
        .select("collegeSubjectId")
        .eq("subjectName", subjectName)
        .eq("collegeAcademicYearId", sec.collegeAcademicYearId)
        .is("deletedAt", null);

      if (!isSchool && collegeBranchId) {
        subjectQuery = subjectQuery.eq("collegeBranchId", collegeBranchId);
      }

      const { data: subData } = await subjectQuery.limit(1);
      let targetSubjectId = subData && subData.length > 0 ? subData[0].collegeSubjectId : undefined;

      if (!targetSubjectId && subjectName && subjectName !== "N/A") {
        let fallbackQuery = supabase
          .from("college_subjects")
          .select("collegeSubjectId")
          .ilike("subjectName", subjectName)
          .is("deletedAt", null);

        if (collegeId) {
          fallbackQuery = fallbackQuery.eq("collegeId", collegeId);
        }

        const { data: fbData } = await fallbackQuery.limit(1);
        if (fbData && fbData.length > 0) {
          targetSubjectId = fbData[0].collegeSubjectId;
        }
      }

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

        allDynamicClasses.push({
          id: scheduleKey,
          examType: sch.scheduleTitle || sch.examType || "Exam",
          semesterId: sch.collegeSemesterId || 1,
          branch: "N/A", // Handled on client side if needed via context, or just "N/A"
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
    const paginatedItems = allDynamicClasses.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalCount,
      totalUploaded,
      totalPending,
      subjects,
      sections: allSectionsForSubject,
    };
  } catch (error: any) {
    console.error("Error in getFacultyResultsOverview:", error?.message || error);
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
