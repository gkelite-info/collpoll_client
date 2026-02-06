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
    params: AttendanceStatsParams
): Promise<AttendanceStatsResponse> {
    const { collegeId, collegeEducationId } = params;

    const [
        totalDepartments,
        currentStudents,
        studentsBelow75,
        pendingCorrections,
    ] = await Promise.all([
        getTotalDepartments(collegeId, collegeEducationId),
        getCurrentStudents(collegeId, collegeEducationId),
        getStudentsBelow75(collegeId, collegeEducationId),
        getPendingAttendanceCorrections(collegeId, collegeEducationId),
    ]);

    return {
        totalDepartments,
        totalStudents: currentStudents,
        studentsBelow75,
        pendingCorrections,
    };
}

/* ===============================
   HELPERS (MARKED)
================================ */

/* 🔹 TOTAL DEPARTMENTS */
async function getTotalDepartments(
    collegeId: number,
    collegeEducationId: number
): Promise<number> {
    const { count, error } = await supabase
        .from("college_branch")
        .select("*", { count: "exact", head: true })
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true);

    if (error) throw error;
    return count ?? 0;
}

/* 🔹 TOTAL CURRENT STUDENTS */
async function getCurrentStudents(
    collegeId: number,
    collegeEducationId: number
): Promise<number> {
    const { count, error } = await supabase
        .from("student_academic_history")
        .select(
            `
      studentId,
      students!inner(collegeId, collegeEducationId)
    `,
            { count: "exact", head: true }
        )
        .eq("isCurrent", true)
        .eq("students.collegeId", collegeId)
        .eq("students.collegeEducationId", collegeEducationId);

    if (error) throw error;
    return count ?? 0;
}

/* 🔹 STUDENTS BELOW 75% */
async function getStudentsBelow75(
    collegeId: number,
    collegeEducationId: number
): Promise<number> {
    // Step 1: get all current students
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

    if (error || !currentStudents?.length) return 0;

    const studentIds = currentStudents.map((s) => s.studentId);

    // Step 2: fetch attendance records
    const { data: attendance } = await supabase
        .from("attendance_record")
        .select("studentId, status")
        .in("studentId", studentIds);

    if (!attendance) return 0;

    // Step 3: calculate %
    const stats: Record<
        number,
        { total: number; present: number }
    > = {};

    attendance.forEach((rec) => {
        if (!stats[rec.studentId]) {
            stats[rec.studentId] = { total: 0, present: 0 };
        }
        stats[rec.studentId].total += 1;
        if (rec.status === "Present") {
            stats[rec.studentId].present += 1;
        }
    });

    return Object.values(stats).filter(
        (s) => (s.present / s.total) * 100 < 75
    ).length;
}

/* 🔹 PENDING ATTENDANCE CORRECTIONS */
async function getPendingAttendanceCorrections(
    collegeId: number,
    collegeEducationId: number
): Promise<number> {
    const { data, error } = await supabase
        .from("attendance_record")
        .select(
            `
      attendanceRecordId,
      students!inner(collegeId, collegeEducationId)
    `
        )
        .eq("status", "LEAVE")
        .eq("students.collegeId", collegeId)
        .eq("students.collegeEducationId", collegeEducationId);

    if (error) throw error;
    return data?.length ?? 0;
}
