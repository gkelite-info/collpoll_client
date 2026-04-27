import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";

const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;
const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;
const CANCELLED_STATUSES = ["CLASS_CANCEL", "CANCEL_CLASS"] as const;

type AttendanceRecordRow = {
  calendarEventId: number;
  status: string;
  calendar_event: {
    calendarEventId: number;
    subject: number | null;
    type: string;
    date: string;
    is_deleted: boolean | null;
  } | null;
};

type SubjectRow = {
  collegeSubjectId: number;
  subjectName: string;
};

type AssignmentRow = {
  assignmentId: number;
  subjectId: number;
  topicName: string;
  submissionDeadlineInt: number;
  marks: number;
  dateAssignedInt: number;
  status: string | null;
};

type SubmissionRow = {
  assignmentId: number;
  feedback: string | null;
  marksScored: number | null;
  status: string | null;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatIntDate(dateInt: number) {
  if (!dateInt) return "-";

  const raw = String(dateInt);
  if (raw.length !== 8) return "-";

  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAttendanceStatus(percentage: number) {
  if (percentage >= 75) return "Excellent";
  if (percentage >= 60) return "Good";
  if (percentage >= 40) return "Average";
  return "Low";
}

function isAttendedStatus(status: string) {
  return (ATTENDED_STATUSES as readonly string[]).includes(status);
}

function isConductedStatus(status: string) {
  return (CONDUCTED_STATUSES as readonly string[]).includes(status);
}

function isCancelledStatus(status: string) {
  return (CANCELLED_STATUSES as readonly string[]).includes(status);
}

export async function getStudentProgressData(userId: number) {
  const today = formatDate(new Date());
  const studentContext = await fetchStudentContext(userId);

  let subjectsQuery = supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .eq("collegeId", studentContext.collegeId)
    .eq("collegeAcademicYearId", studentContext.collegeAcademicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (studentContext.collegeSemesterId !== null) {
    subjectsQuery = subjectsQuery.eq(
      "collegeSemesterId",
      studentContext.collegeSemesterId,
    );
  } else {
    subjectsQuery = subjectsQuery.is("collegeSemesterId", null);
  }

  const { data: semesterSubjects, error: semesterSubjectsError } =
    await subjectsQuery.returns<SubjectRow[]>();

  if (semesterSubjectsError) throw semesterSubjectsError;

  const subjectMap = new Map(
    (semesterSubjects ?? []).map((subject) => [
      subject.collegeSubjectId,
      subject.subjectName,
    ]),
  );

  const { data: attendanceRecords, error: attendanceError } = await supabase
    .from("attendance_record")
    .select(
      `
      calendarEventId,
      status,
      calendar_event:calendarEventId (
        calendarEventId,
        subject,
        type,
        date,
        is_deleted
      )
    `,
    )
    .eq("studentId", studentContext.studentId)
    .is("deletedAt", null)
    .lte("markedAt", today)
    .returns<AttendanceRecordRow[]>();

  if (attendanceError) throw attendanceError;

  const validRecords = (attendanceRecords ?? []).filter((record) => {
    const event = record.calendar_event;

    return (
      !!event &&
      event.type === "class" &&
      event.is_deleted === false &&
      event.date <= today &&
      !isCancelledStatus(record.status)
    );
  });

  let attendedCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let conductedCount = 0;

  const subjectAttendanceMap = new Map<
    number,
    { attended: number; total: number }
  >();

  for (const record of validRecords) {
    if (!isConductedStatus(record.status)) continue;

    conductedCount += 1;

    if (isAttendedStatus(record.status)) {
      attendedCount += 1;
    } else if (record.status === "ABSENT") {
      absentCount += 1;
    } else if (record.status === "LEAVE") {
      leaveCount += 1;
    }

    const subjectId = record.calendar_event?.subject;
    if (!subjectId) continue;

    const subjectStats = subjectAttendanceMap.get(subjectId) ?? {
      attended: 0,
      total: 0,
    };

    subjectStats.total += 1;
    if (isAttendedStatus(record.status)) {
      subjectStats.attended += 1;
    }

    subjectAttendanceMap.set(subjectId, subjectStats);
  }

  const overallAttendancePercentage =
    conductedCount === 0
      ? 0
      : Math.round((attendedCount / conductedCount) * 100);
  const absentPercentage =
    conductedCount === 0 ? 0 : Math.round((absentCount / conductedCount) * 100);
  const leavePercentage =
    conductedCount === 0 ? 0 : Math.round((leaveCount / conductedCount) * 100);

  const subjectAttendance = Array.from(subjectAttendanceMap.entries())
    .map(([subjectId, stats]) => {
      const percentage =
        stats.total === 0 ? 0 : Math.round((stats.attended / stats.total) * 100);

      return {
        subject: subjectMap.get(subjectId) ?? "Unknown",
        attended: stats.attended,
        total: stats.total,
        status: getAttendanceStatus(percentage),
        percentage,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));

  const semesterSubjectIds = (semesterSubjects ?? []).map(
    (subject) => subject.collegeSubjectId,
  );

  let assignmentQuery = supabase
    .from("assignments")
    .select(
      `
      assignmentId,
      subjectId,
      topicName,
      submissionDeadlineInt,
      marks,
      dateAssignedInt,
      status
    `,
    )
    .eq("collegeBranchId", studentContext.collegeBranchId)
    .eq("collegeAcademicYearId", studentContext.collegeAcademicYearId)
    .eq("collegeSectionsId", studentContext.collegeSectionsId)
    .eq("is_deleted", false)
    .neq("status", "Cancelled");

  if (semesterSubjectIds.length > 0) {
    assignmentQuery = assignmentQuery.in("subjectId", semesterSubjectIds);
  }

  const { data: assignments, error: assignmentsError } = await assignmentQuery
    .order("dateAssignedInt", { ascending: false })
    .returns<AssignmentRow[]>();

  if (assignmentsError) throw assignmentsError;

  const assignmentIds = (assignments ?? []).map(
    (assignment) => assignment.assignmentId,
  );

  const { data: submissions, error: submissionsError } = assignmentIds.length
    ? await supabase
        .from("student_assignments_submission")
        .select("assignmentId, feedback, marksScored, status")
        .eq("studentId", studentContext.studentId)
        .is("deletedAt", null)
        .in("assignmentId", assignmentIds)
        .returns<SubmissionRow[]>()
    : { data: [], error: null };

  if (submissionsError) throw submissionsError;

  const submissionMap = new Map(
    (submissions ?? []).map((submission) => [submission.assignmentId, submission]),
  );

  const assignmentsSummary = (assignments ?? []).map((assignment) => {
    const submission = submissionMap.get(assignment.assignmentId);
    const marks =
      submission?.marksScored !== null && submission?.marksScored !== undefined
        ? `${submission.marksScored} / ${assignment.marks}`
        : "-";

    return {
      assignmentId: assignment.assignmentId,
      subject: subjectMap.get(assignment.subjectId) ?? "Unknown",
      title: assignment.topicName,
      dueDate: formatIntDate(assignment.submissionDeadlineInt),
      marks,
      feedback: submission?.feedback?.trim() || "-",
      submissionStatus: submission?.status ?? null,
      assignmentStatus: assignment.status ?? null,
    };
  });

  return {
    overallAttendancePercentage,
    absentPercentage,
    leavePercentage,
    subjectAttendance,
    conductedCount,
    attendedCount,
    absentCount,
    leaveCount,
    assignmentsSummary,
  };
}
