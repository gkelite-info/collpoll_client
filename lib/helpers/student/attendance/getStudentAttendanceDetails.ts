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
   ROW TYPE
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
    is_deleted: boolean | null;
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
  page = 1,
  limit = 6,
}: {
  userId: number;
  subjectId?: number;
  facultyId?: number;
  statusFilter?: StatusFilter;
  page?: number;
  limit?: number;
}) {
  const ctx = await fetchStudentContext(userId);
  const { studentId } = ctx;

  const from = (page - 1) * limit;
  const to = from + limit;

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
        toTime,
        is_deleted
      )
    `)
    .eq("studentId", studentId)
    .is("deletedAt", null)
    .returns<AttendanceRow[]>();

  if (error) throw error;
  if (!data?.length) return emptyResult();

  const baseRows = data.filter(
    (r) =>
      !isCancelledStatus(r.status) &&
      r.calendar_event &&
      r.calendar_event.is_deleted === false &&
      (!subjectId || r.calendar_event.subject === subjectId) &&
      (!facultyId || r.calendar_event.facultyId === facultyId)
  );

  const subjectIds = [
    ...new Set(
      baseRows.map((r) => r.calendar_event?.subject).filter(Boolean)
    ),
  ] as number[];

  const facultyIds = [
    ...new Set(
      baseRows.map((r) => r.calendar_event?.facultyId).filter(Boolean)
    ),
  ] as number[];

  const { data: subjects } = await supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .in("collegeSubjectId", subjectIds);

  const { data: faculty } = await supabase
    .from("faculty")
    .select("facultyId, fullName")
    .in("facultyId", facultyIds);

  const subjectMap = new Map(
    (subjects ?? []).map((s) => [s.collegeSubjectId, s.subjectName])
  );

  const facultyMap = new Map(
    (faculty ?? []).map((f) => [f.facultyId, f.fullName])
  );

  let filteredRows = baseRows;

  if (statusFilter === "ATTENDED") {
    filteredRows = baseRows.filter((r) =>
      ATTENDED_STATUSES.includes(r.status as (typeof ATTENDED_STATUSES)[number])
    );
  } else if (statusFilter === "ABSENT") {
    filteredRows = baseRows.filter((r) => r.status === "ABSENT");
  } else if (statusFilter === "LEAVE") {
    filteredRows = baseRows.filter((r) => r.status === "LEAVE");
  }

  const conductedSet = new Set<number>();
  const attendedSet = new Set<number>();
  let absent = 0;
  let leave = 0;

  for (const r of baseRows) {
    if (CONDUCTED_STATUSES.includes(r.status as (typeof CONDUCTED_STATUSES)[number])) {
      conductedSet.add(r.calendarEventId);
    }

    if (ATTENDED_STATUSES.includes(r.status as (typeof ATTENDED_STATUSES)[number])) {
      attendedSet.add(r.calendarEventId);
    }

    if (r.status === "ABSENT") absent++;
    if (r.status === "LEAVE") leave++;
  }

  const total = conductedSet.size;
  const attended = attendedSet.size;



  const allRows = filteredRows.map((r) => ({
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

  const paginatedRows = allRows.slice(from, to);

  return {
    subjectName: allRows[0]?.subjectName ?? "-",
    facultyName: allRows[0]?.facultyName ?? "-",
    headerStats: {
      total,
      attended,
      absent,
      leave,
      percentage: total === 0 ? 0 : Math.round((attended / total) * 100),
    },
    rows: paginatedRows,
    totalCount: allRows.length,
  };
}

/* ================================
   EMPTY
================================ */
function emptyResult() {
  return {
    subjectName: "-",
    facultyName: "-",
    headerStats: {
      total: 0,
      attended: 0,
      absent: 0,
      leave: 0,
      percentage: 0,
    },
     rows: [],
    totalCount: 0,
  };
}