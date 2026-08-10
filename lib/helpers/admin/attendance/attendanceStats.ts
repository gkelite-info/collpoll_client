import { supabase } from "@/lib/supabaseClient";

/* ===============================
   TYPES
================================ */
export type AttendanceStatsParams = {
  collegeId: number;
  collegeEducationId: number;
};

export type AttendanceStatsResponse = {
  totalDepartments: number;
  totalStudents: number;
  studentsBelow75: number;
  pendingCorrections: number;
};

/* ===============================
   MAIN HELPER
================================ */
export async function fetchAttendanceStats(
  params: AttendanceStatsParams,
): Promise<AttendanceStatsResponse> {
  const { collegeId, collegeEducationId } = params;

  const [
    totalDepartments,
    studentStatsOverview,
    pendingCorrections,
  ] = await Promise.all([
    getTotalDepartments(collegeId, collegeEducationId),
    getStudentStatsOverview(collegeId, collegeEducationId),
    getPendingAttendanceCorrections(collegeId, collegeEducationId),
  ]);

  return {
    totalDepartments,
    totalStudents: studentStatsOverview.totalStudents,
    studentsBelow75: studentStatsOverview.studentsBelow75,
    pendingCorrections,
  };
}

/* ===============================
   HELPERS (MARKED)
================================ */

import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

/* 🔹 TOTAL DEPARTMENTS / CLASSES */
async function getTotalDepartments(
  collegeId: number,
  collegeEducationId: number,
): Promise<number> {
  const { data: edu } = await supabase
    .from("college_education")
    .select("collegeEducationType")
    .eq("collegeEducationId", collegeEducationId)
    .single();

  const isSchool = isSchoolEducation(edu?.collegeEducationType);

  if (isSchool) {
    const { count, error } = await supabase
      .from("college_academic_year")
      .select("*", { count: "exact", head: true })
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (error) return 0;
    return count ?? 0;
  } else {
    const { count, error } = await supabase
      .from("college_branch")
      .select("*", { count: "exact", head: true })
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (error) return 0;
    return count ?? 0;
  }
}

/* 🔹 STUDENT STATS OVERVIEW (TOTAL & BELOW 75%) */
async function getStudentStatsOverview(
  collegeId: number,
  collegeEducationId: number,
): Promise<{ totalStudents: number; studentsBelow75: number }> {
  const { data: currentStudents, error } = await supabase
    .from("student_academic_history")
    .select(
      `
      studentId,
      students!inner(collegeId, collegeEducationId)
    `
    )
    .eq("isCurrent", true)
    .eq("students.collegeId", collegeId)
    .eq("students.collegeEducationId", collegeEducationId);

  if (error || !currentStudents?.length) {
    return { totalStudents: 0, studentsBelow75: 0 };
  }

  const studentIds = currentStudents.map((s) => s.studentId);
  const totalStudents = studentIds.length;

  return { totalStudents, studentsBelow75: 0 };
}

/* 🔹 PENDING ATTENDANCE CORRECTIONS */
async function getPendingAttendanceCorrections(
  collegeId: number,
  collegeEducationId: number,
): Promise<number> {
  const { count, error } = await supabase
    .from("attendance_record")
    .select(`attendanceRecordId, students!inner(collegeId, collegeEducationId)`, { count: "exact", head: true })
    .eq("status", "LEAVE")
    .eq("students.collegeId", collegeId)
    .eq("students.collegeEducationId", collegeEducationId);

  if (error) return 0;
  return count ?? 0;
}
