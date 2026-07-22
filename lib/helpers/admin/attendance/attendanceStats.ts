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

  const { data: attendance, error: attErr } = await supabase
    .from("attendance_record")
    .select("studentId, status")
    .in("studentId", studentIds);

  if (attErr || !attendance?.length) {
    return { totalStudents, studentsBelow75: 0 };
  }

  const stats: Record<number, { total: number; present: number }> = {};

  attendance.forEach((rec) => {
    if (!stats[rec.studentId]) {
      stats[rec.studentId] = { total: 0, present: 0 };
    }

    const status = rec.status?.toUpperCase();

    if (["CLASS_CANCEL", "CANCELLED", "CANCEL_CLASS"].includes(status)) return;

    stats[rec.studentId].total += 1;

    if (["PRESENT", "LATE"].includes(status)) {
      stats[rec.studentId].present += 1;
    }
  });

  const studentsBelow75 = Object.values(stats).filter(
    (s) => s.total > 0 && (s.present / s.total) * 100 < 75,
  ).length;

  return { totalStudents, studentsBelow75 };
}

/* 🔹 PENDING ATTENDANCE CORRECTIONS */
async function getPendingAttendanceCorrections(
  collegeId: number,
  collegeEducationId: number,
): Promise<number> {
  const { data, error } = await supabase
    .from("attendance_record")
    .select(
      `
      attendanceRecordId,
      students!inner(collegeId, collegeEducationId)
    `,
    )
    .eq("status", "LEAVE")
    .eq("students.collegeId", collegeId)
    .eq("students.collegeEducationId", collegeEducationId);

  if (error) throw error;
  return data?.length ?? 0;
}
