import { supabase } from "@/lib/supabaseClient";
import { fetchStudentsWithProfile } from "@/lib/helpers/faculty/fetchStudents";
import { resolveGradePoints, resolvePassFail } from "./gradeHelper";

export async function getMemorandumOfGrades(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number | null,
  sectionId: number,
  academicYearId: number,
  semesterIdNum: number,
  subjectName: string,
  targetSubjectIdArg: number | null,
  scheduleId: number | null,
  facultySections: any[],
  page: number = 1,
  pageSize: number = 20,
  isSchool: boolean = false
) {
  try {
    // 1. Resolve subject details (id, code, credits)
    let targetSubjectId: number | undefined = targetSubjectIdArg || undefined;
    let subjectCode = "";
    let credits = 3.0;

    if (!targetSubjectId && subjectName && subjectName !== "N/A") {
      let subjectQuery = supabase
        .from("college_subjects")
        .select("collegeSubjectId, subjectCode, credits")
        .eq("subjectName", subjectName)
        .eq("collegeAcademicYearId", academicYearId)
        .is("deletedAt", null);

      if (!isSchool && collegeBranchId) {
        subjectQuery = subjectQuery.eq("collegeBranchId", collegeBranchId);
      }

      const { data: subData } = await subjectQuery.limit(1);
      
      if (subData && subData.length > 0) {
        targetSubjectId = subData[0].collegeSubjectId;
        subjectCode = subData[0].subjectCode || "";
        credits = Number(subData[0].credits) || 3.0;
      } else {
        // Fallback: match by subject name
        let fallbackQuery = supabase
          .from("college_subjects")
          .select("collegeSubjectId, subjectCode, credits")
          .ilike("subjectName", subjectName)
          .is("deletedAt", null);

        if (collegeId) {
          fallbackQuery = fallbackQuery.eq("collegeId", collegeId);
        }

        const { data: fbData } = await fallbackQuery.limit(1);
        if (fbData && fbData.length > 0) {
          targetSubjectId = fbData[0].collegeSubjectId;
          subjectCode = fbData[0].subjectCode || "";
          credits = Number(fbData[0].credits) || 3.0;
        }
      }
    }

    // 2. Fetch students for this section & year
    const result = await fetchStudentsWithProfile(collegeId, {
      sectionId: sectionId,
      yearId: academicYearId,
      fetchAll: true,
    });
    let students = result.data || [];

    // Fallback to student_academic_history if needed
    if (students.length === 0) {
      const { data: historyRows } = await supabase
        .from("student_academic_history")
        .select("studentId")
        .eq("collegeSectionsId", sectionId)
        .eq("collegeAcademicYearId", academicYearId)
        .eq("isCurrent", true)
        .is("deletedAt", null);

      if (historyRows && historyRows.length > 0) {
        students = historyRows.map((h: any) => ({
          id: h.studentId,
          name: `Student ${h.studentId}`,
          studentId: h.studentId,
        }));
      }
    }

    const studentIds = students.map((s: any) => s.id || s.studentId);

    const pinMap = new Map<number, string>();
    const resultsMap = new Map<number, any>();

    if (studentIds.length > 0) {
      // 3. Fetch student pins
      const { data: pinRows } = await supabase
        .from("student_pins")
        .select("studentId, pinNumber")
        .in("studentId", studentIds)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null);

      if (pinRows) {
        pinRows.forEach(p => {
          if (p.pinNumber) {
            pinMap.set(p.studentId, p.pinNumber.trim());
          }
        });
      }

      // 4. Fetch results
      if (targetSubjectId) {
        let query = supabase
          .from("results")
          .select("*")
          .in("studentId", studentIds)
          .eq("subjectId", targetSubjectId)
          .is("deletedAt", null);

        if (scheduleId) {
          query = query.eq("collegeExamScheduleId", scheduleId);
        }

        const { data: resultsRows } = await query;

        if (resultsRows) {
          resultsRows.forEach(r => {
            resultsMap.set(r.studentId, r);
          });
        }
      }
    }

    // 5. Build section map
    const sectionMap = new Map<number, string>();
    facultySections?.forEach(fs => {
      if (fs.collegeSectionsId && fs.college_sections?.collegeSections) {
        sectionMap.set(fs.collegeSectionsId, fs.college_sections.collegeSections);
      }
    });

    // 6. Map students to StudentGradeRow
    // 6. Map students to StudentGradeRow

    const mappedGrades = students.map((s: any) => {
      const studentKeyId = s.id || s.studentId;
      const pin = pinMap.get(studentKeyId) || `STU-${studentKeyId}`;
      const res = resultsMap.get(studentKeyId);
      
      const historyArr = s.student_academic_history;
      let secIdNum: number | undefined;
      
      if (Array.isArray(historyArr)) {
         secIdNum = historyArr[0]?.collegeSectionsId;
      } else if (historyArr) {
         secIdNum = (historyArr as any).collegeSectionsId;
      }

      const sectionName = secIdNum ? (sectionMap.get(secIdNum) || "") : "";

      const grade = res?.grade || "N/A";
      const totalMarks = res?.total;
      const gradePoints = resolveGradePoints(grade, totalMarks);
      const passFail = resolvePassFail(grade);

      return {
        studentId: pin,
        studentName: s.name,
        subjectCode: subjectCode || "N/A",
        gradeSecured: grade,
        gradePoints,
        results: passFail,
        credits: credits.toFixed(1),
        section: sectionName,
      };
    });

    // Sort alphabetically by roll number/pin
    mappedGrades.sort((a, b) => a.studentId.localeCompare(b.studentId));

    // 7. Paginate
    const totalCount = mappedGrades.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = mappedGrades.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalCount,
    };
  } catch (error) {
    console.error("getMemorandumOfGrades error:", error);
    throw error;
  }
}
