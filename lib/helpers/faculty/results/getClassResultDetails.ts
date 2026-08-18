import { supabase } from "@/lib/supabaseClient";
import { fetchStudentsWithProfile } from "@/lib/helpers/faculty/fetchStudents";

export async function getClassResultDetails(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number | null,
  sectionId: number,
  academicYearId: number,
  yearName: string,
  subjectName: string,
  targetSubjectIdArg: number | null,
  semesterId: number,
  isSchool: boolean,
  scheduleId: number | null,
  page: number = 1,
  pageSize: number = 20
) {
  try {
    let targetSubjectId: number | undefined = targetSubjectIdArg || undefined;

    // 1. Resolve subject details
    if (!targetSubjectId && subjectName && subjectName !== "N/A") {
      let subjectQuery = supabase
        .from("college_subjects")
        .select("collegeSubjectId")
        .eq("subjectName", subjectName)
        .eq("collegeAcademicYearId", academicYearId)
        .is("deletedAt", null);

      if (!isSchool && collegeBranchId) {
        subjectQuery = subjectQuery.eq("collegeBranchId", collegeBranchId);
      }

      const { data: subData } = await subjectQuery.limit(1);

      if (subData && subData.length > 0) {
        targetSubjectId = subData[0].collegeSubjectId;
      } else {
        // Fallback: match by subject name without academic year if needed
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
    }

    // 2. Fetch students enrolled in this section & year
    const { data: historyRows } = await supabase
      .from("student_academic_history")
      .select("studentId")
      .eq("collegeSectionsId", sectionId)
      .eq("collegeAcademicYearId", academicYearId)
      .eq("isCurrent", true)
      .is("deletedAt", null);

    let studentIds = historyRows?.map((h) => h.studentId) || [];

    // Also try fetchStudentsWithProfile as fallback if history query returned empty
    if (studentIds.length === 0) {
      const result = await fetchStudentsWithProfile(collegeId, {
        sectionId: sectionId,
        yearId: academicYearId,
        fetchAll: true,
      });
      const students = result.data || [];
      studentIds = students.map((s: any) => s.studentId || s.id);
    }

    const studentCount = studentIds.length;

    // 3. Fetch active exam schedules for this college
    let scheduleQuery = supabase
      .from("college_exam_schedules")
      .select("*")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (scheduleId) {
      scheduleQuery = scheduleQuery.eq("collegeExamScheduleId", scheduleId);
    }

    const { data: schedules, error: scheduleError } = await scheduleQuery;

    if (scheduleError) throw scheduleError;

    // 4. Fetch uploaded results for this class & subject
    const uploadedMap = new Map<number, string>(); // scheduleId -> uploadDate
    if (studentIds.length > 0 && targetSubjectId) {
      const { data: results } = await supabase
        .from("results")
        .select("collegeExamScheduleId, createdAt")
        .in("studentId", studentIds)
        .eq("subjectId", targetSubjectId)
        .is("deletedAt", null);

      results?.forEach((r) => {
        if (r.collegeExamScheduleId != null) {
          const prev = uploadedMap.get(r.collegeExamScheduleId);
          if (!prev || (r.createdAt && new Date(r.createdAt) > new Date(prev))) {
            uploadedMap.set(r.collegeExamScheduleId, r.createdAt);
          }
        }
      });
    }

    // 5. Match schedules to uploaded history rows
    const allHistory: any[] = [];
    const seenScheduleIds = new Set<number>();

    for (const s of (schedules || [])) {
      const isBranchMatch = isSchool
        ? !s.collegeBranchId || s.collegeBranchId === collegeBranchId
        : !s.collegeBranchId || s.collegeBranchId === collegeBranchId;

      const isYearMatch = !s.academicYear || s.academicYear === "" || s.academicYear === yearName;
      const isSectionMatch = !s.collegeSectionsId || s.collegeSectionsId === sectionId;

      const isMatchingSchedule = isBranchMatch && isYearMatch && isSectionMatch;
      const isUploaded = uploadedMap.has(s.collegeExamScheduleId);

      // Only display uploaded results in Previous Uploads History
      if (!isUploaded) continue;

      seenScheduleIds.add(s.collegeExamScheduleId);

      const rawDate = uploadedMap.get(s.collegeExamScheduleId);
      let uploadedOn = "-";
      if (rawDate) {
        const d = new Date(rawDate);
        uploadedOn = `${d.getDate()} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
      }

      let semesterText = "N/A";
      if (!isSchool) {
        semesterText = s.collegeSemesterId ? `Semester ${s.collegeSemesterId}` : "General";
      }

      allHistory.push({
        id: s.collegeExamScheduleId.toString(),
        examType: s.scheduleTitle || s.examType || "Exam",
        semester: semesterText,
        semesterId: s.collegeSemesterId || semesterId,
        uploadedOn,
        students: studentCount,
        status: "Published",
      });
    }

    // Check if any uploaded schedule was not found in active schedules list
    for (const [schedId, rawDate] of uploadedMap.entries()) {
      if (scheduleId && schedId !== scheduleId) continue;
      
      if (!seenScheduleIds.has(schedId)) {
        let uploadedOn = "-";
        if (rawDate) {
          const d = new Date(rawDate);
          uploadedOn = `${d.getDate()} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
        }
        allHistory.push({
          id: schedId.toString(),
          examType: "Exam",
          semester: isSchool ? "N/A" : "General",
          semesterId: semesterId,
          uploadedOn,
          students: studentCount,
          status: "Published",
        });
      }
    }

    // Sort by most recent first based on ID
    allHistory.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    // 6. Paginate
    const totalCount = allHistory.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = allHistory.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalCount,
    };
  } catch (error) {
    console.error("getClassResultDetails error:", error);
    throw error;
  }
}
