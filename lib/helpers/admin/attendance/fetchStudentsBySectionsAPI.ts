import { supabase } from "@/lib/supabaseClient";

const PRESENT_STATUSES = ["PRESENT", "LATE"] as const;
type PerformanceStatus = "Top" | "Good" | "Low";
type AttendanceStatus =
    | "PRESENT"
    | "ABSENT"
    | "LATE"
    | "LEAVE"
    | "CLASS_CANCEL"
    | "NA";


export async function fetchSectionStudents({
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSectionsId,
    page,
    limit,
    collegeSubjectId
}: {
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSectionsId: number;
    page: number;
    limit: number;
    collegeSubjectId?: number | null;
}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
        .from("student_academic_history")
        .select(
            `
      studentId,
      students!inner (
        studentId,
        isActive,
        users:userId (
          fullName,
          email
        )
      )
    `,
            { count: "exact" }
        )
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("collegeSectionsId", collegeSectionsId)
        .eq("isCurrent", true)
        .eq("students.collegeId", collegeId)
        .eq("students.collegeEducationId", collegeEducationId)
        .eq("students.collegeBranchId", collegeBranchId)
        .eq("students.isActive", true)
        .is("deletedAt", null)
        .range(from, to);

    if (error) throw error;
    if (!data?.length) return { data: [], totalCount: count ?? 0 };

    const studentIds = data.map((r) => r.studentId);

    // const { data: attendanceData } = await supabase
    //     .from("attendance_record")
    //     .select("studentId, status, reason, markedAt")
    //     .in("studentId", studentIds)
    //     .is("deletedAt", null);

    let attendanceQuery = supabase
        .from("attendance_record")
        .select("studentId, status, reason, markedAt")
        .in("studentId", studentIds)
        .is("deletedAt", null);

    // 🔴 MARKED CHANGE: APPLY SUBJECT FILTER
    if (collegeSubjectId) {
        attendanceQuery = attendanceQuery.eq(
            "collegeSubjectId",
            collegeSubjectId
        );
    }

    // 🔴 MARKED CHANGE
    const { data: attendanceData } = await attendanceQuery;

    /** ---------- AGGREGATION ---------- */
    const statsMap: Record<number, { total: number; present: number }> = {};
    const latestMap: Record<
        number,
        { status: AttendanceStatus; reason: string | null; markedAt: string }
    > = {};

    attendanceData?.forEach((r) => {
        if (!statsMap[r.studentId]) {
            statsMap[r.studentId] = { total: 0, present: 0 };
        }

        if (r.status !== "CLASS_CANCEL" && r.status !== "NA") {
            statsMap[r.studentId].total++;

            if (PRESENT_STATUSES.includes(r.status as any)) {
                statsMap[r.studentId].present++;
            }
        }

        const status = (
            ["PRESENT", "ABSENT", "LATE", "LEAVE", "CLASS_CANCEL"].includes(r.status)
                ? r.status
                : "NA"
        ) as AttendanceStatus;

        if (
            !latestMap[r.studentId] ||
            r.markedAt > latestMap[r.studentId].markedAt
        ) {
            latestMap[r.studentId] = {
                status,
                reason: r.reason,
                markedAt: r.markedAt,
            };
        }
    });

    const finalData = data.map((row: any) => {
        const student = Array.isArray(row.students)
            ? row.students[0]
            : row.students;

        const user = Array.isArray(student.users)
            ? student.users[0]
            : student.users;

        const stats = statsMap[row.studentId] ?? { total: 0, present: 0 };
        const percentage =
            stats.total === 0
                ? 0
                : Math.round((stats.present / stats.total) * 100);

        const latest = latestMap[row.studentId];

        return {
            studentId: row.studentId,
            fullName: user.fullName,
            email: user.email,
            attendance: latest?.status ?? "NA",
            reason: latest?.reason ?? "-",
            percentage,
            status: (
                percentage >= 90
                    ? "Top"
                    : percentage >= 70
                        ? "Good"
                        : "Low"
            ) as PerformanceStatus,
        };
    });

    return {
        data: finalData,
        totalCount: count ?? 0,
    };
}

export async function fetchSubjectsByContext({
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
}: {
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
}) {
    const { data, error } = await supabase
        .from("college_subjects")
        .select("collegeSubjectId, subjectName")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .is("deletedAt", null)
        .order("subjectName");

    if (error) throw error;

    return data ?? [];
}
