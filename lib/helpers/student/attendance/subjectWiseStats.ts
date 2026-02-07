import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";

/* ================================
   STATUS RULES
================================ */

// Numerator → student attended
const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;

// Denominator → class conducted
const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;

// ❗ Cancelled classes (NEW)
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

/* ================================
   MAIN HELPER
================================ */
export async function getStudentDashboardData(
  userId: number,
  dateStr: string
) {
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
  const { data: sahRows } = await supabase
    .from("student_academic_history")
    .select("studentId")
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("collegeSemesterId", collegeSemesterId)
    .eq("collegeSectionsId", collegeSectionsId)
    .eq("isCurrent", true)
    .is("deletedAt", null);

  const sahStudentIds = (sahRows ?? []).map(r => r.studentId);
  if (!sahStudentIds.length) return emptyDashboard();

  const { data: classStudents } = await supabase
    .from("students")
    .select("studentId")
    .in("studentId", sahStudentIds)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .is("deletedAt", null);

  const classStudentIds = (classStudents ?? []).map(s => s.studentId);
  if (!classStudentIds.length) return emptyDashboard();

  /* ---------- 3️⃣ TODAY attendance ---------- */
  const { data: todayAll } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .eq("markedAt", dateStr);

  const todayConductedSet = new Set<number>();
  const todayAttendedSet = new Set<number>();

  for (const r of todayAll ?? []) {
    if (isCancelledStatus(r.status)) continue;

    if (isConductedStatus(r.status)) {
      todayConductedSet.add(r.calendarEventId);
    }
    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      todayAttendedSet.add(r.calendarEventId);
    }
  }

  /* ---------- 4️⃣ SEMESTER attendance ---------- */
  const { data: semAll } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .lte("markedAt", dateStr);

  if (!semAll?.length) return emptyDashboard();

  /* ---------- 5️⃣ Calendar events ---------- */
  const eventIds = [...new Set(semAll.map(r => r.calendarEventId))];

  const { data: events } = await supabase
    .from("calendar_event")
    .select("calendarEventId, subject")
    .in("calendarEventId", eventIds)
    .eq("is_deleted", false);

  const eventMap = new Map(
    (events ?? []).map(e => [e.calendarEventId, e])
  );

  /* ---------- 6️⃣ Subjects ---------- */
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

  /* ---------- 7️⃣ SEMESTER TOTALS ---------- */
  const semesterConductedSet = new Set<number>();
  const semesterAttendedSet = new Set<number>();

  for (const r of semAll) {
    if (isCancelledStatus(r.status)) continue;

    if (isConductedStatus(r.status)) {
      semesterConductedSet.add(r.calendarEventId);
    }
    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      semesterAttendedSet.add(r.calendarEventId);
    }
  }

  /* ---------- 8️⃣ SEMESTER DISTRIBUTION ---------- */
  const semPresent = new Set<number>();
  const semAbsent = new Set<number>();
  const semLate = new Set<number>();
  const semLeave = new Set<number>(); // ✅ NEW

  for (const r of semAll) {
    if (r.studentId !== studentId) continue;
    if (isCancelledStatus(r.status)) continue;

    if (r.status === "PRESENT") semPresent.add(r.calendarEventId);
    else if (r.status === "ABSENT") semAbsent.add(r.calendarEventId);
    else if (r.status === "LATE") semLate.add(r.calendarEventId);
    else if (r.status === "LEAVE") semLeave.add(r.calendarEventId);
  }

  const distTotal =
    semPresent.size +
    semAbsent.size +
    semLate.size +
    semLeave.size;

  /* ---------- 9️⃣ SUBJECT-WISE ATTENDANCE ---------- */
  const subjectWiseMap: Record<
    number,
    { total: Set<number>; attended: Set<number>; missed: Set<number>; leave: Set<number> }
  > = {};

  for (const r of semAll) {
    if (isCancelledStatus(r.status)) continue;

    const ev = eventMap.get(r.calendarEventId);
    if (!ev?.subject) continue;

    if (!subjectWiseMap[ev.subject]) {
      subjectWiseMap[ev.subject] = {
        total: new Set(),
        attended: new Set(),
        missed: new Set(),
        leave: new Set(),
      };
    }

    if (isConductedStatus(r.status)) {
      subjectWiseMap[ev.subject].total.add(r.calendarEventId);
    }

    if (r.studentId === studentId) {
      if (r.status === "PRESENT" || r.status === "LATE") {
        subjectWiseMap[ev.subject].attended.add(r.calendarEventId);
      } else if (r.status === "ABSENT") {
        subjectWiseMap[ev.subject].missed.add(r.calendarEventId);
      } else if (r.status === "LEAVE") {
        subjectWiseMap[ev.subject].leave.add(r.calendarEventId);
      }
    }
  }

  const subjectWiseStats = Object.entries(subjectWiseMap).map(
    ([subjectId, s]) => ({
      subjectId: Number(subjectId),
      subjectName: subjectMap.get(Number(subjectId)) ?? "Unknown",
      total: s.total.size,
      attended: s.attended.size,
      missed: s.missed.size,
      leave: s.leave.size,
      percentage:
        s.total.size === 0
          ? 0
          : Math.round((s.attended.size / s.total.size) * 100),
    })
  );

  /* ---------- ✅ FINAL RETURN ---------- */
  return {
    todayStats: {
      attended: todayAttendedSet.size,
      total: todayConductedSet.size,
    },
    cards: {
      attended: semesterAttendedSet.size,
      totalClasses: semesterConductedSet.size,
      percentage:
        semesterConductedSet.size === 0
          ? 0
          : Math.round(
              (semesterAttendedSet.size / semesterConductedSet.size) * 100
            ),
    },
    semesterStats: {
      present:
        distTotal === 0 ? 0 : Math.round((semPresent.size / distTotal) * 100),
      absent:
        distTotal === 0 ? 0 : Math.round((semAbsent.size / distTotal) * 100),
      late:
        distTotal === 0 ? 0 : Math.round((semLate.size / distTotal) * 100),
      leave:
        distTotal === 0 ? 0 : Math.round((semLeave.size / distTotal) * 100),
    },
    subjectWiseStats,
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
    semesterStats: { present: 0, absent: 0, late: 0, leave: 0 },
    subjectWiseStats: [],
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}
