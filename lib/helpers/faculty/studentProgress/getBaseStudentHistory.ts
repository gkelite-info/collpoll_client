import { supabase } from "@/lib/supabaseClient";
import type { 
  FacultyStudentProgressDetailsScope, 
  StudentPinLookupRow, 
  StudentProfileLookupRow, 
  CurrentHistoryRow 
} from "./sharedProgressTypes";
import { getFirst } from "./sharedProgressTypes";

export async function getBaseStudentHistory(scope: FacultyStudentProgressDetailsScope) {
  const { data: pinRow, error: pinError } = await supabase
    .from("student_pins")
    .select("studentId, pinNumber")
    .eq("pinNumber", scope.rollNo)
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle<StudentPinLookupRow>();

  if (pinError) throw pinError;
  if (!pinRow?.studentId) return null;

  let studentQuery = supabase
    .from("students")
    .select(
      `
      studentId,
      userId,
      collegeEducationId,
      collegeBranchId,
      user:users (
        fullName,
        email,
        mobile,
        gender
      ),
      college_education:collegeEducationId (
        collegeEducationType
      ),
      college_branch:collegeBranchId (
        collegeBranchCode
      )
    `,
    )
    .eq("studentId", pinRow.studentId)
    .eq("collegeId", scope.collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

  const { data: studentRow, error: studentError } =
    await studentQuery.maybeSingle<StudentProfileLookupRow>();

  if (studentError) throw studentError;
  if (!studentRow) return null;

  const { data: historyRow, error: historyError } = await supabase
    .from("student_academic_history")
    .select(
      `
      studentId,
      collegeAcademicYearId,
      collegeSemesterId,
      collegeSectionsId,
      college_sections:collegeSectionsId (
        collegeSections
      ),
      college_academic_year:collegeAcademicYearId (
        collegeAcademicYear
      ),
      college_semester:collegeSemesterId (
        collegeSemester
      )
    `,
    )
    .eq("studentId", studentRow.studentId)
    .eq("isCurrent", true)
    .is("deletedAt", null)
    .maybeSingle<CurrentHistoryRow>();

  if (historyError) throw historyError;
  if (!historyRow) return null;

  if (
    !scope.academicYearIds.includes(historyRow.collegeAcademicYearId) ||
    !scope.sectionIds.includes(historyRow.collegeSectionsId)
  ) {
    return null;
  }

  const user = getFirst(studentRow.user);

  return {
    pinRow,
    studentRow,
    historyRow,
    user
  };
}
