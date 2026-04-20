import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";

const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;
const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;
const CANCELLED_STATUSES = ["CLASS_CANCEL", "CANCEL_CLASS"] as const;

function isAttendedStatus(status: string) {
  return (ATTENDED_STATUSES as readonly string[]).includes(status);
}

function isConductedStatus(status: string) {
  return (CONDUCTED_STATUSES as readonly string[]).includes(status);
}

function isCancelledStatus(status: string) {
  return (CANCELLED_STATUSES as readonly string[]).includes(status);
}

export interface SubjectWiseAttendance {
  subjectId: number;
  subjectName: string;
  percentage: number;
}

export interface StudentDashboardResponse {
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
  tableData: any[];
  totalCount: number;
  subjectWiseAttendance: SubjectWiseAttendance[];
  weeklyData: number[];
}

export async function getStudentDashboardData(
  userId: number,
  dateStr: string,
  page: number,
  limit: number,
  isInter: boolean,
): Promise<StudentDashboardResponse> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const ctx = await fetchStudentContext(userId);
  const {
    studentId,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSemesterId,
    collegeSectionsId,
  } = ctx;

  let sahQuery = supabase
    .from("student_academic_history")
    .select("studentId")
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("collegeSectionsId", collegeSectionsId)
    .eq("isCurrent", true)
    .is("deletedAt", null);

  if (!isInter && collegeSemesterId) {
    sahQuery = sahQuery.eq("collegeSemesterId", collegeSemesterId);
  }

  const { data: sahRows, error: sahErr } = await sahQuery;
  if (sahErr) throw sahErr;

  const sahStudentIds = (sahRows ?? []).map((r) => r.studentId);
  if (!sahStudentIds.length) return emptyDashboard();

  const { data: classStudents, error: classErr } = await supabase
    .from("students")
    .select("studentId")
    .in("studentId", sahStudentIds)
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .is("deletedAt", null);

  if (classErr) throw classErr;

  const classStudentIds = (classStudents ?? []).map((s) => s.studentId);
  if (!classStudentIds.length) return emptyDashboard();

  const { data: todayAll, error: todayErr } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .eq("markedAt", dateStr);

  if (todayErr) throw todayErr;

  const { data: semAll, error: semErr } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .lte("markedAt", dateStr);

  if (semErr) throw semErr;

  const eventIds = [...new Set((semAll ?? []).map((r) => r.calendarEventId))];

  const { data: events, error: eventErr } = await supabase
    .from("calendar_event")
    .select("calendarEventId, subject, facultyId")
    .in("calendarEventId", eventIds)
    .eq("is_deleted", false);

  if (eventErr) throw eventErr;

  const eventMap = new Map((events ?? []).map((e) => [e.calendarEventId, e]));

  const subjectIds = [
    ...new Set((events ?? []).map((e) => e.subject).filter(Boolean)),
  ];

  const { data: subjects } = await supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .eq("collegeId", collegeId)
    .in("collegeSubjectId", subjectIds);

  const subjectMap = new Map(
    (subjects ?? []).map((s) => [s.collegeSubjectId, s.subjectName]),
  );

  const facultyIds = [...new Set((events ?? []).map((e) => e.facultyId))];
  const { data: faculty } = await supabase
    .from("faculty")
    .select("facultyId, fullName")
    .eq("collegeId", collegeId)
    .in("facultyId", facultyIds);

  const facultyMap = new Map(
    (faculty ?? []).map((f) => [f.facultyId, f.fullName]),
  );

  // 🟢 1. ACCURATE SEMESTER ATTENDANCE LOGIC
  const semesterConductedSet = new Set<number>();
  const semesterAttendedSet = new Set<number>();

  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;

  for (const r of semAll ?? []) {
    const ev = eventMap.get(r.calendarEventId);
    if (!ev || isCancelledStatus(r.status)) continue;

    // Count unique conducted classes for the section
    if (isConductedStatus(r.status)) {
      semesterConductedSet.add(r.calendarEventId);
    }

    // Process only this student's records
    if (r.studentId === studentId) {
      if (isAttendedStatus(r.status)) {
        semesterAttendedSet.add(r.calendarEventId);
      }

      if (r.status === "PRESENT" || r.status === "LATE") presentCount++;
      else if (r.status === "ABSENT") absentCount++;
      else if (r.status === "LEAVE") leaveCount++;
    }
  }

  const semesterConducted = semesterConductedSet.size;
  const semesterAttended = semesterAttendedSet.size;
  const distTotal = presentCount + absentCount + leaveCount;

  let presentPercent = 0;
  let absentPercent = 0;
  let leavePercent = 0;

  if (distTotal > 0) {
    presentPercent = Math.round((presentCount / distTotal) * 100);
    absentPercent = Math.round((absentCount / distTotal) * 100);
    leavePercent = Math.max(0, 100 - presentPercent - absentPercent);
  }

  // 🟢 2. ACCURATE SUBJECT-WISE LOGIC
  const subjectWiseMap: Record<
    number,
    { total: Set<number>; attended: Set<number> }
  > = {};

  for (const r of semAll ?? []) {
    const ev = eventMap.get(r.calendarEventId);
    if (!ev || !ev.subject || isCancelledStatus(r.status)) continue;

    if (!subjectWiseMap[ev.subject]) {
      subjectWiseMap[ev.subject] = { total: new Set(), attended: new Set() };
    }

    if (isConductedStatus(r.status)) {
      subjectWiseMap[ev.subject].total.add(r.calendarEventId);
    }

    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      subjectWiseMap[ev.subject].attended.add(r.calendarEventId);
    }
  }

  const subjectWiseAttendance = Object.entries(subjectWiseMap).map(
    ([subjectId, s]) => {
      const total = s.total.size;
      const attended = s.attended.size;
      return {
        subjectId: Number(subjectId),
        subjectName: subjectMap.get(Number(subjectId)) ?? "Unknown",
        percentage: total === 0 ? 0 : Math.round((attended / total) * 100),
      };
    },
  );

  // 🟢 3. ACCURATE TODAY STATS AND TABLE LOGIC
  const todayStudentRows = (todayAll ?? []).filter(
    (r) => r.studentId === studentId,
  );
  const todayConductedSet = new Set<number>();
  const todayAttendedSet = new Set<number>();

  for (const r of todayAll ?? []) {
    const ev = eventMap.get(r.calendarEventId);
    if (!ev || isCancelledStatus(r.status)) continue;

    if (isConductedStatus(r.status)) {
      todayConductedSet.add(r.calendarEventId);
    }

    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      todayAttendedSet.add(r.calendarEventId);
    }
  }

  const tableData = todayStudentRows.map((row) => {
    const ev = eventMap.get(row.calendarEventId);

    if (
      !ev?.subject ||
      row.status === "CLASS_CANCEL" ||
      row.status === "CANCEL_CLASS"
    ) {
      return {
        subject: ev?.subject
          ? (subjectMap.get(ev.subject) ?? "Unknown")
          : "Meeting / Other",
        faculty: ev?.facultyId
          ? (facultyMap.get(ev.facultyId) ?? "Unknown")
          : "Unknown",
        status: row.status,
        classAttendance: "0/0",
        percentage: "0%",
      };
    }

    const semStats = subjectWiseMap[ev.subject];
    const total = semStats?.total.size ?? 0;
    const attended = semStats?.attended.size ?? 0;

    return {
      subject: subjectMap.get(ev.subject) ?? "Unknown",
      faculty: facultyMap.get(ev.facultyId) ?? "Unknown",
      status: row.status,
      classAttendance: `${attended}/${total}`,
      percentage:
        total === 0 ? "0%" : `${Math.round((attended / total) * 100)}%`,
    };
  });

  const paginatedRows = tableData.slice(from, to + 1);

  return {
    todayStats: {
      attended: todayAttendedSet.size,
      total: todayConductedSet.size,
    },
    cards: {
      attended: semesterAttended,
      totalClasses: semesterConducted,
      percentage:
        semesterConducted === 0
          ? 0
          : Math.round((semesterAttended / semesterConducted) * 100),
    },
    semesterStats: {
      present: presentPercent,
      absent: absentPercent,
      leave: leavePercent,
    },
    tableData: paginatedRows,
    totalCount: tableData.length,
    subjectWiseAttendance,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}

function emptyDashboard() {
  return {
    todayStats: { attended: 0, total: 0 },
    cards: { attended: 0, totalClasses: 0, percentage: 0 },
    semesterStats: { present: 0, absent: 0, leave: 0 },
    tableData: [],
    totalCount: 0,
    subjectWiseAttendance: [],
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}
