import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";

const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;
const CANCELLED_STATUSES = ["CLASS_CANCEL", "CANCEL_CLASS"] as const;

type ScheduledEvent = {
  calendarEventId: number;
  subject: number | null;
  facultyId: number | null;
  date: string;
  fromTime: string;
  toTime: string;
  type: string;
  is_deleted: boolean | null;
};

type AttendanceRecord = {
  calendarEventId: number;
  status: string;
  reason: string | null;
  markedAt: string;
};

type SubjectRow = {
  collegeSubjectId: number;
  subjectName: string;
};

type FacultyRow = {
  facultyId: number;
  fullName: string;
};

export type StudentAttendanceSummary = {
  selectedDate: string;
  todayStats: {
    attended: number;
    total: number;
  };
  cards: {
    attended: number;
    totalClasses: number;
    percentage: number;
  };
  semesterStats: {
    present: number;
    absent: number;
    leave: number;
  };
  tableData: Array<{
    calendarEventId: number;
    subjectId: number | null;
    subject: string;
    faculty: string;
    status: string;
    classAttendance: string;
    percentage: string;
    date: string;
    fromTime: string;
    toTime: string;
  }>;
  totalCount: number;
  subjectWiseAttendance: Array<{
    subjectId: number;
    subjectName: string;
    total: number;
    attended: number;
    missed: number;
    leave: number;
    percentage: number;
  }>;
  weeklyData: number[];
  dayWiseAttendance: Array<{
    date: string;
    day: string;
    total: number;
    attended: number;
    percentage: number;
  }>;
};

function isAttendedStatus(status?: string | null) {
  return !!status && (ATTENDED_STATUSES as readonly string[]).includes(status);
}

function isCancelledStatus(status?: string | null) {
  return !!status && (CANCELLED_STATUSES as readonly string[]).includes(status);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDateString() {
  return formatDate(new Date());
}

function getWeekStart(selectedDate: string) {
  const date = new Date(`${selectedDate}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function sortByDateAndTime(a: ScheduledEvent, b: ScheduledEvent) {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  return a.fromTime.localeCompare(b.fromTime);
}

export async function buildStudentAttendanceSummary(
  userId: number,
  selectedDate: string,
  isInterOverride?: boolean,
): Promise<StudentAttendanceSummary> {
  const todayDate = getTodayDateString();
  const ctx = await fetchStudentContext(userId);
  const {
    studentId,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSemesterId,
    collegeSectionsId,
    collegeEducationType,
  } = ctx;

  const isInter =
    typeof isInterOverride === "boolean"
      ? isInterOverride
      : collegeEducationType === "Inter";

  let sectionEventsQuery = supabase
    .from("calendar_event_section")
    .select(
      `
      calendarEventId,
      calendar_event:calendarEventId (
        calendarEventId,
        subject,
        facultyId,
        date,
        fromTime,
        toTime,
        type,
        is_deleted
      )
    `,
    )
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("collegeSectionId", collegeSectionsId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (!isInter && collegeSemesterId) {
    sectionEventsQuery = sectionEventsQuery.eq(
      "collegeSemesterId",
      collegeSemesterId,
    );
  }

  const { data: sectionRows, error: sectionError } = await sectionEventsQuery;
  if (sectionError) throw sectionError;

  const eventMap = new Map<number, ScheduledEvent>();

  for (const row of sectionRows ?? []) {
    const event = Array.isArray(row.calendar_event)
      ? row.calendar_event[0]
      : row.calendar_event;

    if (
      !event ||
      event.type !== "class" ||
      event.is_deleted ||
      event.date > todayDate
    ) {
      continue;
    }

    eventMap.set(event.calendarEventId, event);
  }

  const scheduledEvents = Array.from(eventMap.values()).sort(sortByDateAndTime);
  const eventIds = scheduledEvents.map((event) => event.calendarEventId);

  const { data: records, error: recordsError } = eventIds.length
    ? await supabase
        .from("attendance_record")
        .select("calendarEventId, status, reason, markedAt")
        .eq("studentId", studentId)
        .in("calendarEventId", eventIds)
        .is("deletedAt", null)
    : { data: [], error: null };

  if (recordsError) throw recordsError;

  const attendanceMap = new Map<number, AttendanceRecord>();
  for (const record of records ?? []) {
    attendanceMap.set(record.calendarEventId, record);
  }

  const validEvents = scheduledEvents.filter((event) => {
    const status = attendanceMap.get(event.calendarEventId)?.status;
    return !isCancelledStatus(status);
  });

  const subjectIds = [
    ...new Set(
      validEvents
        .map((event) => event.subject)
        .filter((value): value is number => value !== null),
    ),
  ];
  const facultyIds = [
    ...new Set(
      validEvents
        .map((event) => event.facultyId)
        .filter((value): value is number => value !== null),
    ),
  ];

  const [{ data: subjects }, { data: faculty }] = await Promise.all([
    subjectIds.length
      ? supabase
          .from("college_subjects")
          .select("collegeSubjectId, subjectName")
          .eq("collegeId", collegeId)
          .in("collegeSubjectId", subjectIds)
      : Promise.resolve({ data: [] as SubjectRow[] }),
    facultyIds.length
      ? supabase
          .from("faculty")
          .select("facultyId, fullName")
          .eq("collegeId", collegeId)
          .in("facultyId", facultyIds)
      : Promise.resolve({ data: [] as FacultyRow[] }),
  ]);

  const subjectMap = new Map(
    (subjects ?? []).map((subject) => [subject.collegeSubjectId, subject.subjectName]),
  );
  const facultyMap = new Map(
    (faculty ?? []).map((teacher) => [teacher.facultyId, teacher.fullName]),
  );

  const subjectWiseMap = new Map<
    number,
    { total: number; attended: number; missed: number; leave: number }
  >();

  let attendedClasses = 0;
  let absentClasses = 0;
  let leaveClasses = 0;

  for (const event of validEvents) {
    if (!event.subject) continue;

    const current = subjectWiseMap.get(event.subject) ?? {
      total: 0,
      attended: 0,
      missed: 0,
      leave: 0,
    };

    current.total += 1;

    const status = attendanceMap.get(event.calendarEventId)?.status ?? null;

    if (isAttendedStatus(status)) {
      current.attended += 1;
      attendedClasses += 1;
    } else if (status === "ABSENT") {
      current.missed += 1;
      absentClasses += 1;
    } else if (status === "LEAVE") {
      current.leave += 1;
      leaveClasses += 1;
    }

    subjectWiseMap.set(event.subject, current);
  }

  const subjectWiseAttendance = Array.from(subjectWiseMap.entries())
    .map(([subjectId, stats]) => ({
      subjectId,
      subjectName: subjectMap.get(subjectId) ?? "Unknown",
      total: stats.total,
      attended: stats.attended,
      missed: stats.missed,
      leave: stats.leave,
      percentage:
        stats.total === 0 ? 0 : Math.round((stats.attended / stats.total) * 100),
    }))
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  const todayEvents = validEvents.filter((event) => event.date === selectedDate);

  const tableData = todayEvents.map((event) => {
    const status = attendanceMap.get(event.calendarEventId)?.status ?? "NOT_MARKED";
    const subjectStats = event.subject ? subjectWiseMap.get(event.subject) : null;
    const attended = subjectStats?.attended ?? 0;
    const total = subjectStats?.total ?? 0;

    return {
      calendarEventId: event.calendarEventId,
      subjectId: event.subject,
      subject: event.subject
        ? (subjectMap.get(event.subject) ?? "Unknown")
        : "Meeting / Other",
      faculty: event.facultyId
        ? (facultyMap.get(event.facultyId) ?? "Unknown")
        : "Unknown",
      status,
      classAttendance: `${attended}/${total}`,
      percentage:
        total === 0 ? "0%" : `${Math.round((attended / total) * 100)}%`,
      date: event.date,
      fromTime: event.fromTime,
      toTime: event.toTime,
    };
  });

  const weekStart = getWeekStart(todayDate);
  const dayWiseAttendance: StudentAttendanceSummary["dayWiseAttendance"] = [];

  for (let index = 0; index < 7; index += 1) {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + index);
    const currentDate = formatDate(current);
    const dayEvents =
      currentDate > todayDate
        ? []
        : validEvents.filter((event) => event.date === currentDate);
    const attended = dayEvents.filter((event) =>
      isAttendedStatus(attendanceMap.get(event.calendarEventId)?.status),
    ).length;

    dayWiseAttendance.push({
      date: currentDate,
      day: current.toLocaleDateString("en-US", { weekday: "short" }),
      total: dayEvents.length,
      attended,
      percentage:
        dayEvents.length === 0 ? 0 : Math.round((attended / dayEvents.length) * 100),
    });
  }

  const totalClasses = validEvents.length;
  const todayAttended = todayEvents.filter((event) =>
    isAttendedStatus(attendanceMap.get(event.calendarEventId)?.status),
  ).length;

  return {
    selectedDate,
    todayStats: {
      attended: todayAttended,
      total: todayEvents.length,
    },
    cards: {
      attended: attendedClasses,
      totalClasses,
      percentage:
        totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100),
    },
    semesterStats: {
      present: totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100),
      absent: totalClasses === 0 ? 0 : Math.round((absentClasses / totalClasses) * 100),
      leave: totalClasses === 0 ? 0 : Math.round((leaveClasses / totalClasses) * 100),
    },
    tableData,
    totalCount: tableData.length,
    subjectWiseAttendance,
    weeklyData: dayWiseAttendance.map((day) => day.percentage),
    dayWiseAttendance,
  };
}
