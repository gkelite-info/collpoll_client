import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";

/* ================================
   STATUS RULES
================================ */
const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;
const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;
const CANCELLED_STATUSES = ["CLASS_CANCEL", "CANCEL_CLASS"] as const;

type StatusFilter = "ALL" | "ATTENDED" | "ABSENT" | "LEAVE";

/* ================================
   ROW TYPE (THIS FIXES TS)
================================ */
type AttendanceRow = {
    attendanceRecordId: number;
    calendarEventId: number;
    status: string;
    reason: string | null;
    markedAt: string;
    calendar_event: {
        calendarEventId: number;
        subject: number;
        facultyId: number;
        date: string;
        fromTime: string;
        toTime: string;
    } | null;
};

function isCancelledStatus(
    status: string
): status is (typeof CANCELLED_STATUSES)[number] {
    return (CANCELLED_STATUSES as readonly string[]).includes(status);
}


/* ================================
   MAIN HELPER
================================ */
export async function getStudentAttendanceDetails({
    userId,
    subjectId,
    facultyId,
    statusFilter = "ALL",
}: {
    userId: number;
    subjectId?: number;
    facultyId?: number;
    statusFilter?: StatusFilter;
}) {
    /* ---------- 1️⃣ Student context ---------- */
    const ctx = await fetchStudentContext(userId);
    const { studentId } = ctx;

    /* ---------- 2️⃣ Attendance + event ---------- */
    const { data, error } = await supabase
        .from("attendance_record")
        .select(`
      attendanceRecordId,
      calendarEventId,
      status,
      reason,
      markedAt,
      calendar_event:calendarEventId (
        calendarEventId,
        subject,
        facultyId,
        date,
        fromTime,
        toTime
      )
    `)
        .eq("studentId", studentId)
        .is("deletedAt", null)
        .returns<AttendanceRow[]>();

    if (error) throw error;
    if (!data?.length) return emptyResult();

    /* ---------- 3️⃣ Base rows (NEVER change) ---------- */
    const baseRows = data.filter(
        r =>
            !isCancelledStatus(r.status) &&
            (!subjectId || r.calendar_event?.subject === subjectId) &&
            (!facultyId || r.calendar_event?.facultyId === facultyId)
    );

    /* ---------- 2.1️⃣ Fetch subject & faculty names ---------- */
    const subjectIds = [
        ...new Set(
            baseRows
                .map(r => r.calendar_event?.subject)
                .filter(Boolean)
        ),
    ];

    const facultyIds = [
        ...new Set(
            baseRows
                .map(r => r.calendar_event?.facultyId)
                .filter(Boolean)
        ),
    ];

    const { data: subjects } = await supabase
        .from("college_subjects")
        .select("collegeSubjectId, subjectName")
        .in("collegeSubjectId", subjectIds);

    const { data: faculty } = await supabase
        .from("faculty")
        .select("facultyId, fullName")
        .in("facultyId", facultyIds);

    const subjectMap = new Map(
        (subjects ?? []).map(s => [s.collegeSubjectId, s.subjectName])
    );

    const facultyMap = new Map(
        (faculty ?? []).map(f => [f.facultyId, f.fullName])
    );

    /* ---------- 4️⃣ Table filter ONLY ---------- */
    let filteredRows = baseRows;

    if (statusFilter === "ATTENDED") {
        filteredRows = baseRows.filter(r =>
            ATTENDED_STATUSES.includes(r.status as any)
        );
    } else if (statusFilter === "ABSENT") {
        filteredRows = baseRows.filter(r => r.status === "ABSENT");
    } else if (statusFilter === "LEAVE") {
        filteredRows = baseRows.filter(r => r.status === "LEAVE");
    }


    // /* ---------- 5️⃣ Status filter ---------- */
    // if (statusFilter === "ATTENDED") {
    //     filtered = filtered.filter(r =>
    //         ATTENDED_STATUSES.includes(r.status as any)
    //     );
    // } else if (statusFilter === "ABSENT") {
    //     filtered = filtered.filter(r => r.status === "ABSENT");
    // } else if (statusFilter === "LEAVE") {
    //     filtered = filtered.filter(r => r.status === "LEAVE");
    // }

    /* ---------- 6️⃣ Header stats ---------- */
    const conductedSet = new Set<number>();
    const attendedSet = new Set<number>();
    let absent = 0;
    let leave = 0;

    for (const r of baseRows) {
        if (CONDUCTED_STATUSES.includes(r.status as any)) {
            conductedSet.add(r.calendarEventId);
        }

        if (ATTENDED_STATUSES.includes(r.status as any)) {
            attendedSet.add(r.calendarEventId);
        }

        if (r.status === "ABSENT") absent++;
        if (r.status === "LEAVE") leave++;
    }

    const total = conductedSet.size;
    const attended = attendedSet.size;

    /* ---------- 7️⃣ Table rows ---------- */
    const rows = filteredRows.map(r => ({
        calendarEventId: r.calendarEventId,
        date: r.calendar_event!.date,
        time: `${r.calendar_event!.fromTime} - ${r.calendar_event!.toTime}`,
        subjectId: r.calendar_event!.subject,
        facultyId: r.calendar_event!.facultyId,
        subjectName: subjectMap.get(r.calendar_event!.subject) ?? "-",
        facultyName: facultyMap.get(r.calendar_event!.facultyId) ?? "-",
        status: r.status,
        reason: r.reason ?? "-",
    }));

    return {
        subjectName: rows[0]?.subjectName ?? "-",
        facultyName: rows[0]?.facultyName ?? "-",
        headerStats: {
            total,
            attended,
            absent,
            leave,
            percentage:
                total === 0 ? 0 : Math.round((attended / total) * 100),
        },
        rows,
    };
}

/* ================================
   EMPTY
================================ */
function emptyResult() {
    return {
        headerStats: {
            total: 0,
            attended: 0,
            absent: 0,
            leave: 0,
            percentage: 0,
        },
        rows: [],
    };
}
