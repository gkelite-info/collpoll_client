// import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
// import { supabase } from "@/lib/supabaseClient";

// const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;
// const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;
// const CANCELLED_STATUSES = ["CLASS_CANCEL", "CANCEL_CLASS"] as const;

// function isAttendedStatus(status: string) {
//   return (ATTENDED_STATUSES as readonly string[]).includes(status);
// }

// function isConductedStatus(status: string) {
//   return (CONDUCTED_STATUSES as readonly string[]).includes(status);
// }

// function isCancelledStatus(status: string) {
//   return (CANCELLED_STATUSES as readonly string[]).includes(status);
// }

// export async function getStudentDashboardData(
//   userId: number,
//   dateStr: string,
//   page: number,
//   limit: number
// ) {
//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const ctx = await fetchStudentContext(userId);

//   const {
//     studentId,
//     collegeId,
//     collegeEducationId,
//     collegeBranchId,
//     collegeAcademicYearId,
//     collegeSemesterId,
//     collegeSectionsId,
//   } = ctx;

//   const { data: sahRows } = await supabase
//     .from("student_academic_history")
//     .select("studentId")
//     .eq("collegeAcademicYearId", collegeAcademicYearId)
//     .eq("collegeSemesterId", collegeSemesterId)
//     .eq("collegeSectionsId", collegeSectionsId)
//     .eq("isCurrent", true)
//     .is("deletedAt", null);

//   const sahStudentIds = (sahRows ?? []).map(r => r.studentId);

//   if (!sahStudentIds.length) return emptyDashboard();

//   const { data: classStudents } = await supabase
//     .from("students")
//     .select("studentId")
//     .in("studentId", sahStudentIds)
//     .eq("collegeId", collegeId)
//     .eq("collegeEducationId", collegeEducationId)
//     .eq("collegeBranchId", collegeBranchId)
//     .is("deletedAt", null);

//   const classStudentIds = (classStudents ?? []).map(s => s.studentId);

//   if (!classStudentIds.length) return emptyDashboard();

//   const { data: semAll } = await supabase
//     .from("attendance_record")
//     .select("studentId, calendarEventId, status")
//     .in("studentId", classStudentIds)
//     .lte("markedAt", dateStr);

//   if (!semAll?.length) return emptyDashboard();
//   const eventIds = [...new Set(semAll.map(r => r.calendarEventId))];

//   const { data: events } = await supabase
//     .from("calendar_event")
//     .select(`
//       calendarEventId,
//       subject,
//       facultyId
//     `)
//     .in("calendarEventId", eventIds)
//     .eq("is_deleted", false);

//   const eventMap = new Map(
//     (events ?? []).map(e => [e.calendarEventId, e])
//   );

//   const subjectIds = [
//     ...new Set((events ?? []).map(e => e.subject).filter(Boolean)),
//   ];

//   const { data: subjects } = await supabase
//     .from("college_subjects")
//     .select("collegeSubjectId, subjectName")
//     .eq("collegeId", collegeId)
//     .eq("collegeEducationId", collegeEducationId)
//     .eq("collegeBranchId", collegeBranchId)
//     .eq("collegeAcademicYearId", collegeAcademicYearId)
//     .in("collegeSubjectId", subjectIds);
//   const subjectMap = new Map(
//     (subjects ?? []).map(s => [s.collegeSubjectId, s.subjectName])
//   );

//   const subjectWiseMap: Record<
//     number,
//     {
//       total: Set<number>;
//       attended: Set<number>;
//       missed: Set<number>;
//       leave: Set<number>;
//     }
//   > = {};

//   for (const r of semAll) {

//     const ev = eventMap.get(r.calendarEventId);
//     if (!ev || !ev.subject) continue;

//     if (isCancelledStatus(r.status)) continue;

//     if (!subjectWiseMap[ev.subject]) {
//       subjectWiseMap[ev.subject] = {
//         total: new Set(),
//         attended: new Set(),
//         missed: new Set(),
//         leave: new Set(),
//       };
//     }

//     if (isConductedStatus(r.status)) {
//       subjectWiseMap[ev.subject].total.add(r.calendarEventId);
//     }

//     if (r.studentId === studentId) {

//       if (r.status === "PRESENT" || r.status === "LATE") {
//         subjectWiseMap[ev.subject].attended.add(r.calendarEventId);
//       }

//       else if (r.status === "ABSENT") {
//         subjectWiseMap[ev.subject].missed.add(r.calendarEventId);
//       }

//       else if (r.status === "LEAVE") {
//         subjectWiseMap[ev.subject].leave.add(r.calendarEventId);
//       }
//     }
//   }

//   const allSubjectWiseStats = Object.entries(subjectWiseMap).map(
//     ([subjectId, s]) => ({
//       subjectId: Number(subjectId),
//       subjectName: subjectMap.get(Number(subjectId)) ?? "Unknown",
//       total: s.total.size,
//       attended: s.attended.size,
//       missed: s.missed.size,
//       leave: s.leave.size,
//       percentage:
//         s.total.size === 0
//           ? 0
//           : Math.round((s.attended.size / s.total.size) * 100),
//     })
//   );

//   const paginatedStats = allSubjectWiseStats.slice(from, to + 1);
//   const semesterTotalSet = new Set<number>();
//   const semesterAttendedSet = new Set<number>();

//   for (const r of semAll) {

//     const ev = eventMap.get(r.calendarEventId);
//     if (!ev) continue;

//     if (isCancelledStatus(r.status)) continue;

//     if (isConductedStatus(r.status)) {
//       semesterTotalSet.add(r.calendarEventId);
//     }

//     if (r.studentId === studentId && isAttendedStatus(r.status)) {
//       semesterAttendedSet.add(r.calendarEventId);
//     }
//   }

//   const semesterTotal = semesterTotalSet.size;
//   const semesterAttended = semesterAttendedSet.size;

//   let present = 0;
//   let absent = 0;
//   let late = 0;
//   let leave = 0;

//   for (const r of semAll) {

//     const ev = eventMap.get(r.calendarEventId);
//     if (!ev) continue;

//     if (r.studentId !== studentId) continue;
//     if (isCancelledStatus(r.status)) continue;

//     if (r.status === "PRESENT") present++;
//     else if (r.status === "ABSENT") absent++;
//     else if (r.status === "LATE") late++;
//     else if (r.status === "LEAVE") leave++;
//   }

//   const distTotal = present + absent + late + leave;

//   const { data: todayAll } = await supabase
//     .from("attendance_record")
//     .select("studentId, calendarEventId, status")
//     .in("studentId", classStudentIds)
//     .eq("markedAt", dateStr);

//   const todayTotalSet = new Set<number>();
//   const todayAttendedSet = new Set<number>();

//   for (const r of todayAll ?? []) {

//     const ev = eventMap.get(r.calendarEventId);
//     if (!ev) continue;

//     if (isCancelledStatus(r.status)) continue;

//     if (isConductedStatus(r.status)) {
//       todayTotalSet.add(r.calendarEventId);
//     }

//     if (r.studentId === studentId && isAttendedStatus(r.status)) {
//       todayAttendedSet.add(r.calendarEventId);
//     }
//   }
//   return {

//     todayStats: {
//       attended: todayAttendedSet.size,
//       total: todayTotalSet.size,
//     },

//     cards: {
//       attended: semesterAttended,
//       totalClasses: semesterTotal,
//       percentage:
//         semesterTotal === 0
//           ? 0
//           : Math.round((semesterAttended / semesterTotal) * 100),
//     },

//     semesterStats: {
//       present:
//         distTotal === 0 ? 0 : Math.round((present / distTotal) * 100),

//       absent:
//         distTotal === 0 ? 0 : Math.round((absent / distTotal) * 100),

//       late:
//         distTotal === 0 ? 0 : Math.round((late / distTotal) * 100),

//       leave:
//         distTotal === 0 ? 0 : Math.round((leave / distTotal) * 100),
//     },

//     subjectWiseStats: paginatedStats,
//     totalCount: allSubjectWiseStats.length,

//     weeklyData: [0, 0, 0, 0, 0, 0, 0],
//   };
// }

// function emptyDashboard() {
//   return {
//     todayStats: { attended: 0, total: 0 },

//     cards: {
//       attended: 0,
//       totalClasses: 0,
//       percentage: 0,
//     },

//     semesterStats: {
//       present: 0,
//       absent: 0,
//       late: 0,
//       leave: 0,
//     },

//     subjectWiseStats: [],
//     totalCount: 0,

//     weeklyData: [0, 0, 0, 0, 0, 0, 0],
//   };
// }
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

export async function getStudentDashboardData(
  userId: number,
  dateStr: string,
  page: number,
  limit: number,
) {
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
    collegeEducationType,
  } = ctx;

  const isInter = collegeEducationType === "Inter";

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

  const { data: sahRows } = await sahQuery;

  const sahStudentIds = (sahRows ?? []).map((r) => r.studentId);

  if (!sahStudentIds.length) return emptyDashboard();

  const { data: classStudents } = await supabase
    .from("students")
    .select("studentId")
    .in("studentId", sahStudentIds)
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .is("deletedAt", null);

  const classStudentIds = (classStudents ?? []).map((s) => s.studentId);

  if (!classStudentIds.length) return emptyDashboard();

  const { data: semAll } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .lte("markedAt", dateStr);

  if (!semAll?.length) return emptyDashboard();
  const eventIds = [...new Set(semAll.map((r) => r.calendarEventId))];

  const { data: events } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId,
      subject,
      facultyId
    `,
    )
    .in("calendarEventId", eventIds)
    .eq("is_deleted", false);

  const eventMap = new Map((events ?? []).map((e) => [e.calendarEventId, e]));

  const subjectIds = [
    ...new Set((events ?? []).map((e) => e.subject).filter(Boolean)),
  ];

  const { data: subjects } = await supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .in("collegeSubjectId", subjectIds);

  const subjectMap = new Map(
    (subjects ?? []).map((s) => [s.collegeSubjectId, s.subjectName]),
  );

  // 🟢 1. ACCURATE SEMESTER ATTENDANCE LOGIC (Ported from Main Page Helper)
  const semesterConductedSet = new Set<number>();
  const semesterAttendedSet = new Set<number>();

  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;

  for (const r of semAll ?? []) {
    const ev = eventMap.get(r.calendarEventId);
    if (!ev || isCancelledStatus(r.status)) continue;

    if (isConductedStatus(r.status)) {
      semesterConductedSet.add(r.calendarEventId);
    }

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

  let presentPercent = 0;
  let absentPercent = 0;
  let leavePercent = 0;

  // 🟢 Exactly matching the denominator used in the main page helper
  if (semesterConducted > 0) {
    presentPercent = Math.round((presentCount / semesterConducted) * 100);
    absentPercent = Math.round((absentCount / semesterConducted) * 100);
    leavePercent = Math.round((leaveCount / semesterConducted) * 100);
  }

  // 🟢 2. ACCURATE SUBJECT-WISE LOGIC
  const subjectWiseMap: Record<
    number,
    {
      total: Set<number>;
      attended: Set<number>;
      missed: Set<number>;
      leave: Set<number>;
    }
  > = {};

  for (const r of semAll) {
    const ev = eventMap.get(r.calendarEventId);
    if (!ev || !ev.subject) continue;

    if (isCancelledStatus(r.status)) continue;

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

  const allSubjectWiseStats = Object.entries(subjectWiseMap).map(
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
    }),
  );

  const paginatedStats = allSubjectWiseStats.slice(from, to + 1);

  // 🟢 3. TODAY STATS
  const { data: todayAll } = await supabase
    .from("attendance_record")
    .select("studentId, calendarEventId, status")
    .in("studentId", classStudentIds)
    .eq("markedAt", dateStr);

  const todayTotalSet = new Set<number>();
  const todayAttendedSet = new Set<number>();

  for (const r of todayAll ?? []) {
    const ev = eventMap.get(r.calendarEventId);
    if (!ev) continue;

    if (isCancelledStatus(r.status)) continue;

    if (isConductedStatus(r.status)) {
      todayTotalSet.add(r.calendarEventId);
    }

    if (r.studentId === studentId && isAttendedStatus(r.status)) {
      todayAttendedSet.add(r.calendarEventId);
    }
  }

  return {
    todayStats: {
      attended: todayAttendedSet.size,
      total: todayTotalSet.size,
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
    subjectWiseStats: paginatedStats,
    totalCount: allSubjectWiseStats.length,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}

function emptyDashboard() {
  return {
    todayStats: { attended: 0, total: 0 },
    cards: { attended: 0, totalClasses: 0, percentage: 0 },
    semesterStats: { present: 0, absent: 0, leave: 0 },
    subjectWiseStats: [],
    totalCount: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}
