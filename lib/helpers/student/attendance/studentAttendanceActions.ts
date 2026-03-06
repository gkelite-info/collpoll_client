import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";

const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;

const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;

function isAttendedStatus(s: string) {
  return (ATTENDED_STATUSES as readonly string[]).includes(s);
}

function isConductedStatus(s: string) {
  return (CONDUCTED_STATUSES as readonly string[]).includes(s);
}

export async function getStudentDashboardData(
  userId: number,
  dateStr: string,
  page: number,
  limit: number,
  isInter: boolean
) {

  console.log("📥 getStudentDashboardData called", { userId, dateStr });

  /* ---------- 1️⃣ Student context ---------- */

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const ctx = await fetchStudentContext(userId);

  console.log("🧠 Student Context:", ctx);

  const {
    studentId,
    collegeId, // ✅ ADDED
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

  console.log("📚 student_academic_history rows:", sahRows);

  const sahStudentIds = (sahRows ?? []).map(r => r.studentId);

  console.log("👨‍🎓 SAH Student IDs:", sahStudentIds);

  if (!sahStudentIds.length) return emptyDashboard();

  /* ---------- 2️⃣ Students table ---------- */

  const { data: classStudents, error: classErr } = await supabase
    .from("students")
    .select("studentId")
    .in("studentId", sahStudentIds)
    .eq("collegeId", collegeId) // ✅ ADDED
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .is("deletedAt", null);

  if (classErr) throw classErr;

  console.log("🏫 Class Students:", classStudents);

  const classStudentIds = (classStudents ?? []).map(s => s.studentId);

  console.log("👥 Final Class Student IDs:", classStudentIds);

  if (!classStudentIds.length) return emptyDashboard();

  const { data: todayAll, error: todayErr } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .eq("markedAt", dateStr);

  if (todayErr) throw todayErr;

  const todayConductedSet = new Set<number>();
  const todayAttendedSet = new Set<number>();

  for (const r of todayAll ?? []) {

    if (isConductedStatus(r.status)) {
      todayConductedSet.add(r.calendarEventId);
    }

    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      todayAttendedSet.add(r.calendarEventId);
    }
  }

  const todayConducted = todayConductedSet.size;
  const todayAttended = todayAttendedSet.size;

  const todayStudentRows = (todayAll ?? []).filter(
    r => r.studentId === studentId
  );

  const { data: semAll, error: semErr } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .lte("markedAt", dateStr);

  if (semErr) throw semErr;

  const eventIds = [
    ...new Set((semAll ?? []).map(r => r.calendarEventId)),
  ];

  const { data: events, error: eventErr } = await supabase
    .from("calendar_event")
    .select("calendarEventId, subject, facultyId")
    .in("calendarEventId", eventIds)
    .eq("is_deleted", false);

  if (eventErr) throw eventErr;

  console.log("📚 Calendar Events:", events);

  const eventMap = new Map(
    (events ?? []).map(e => [e.calendarEventId, e])
  );

  const subjectIds = [
    ...new Set((events ?? []).map(e => e.subject).filter(Boolean)),
  ];

  console.log("📘 Subject IDs:", subjectIds);

  const { data: subjects } = await supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .eq("collegeId", collegeId) // ✅ ADDED
    .in("collegeSubjectId", subjectIds);

  console.log("📖 Subjects:", subjects);

  const subjectMap = new Map(
    (subjects ?? []).map(s => [s.collegeSubjectId, s.subjectName])
  );

  const facultyIds = [...new Set((events ?? []).map(e => e.facultyId))];

  console.log("👨‍🏫 Faculty IDs:", facultyIds);

  const { data: faculty } = await supabase
    .from("faculty")
    .select("facultyId, fullName")
    .eq("collegeId", collegeId) // ✅ ADDED
    .in("facultyId", facultyIds);

  console.log("👩‍🏫 Faculty:", faculty);

  const facultyMap = new Map(
    (faculty ?? []).map(f => [f.facultyId, f.fullName])
  );

  const semesterSubjectStats: Record<
    number,
    { totalSet: Set<number>; attendedSet: Set<number> }
  > = {};

  for (const r of semAll ?? []) {

    const ev = eventMap.get(r.calendarEventId);
    if (!ev?.subject) continue;

    if (!semesterSubjectStats[ev.subject]) {

      semesterSubjectStats[ev.subject] = {
        totalSet: new Set(),
        attendedSet: new Set(),
      };
    }

    if (isConductedStatus(r.status)) {
      semesterSubjectStats[ev.subject].totalSet.add(r.calendarEventId);
    }

    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      semesterSubjectStats[ev.subject].attendedSet.add(r.calendarEventId);
    }
  }

  const tableData = todayStudentRows.map(row => {
    const ev = eventMap.get(row.calendarEventId);

    if (!ev?.subject || row.status === "CLASS_CANCEL") {

      return {
        subject: subjectMap.get(ev?.subject) ?? "Unknown",
        faculty: facultyMap.get(ev?.facultyId) ?? "Unknown",
        status: row.status,
        classAttendance: "0/0",
        percentage: "0%",
      };
    }

    const semStats = semesterSubjectStats[ev.subject];

    const total = semStats?.totalSet.size ?? 0;
    const attended = semStats?.attendedSet.size ?? 0;

    return {
      subject: subjectMap.get(ev.subject) ?? "Unknown",
      faculty: facultyMap.get(ev.facultyId) ?? "Unknown",
      status: row.status,
      classAttendance: `${attended}/${total}`,
      percentage: total === 0 ? "0%" : `${Math.round((attended / total) * 100)}%`,
    };
  });

  const semesterConductedSet = new Set<number>();
  const semesterAttendedSet = new Set<number>();

  for (const r of semAll ?? []) {

    const ev = eventMap.get(r.calendarEventId);

    // ❌ skip deleted events
    if (!ev) continue;

    if (isConductedStatus(r.status)) {
      semesterConductedSet.add(r.calendarEventId);
    }

    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      semesterAttendedSet.add(r.calendarEventId);
    }
  }

  const semesterConducted = semesterConductedSet.size;
  const semesterAttended = semesterAttendedSet.size;

  const semPresent = new Set<number>();
  const semAbsent = new Set<number>();
  const semLate = new Set<number>();

  for (const r of semAll ?? []) {

    const ev = eventMap.get(r.calendarEventId);

    // ❌ skip deleted events
    if (!ev) continue;

    if (r.studentId !== studentId) continue;

    if (r.status === "PRESENT") semPresent.add(r.calendarEventId);
    else if (r.status === "ABSENT") semAbsent.add(r.calendarEventId);
    else if (r.status === "LATE") semLate.add(r.calendarEventId);
  }

  const totalDist = semPresent.size + semAbsent.size + semLate.size;

  console.log("📊 Semester Distribution", {
    present: semPresent.size,
    absent: semAbsent.size,
    late: semLate.size
  });

  const paginatedRows = tableData.slice(from, to + 1);

  return {

    todayStats: {
      attended: todayAttended,
      total: todayConducted,
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
      present:
        totalDist === 0
          ? 0
          : Math.round((semPresent.size / totalDist) * 100),

      absent:
        totalDist === 0
          ? 0
          : Math.round((semAbsent.size / totalDist) * 100),

      late:
        totalDist === 0
          ? 0
          : Math.round((semLate.size / totalDist) * 100),
    },

    tableData: paginatedRows,   // ✅ UI expects this
    totalCount: tableData.length, // ✅ pagination needs this

    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}

function emptyDashboard() {

  console.log("⚠️ Empty dashboard returned");

  return {
    todayStats: { attended: 0, total: 0 },
    cards: { attended: 0, totalClasses: 0, percentage: 0 },
    semesterStats: { present: 0, absent: 0, late: 0 },

    tableData: [],
    totalCount: 0,

    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}