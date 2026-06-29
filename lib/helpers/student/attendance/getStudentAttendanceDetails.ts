import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";
import { calculateAttendancePercentage } from "@/lib/helpers/attendance/attendancePolicyMessage";
import {
  buildStudentAttendancePolicyInsight,
  type StudentAttendancePolicyInsight,
} from "./studentAttendancePolicyInsight";

/* ================================
   STATUS RULES
================================ */
const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;
const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;
const ELIGIBILITY_STATUSES = ["PRESENT", "ABSENT", "LATE"] as const;
const CANCELLED_STATUSES = ["CLASS_CANCEL", "CANCEL_CLASS"] as const;

type StatusFilter = "ALL" | "ATTENDED" | "ABSENT" | "LEAVE";

/* ================================
   ROW TYPE
================================ */
type AttendanceRow = {
  attendanceRecordId: number;
  calendarEventId: number | null;
  bulkCalendarEventId: number | null;
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
  bulk_calendar_events: {
    bulkCalendarEventId: number;
    subject: number;
    facultyId: number;
    fromDate: string;
    toDate: string;
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
  if (!ctx) {
    return emptyResult();
  }
  const { studentId } = ctx;

  const { data: rawData, error } = await (supabase as any)
    .from("attendance_record")
    .select(`
      attendanceRecordId,
      calendarEventId,
      bulkCalendarEventId,
      status,
      reason,
      markedAt,
      calendar_event (
        calendarEventId,
        subject,
        facultyId,
        date,
        fromTime,
        toTime,
        is_deleted
      ),
      bulk_calendar_events (
        bulkCalendarEventId,
        subject,
        facultyId,
        fromDate,
        toDate,
        fromTime,
        toTime,
        is_deleted
      )
    `)
    .eq("studentId", studentId)
    .is("deletedAt", null);

  if (error) throw error;
  const data = rawData as AttendanceRow[] | null;
  if (!data?.length) return emptyResult();

  const normalizedData = (data ?? []).map((r: AttendanceRow) => {
    let event = r.calendar_event;
    if (!event && r.bulk_calendar_events) {
      event = {
        calendarEventId: r.bulk_calendar_events.bulkCalendarEventId,
        subject: r.bulk_calendar_events.subject,
        facultyId: r.bulk_calendar_events.facultyId,
        date: r.markedAt,
        fromTime: r.bulk_calendar_events.fromTime,
        toTime: r.bulk_calendar_events.toTime,
        is_deleted: r.bulk_calendar_events.is_deleted,
      };
    }
    return {
      ...r,
      event,
    };
  });

  const overallRows = normalizedData.filter(
    (r: any) =>
      !isCancelledStatus(r.status) &&
      r.event &&
      r.event.is_deleted === false
  );

  const baseRows = overallRows.filter(
    (r) =>
      (!subjectId || r.event!.subject === subjectId) &&
      (!facultyId || r.event!.facultyId === facultyId)
  );

  const subjectIds = [
    ...new Set(
      baseRows.map((r) => r.event?.subject).filter(Boolean)
    ),
  ] as number[];

  const facultyIds = [
    ...new Set(
      baseRows.map((r) => r.event?.facultyId).filter(Boolean)
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

  const from = (page - 1) * limit;
  const to = from + limit;

  let filteredRows = baseRows;

  if (statusFilter === "ATTENDED") {
    filteredRows = baseRows.filter((r: any) =>
      ATTENDED_STATUSES.includes(r.status as (typeof ATTENDED_STATUSES)[number])
    );
  } else if (statusFilter === "ABSENT") {
    filteredRows = baseRows.filter((r: any) => r.status === "ABSENT");
  } else if (statusFilter === "LEAVE") {
    filteredRows = baseRows.filter((r: any) => r.status === "LEAVE");
  }

  const conductedSet = new Set<string>();
  const attendedSet = new Set<string>();
  let absent = 0;
  let leave = 0;

  for (const r of baseRows) {
    const evId = r.calendarEventId ? `cal_${r.calendarEventId}` : `bulk_${r.bulkCalendarEventId}_${r.markedAt}`;
    if (CONDUCTED_STATUSES.includes(r.status as (typeof CONDUCTED_STATUSES)[number])) {
      conductedSet.add(evId);
    }

    if (ATTENDED_STATUSES.includes(r.status as (typeof ATTENDED_STATUSES)[number])) {
      attendedSet.add(evId);
    }

    if (r.status === "ABSENT") absent++;
    if (r.status === "LEAVE") leave++;
  }

  const total = conductedSet.size;
  const attended = attendedSet.size;

  const overallConductedSet = new Set<string>();
  const overallAttendedSet = new Set<string>();

  for (const r of overallRows) {
    const evId = r.calendarEventId ? `cal_${r.calendarEventId}` : `bulk_${r.bulkCalendarEventId}_${r.markedAt}`;
    if (ELIGIBILITY_STATUSES.includes(r.status as (typeof ELIGIBILITY_STATUSES)[number])) {
      overallConductedSet.add(evId);
    }

    if (ATTENDED_STATUSES.includes(r.status as (typeof ATTENDED_STATUSES)[number])) {
      overallAttendedSet.add(evId);
    }
  }

  const attendancePolicyInsight = await buildStudentAttendancePolicyInsight({
    userId,
    context: {
      collegeEducationId: ctx.collegeEducationId,
      collegeBranchId: ctx.collegeBranchId,
      collegeAcademicYearId: ctx.collegeAcademicYearId as number,
      collegeSemesterId: ctx.collegeSemesterId,
    },
    attendedClasses: overallAttendedSet.size,
    totalClasses: overallConductedSet.size,
  });



  const allRows = filteredRows.map((r) => ({
    calendarEventId: r.calendarEventId ?? r.bulkCalendarEventId,
    date: r.event!.date,
    time: `${r.event!.fromTime} - ${r.event!.toTime}`,
    subjectId: r.event!.subject,
    facultyId: r.event!.facultyId,
    subjectName: subjectMap.get(r.event!.subject) ?? "-",
    facultyName: facultyMap.get(r.event!.facultyId) ?? "-",
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
      percentage: calculateAttendancePercentage(attended, total),
    },
    rows: paginatedRows,
    totalCount: allRows.length,
    attendancePolicyInsight,
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
    attendancePolicyInsight: {
      minAttendance: 75,
      percentage: 0,
      classesNeeded: 0,
      message:
        "Student's minimum attendance is 75%. No attendance records yet. Start tracking from the next class.",
    } satisfies StudentAttendancePolicyInsight,
  };
}
