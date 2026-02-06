
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";

/* ================================
   STATUS RULES (FINAL)
================================ */

// ✅ Numerator (student attended)
const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;

// ✅ Denominator (class conducted) – anything except cancel
const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;

function isAttendedStatus(s: string) {
  return (ATTENDED_STATUSES as readonly string[]).includes(s);
}

function isConductedStatus(s: string) {
  return (CONDUCTED_STATUSES as readonly string[]).includes(s);
}

/* ================================
   MAIN HELPER
================================ */
export async function getStudentDashboardData(userId: number, dateStr: string) {
  /* ---------- 1️⃣ Student context ---------- */
  const ctx = await fetchStudentContext(userId);
  const {
    studentId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSemesterId,
    collegeSectionsId,
  } = ctx;

  /* ---------- 2️⃣ Class students ---------- */
  const { data: sahRows, error: sahErr } = await supabase
    .from("student_academic_history")
    .select("studentId")
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("collegeSemesterId", collegeSemesterId)
    .eq("collegeSectionsId", collegeSectionsId)
    .eq("isCurrent", true)
    .is("deletedAt", null);

  if (sahErr) throw sahErr;

  const sahStudentIds = (sahRows ?? []).map(r => r.studentId);
  if (!sahStudentIds.length) return emptyDashboard();

  const { data: classStudents, error: classErr } = await supabase
    .from("students")
    .select("studentId")
    .in("studentId", sahStudentIds)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .is("deletedAt", null);

  if (classErr) throw classErr;

  const classStudentIds = (classStudents ?? []).map(s => s.studentId);
  if (!classStudentIds.length) return emptyDashboard();

  /* ---------- 3️⃣ TODAY attendance ---------- */
  const { data: todayAll, error: todayErr } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .eq("markedAt", dateStr);

  if (todayErr) throw todayErr;

  /* ---------- 4️⃣ TODAY totals ---------- */
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

  /* ---------- 5️⃣ Student rows ---------- */
  const todayStudentRows = (todayAll ?? []).filter(
    r => r.studentId === studentId
  );

  /* ---------- 6️⃣ SEMESTER attendance ---------- */
  const { data: semAll, error: semErr } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .lte("markedAt", dateStr);

  if (semErr) throw semErr;

  /* 🔥 FIX: use SEMESTER events, not today-only */
  const eventIds = [
    ...new Set((semAll ?? []).map(r => r.calendarEventId)),
  ];

  /* ---------- 7️⃣ Event → subject / faculty ---------- */
  const { data: events, error: eventErr } = await supabase
    .from("calendar_event")
    .select("calendarEventId, subject, facultyId")
    .in("calendarEventId", eventIds)
    .eq("is_deleted", false);

  if (eventErr) throw eventErr;

  const eventMap = new Map(
    (events ?? []).map(e => [e.calendarEventId, e])
  );

  /* ---------- 8️⃣ Subject & faculty maps ---------- */
  const subjectIds = [
    ...new Set((events ?? []).map(e => e.subject).filter(Boolean)),
  ];

  const { data: subjects } = await supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .in("collegeSubjectId", subjectIds);

  const subjectMap = new Map(
    (subjects ?? []).map(s => [s.collegeSubjectId, s.subjectName])
  );

  const facultyIds = [...new Set((events ?? []).map(e => e.facultyId))];

  const { data: faculty } = await supabase
    .from("faculty")
    .select("facultyId, fullName")
    .in("facultyId", facultyIds);

  const facultyMap = new Map(
    (faculty ?? []).map(f => [f.facultyId, f.fullName])
  );

  /* ---------- 9️⃣ SEMESTER subject-wise stats (FOR TABLE) ---------- */
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

  /* ---------- 🔟 TABLE ---------- */
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

  /* ---------- 11️⃣ SEMESTER cards ---------- */
  const semesterConductedSet = new Set<number>();
  const semesterAttendedSet = new Set<number>();

  for (const r of semAll ?? []) {
    if (isConductedStatus(r.status)) semesterConductedSet.add(r.calendarEventId);
    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      semesterAttendedSet.add(r.calendarEventId);
    }
  }

  const semesterConducted = semesterConductedSet.size;
  const semesterAttended = semesterAttendedSet.size;

  /* ---------- 12️⃣ Semester distribution ---------- */
  const semPresent = new Set<number>();
  const semAbsent = new Set<number>();
  const semLate = new Set<number>();

  for (const r of semAll ?? []) {
    if (r.studentId !== studentId) continue;
    if (r.status === "PRESENT") semPresent.add(r.calendarEventId);
    else if (r.status === "ABSENT") semAbsent.add(r.calendarEventId);
    else if (r.status === "LATE") semLate.add(r.calendarEventId);
  }

  const totalDist = semPresent.size + semAbsent.size + semLate.size;

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
      present: totalDist === 0 ? 0 : Math.round((semPresent.size / totalDist) * 100),
      absent: totalDist === 0 ? 0 : Math.round((semAbsent.size / totalDist) * 100),
      late: totalDist === 0 ? 0 : Math.round((semLate.size / totalDist) * 100),
    },
    tableData,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}

/* ================================
   EMPTY
================================ */
function emptyDashboard() {
  return {
    todayStats: { attended: 0, total: 0 },
    cards: { attended: 0, totalClasses: 0, percentage: 0 },
    semesterStats: { present: 0, absent: 0, late: 0 },
    tableData: [],
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}
