import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { getAdminStudentProgressDetails } from "@/lib/helpers/admin/studentProgress/getAdminStudentProgressDetails";
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
    facultyId: number | null;
    type: string;
    date: string;
    is_deleted: boolean | null;
  } | null;
};

type SubjectRow = {
  collegeSubjectId: number;
  subjectName: string;
  subjectKey: string | null;
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

type QuizRow = {
  quizId: number;
  collegeSubjectId: number;
  totalMarks: number;
};

type QuizSubmissionRow = {
  quizId: number;
  totalMarksObtained: number | null;
};

type FacultySectionRow = {
  facultyId: number;
  collegeSubjectId: number;
};

type DiscussionForumRow = {
  discussionId: number;
  createdBy: number | null;
};

type DiscussionSectionRow = {
  discussionId: number;
  collegeSectionsId: number;
  marks: number | null;
};

type DiscussionUploadRow = {
  discussionId: number;
  marksObtained: number | null;
};

type WeightageConfigRow = {
  collegeSubjectId: number;
  collegeSectionsId?: number | null;
  collegeSemesterId?: number | null;
  faculty_weightage_items:
    | {
        label: string;
        percentage: number;
      }[]
    | {
        label: string;
        percentage: number;
      }
    | null;
};

type ProgressWeights = {
  attendance: number;
  assignments: number;
  quiz: number;
  discussion: number;
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

const normalizeWeightageLabel = (label: string) => label.trim().toLowerCase();

const buildProgressWeightsFromConfigs = (
  configs: WeightageConfigRow[],
): ProgressWeights => {
  const emptyWeights: ProgressWeights = {
    attendance: 0,
    assignments: 0,
    quiz: 0,
    discussion: 0,
  };

  if (!configs.length) return emptyWeights;

  const totals = { ...emptyWeights };
  let matchedConfigs = 0;

  for (const config of configs) {
    const items = Array.isArray(config.faculty_weightage_items)
      ? config.faculty_weightage_items
      : config.faculty_weightage_items
        ? [config.faculty_weightage_items]
        : [];

    const bucket = { ...emptyWeights };
    let hasRecognized = false;

    for (const item of items) {
      const normalized = normalizeWeightageLabel(item.label);

      if (normalized.includes("attendance")) {
        bucket.attendance += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("assignment")) {
        bucket.assignments += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("quiz")) {
        bucket.quiz += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("discussion")) {
        bucket.discussion += item.percentage;
        hasRecognized = true;
      }
    }

    if (!hasRecognized) continue;

    totals.attendance += bucket.attendance;
    totals.assignments += bucket.assignments;
    totals.quiz += bucket.quiz;
    totals.discussion += bucket.discussion;
    matchedConfigs += 1;
  }

  if (!matchedConfigs) return emptyWeights;

  return {
    attendance: totals.attendance / matchedConfigs,
    assignments: totals.assignments / matchedConfigs,
    quiz: totals.quiz / matchedConfigs,
    discussion: totals.discussion / matchedConfigs,
  };
};

export async function getStudentProgressData(userId: number) {
  const today = formatDate(new Date());
  const studentContext = await fetchStudentContext(userId);

  let subjectsQuery = supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName, subjectKey")
    .eq("collegeId", studentContext.collegeId)
    .eq("collegeBranchId", studentContext.collegeBranchId)
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
  const subjectLabelById = new Map(
    (semesterSubjects ?? []).map((subject) => [
      subject.collegeSubjectId,
      subject.subjectKey?.trim() || subject.subjectName,
    ]),
  );
  const semesterSubjectIds = (semesterSubjects ?? []).map(
    (subject) => subject.collegeSubjectId,
  );

  const { data: studentPinRow, error: studentPinError } = await supabase
    .from("student_pins")
    .select("pinNumber")
    .eq("studentId", studentContext.studentId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle<{ pinNumber: string }>();

  if (studentPinError) throw studentPinError;

  const { data: facultySectionRows, error: facultySectionError } =
    semesterSubjectIds.length > 0
      ? await supabase
          .from("faculty_sections")
          .select("facultyId, collegeSubjectId")
          .eq("collegeAcademicYearId", studentContext.collegeAcademicYearId)
          .eq("collegeSectionsId", studentContext.collegeSectionsId)
          .in("collegeSubjectId", semesterSubjectIds)
          .eq("isActive", true)
          .is("deletedAt", null)
          .returns<FacultySectionRow[]>()
      : { data: [], error: null };

  if (facultySectionError) throw facultySectionError;

  const facultyIds = Array.from(
    new Set((facultySectionRows ?? []).map((row) => row.facultyId)),
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
        facultyId,
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
      !!event.facultyId &&
      facultyIds.includes(event.facultyId) &&
      !!event.subject &&
      semesterSubjectIds.includes(event.subject) &&
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

  const unresolvedSubjectIds = Array.from(subjectAttendanceMap.keys()).filter(
    (subjectId) => !subjectMap.has(subjectId),
  );

  if (unresolvedSubjectIds.length > 0) {
    const { data: fallbackSubjects, error: fallbackSubjectsError } =
      await supabase
        .from("college_subjects")
        .select("collegeSubjectId, subjectName, subjectKey")
        .in("collegeSubjectId", unresolvedSubjectIds)
        .is("deletedAt", null)
        .returns<SubjectRow[]>();

    if (fallbackSubjectsError) throw fallbackSubjectsError;

    for (const subject of fallbackSubjects ?? []) {
      subjectMap.set(subject.collegeSubjectId, subject.subjectName);
    }
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
        subjectId,
        status: getAttendanceStatus(percentage),
        percentage,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));

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

  const { data: quizzes, error: quizzesError } = semesterSubjectIds.length
    ? await supabase
        .from("quizzes")
        .select("quizId, collegeSubjectId, totalMarks")
        .eq("collegeAcademicYearId", studentContext.collegeAcademicYearId)
        .eq("collegeSectionsId", studentContext.collegeSectionsId)
        .in("collegeSubjectId", semesterSubjectIds)
        .eq("isActive", true)
        .is("deletedAt", null)
        .returns<QuizRow[]>()
    : { data: [], error: null };

  if (quizzesError) throw quizzesError;

  const quizIds = (quizzes ?? []).map((quiz) => quiz.quizId);

  const { data: quizSubmissions, error: quizSubmissionsError } = quizIds.length
    ? await supabase
        .from("quiz_submissions")
        .select("quizId, totalMarksObtained")
        .eq("studentId", studentContext.studentId)
        .in("quizId", quizIds)
        .returns<QuizSubmissionRow[]>()
    : { data: [], error: null };

  if (quizSubmissionsError) throw quizSubmissionsError;

  const { data: discussions, error: discussionsError } = facultyIds.length
    ? await supabase
        .from("discussion_forum")
        .select("discussionId, createdBy")
        .in("createdBy", facultyIds)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .returns<DiscussionForumRow[]>()
    : { data: [], error: null };

  if (discussionsError) throw discussionsError;

  const discussionIds = (discussions ?? []).map(
    (discussion) => discussion.discussionId,
  );

  const { data: discussionSections, error: discussionSectionsError } =
    discussionIds.length
      ? await supabase
          .from("discussion_forum_sections")
          .select("discussionId, collegeSectionsId, marks")
          .in("discussionId", discussionIds)
          .eq("collegeSectionsId", studentContext.collegeSectionsId)
          .eq("is_deleted", false)
          .is("deletedAt", null)
          .returns<DiscussionSectionRow[]>()
      : { data: [], error: null };

  if (discussionSectionsError) throw discussionSectionsError;

  const { data: discussionUploads, error: discussionUploadsError } =
    discussionIds.length
      ? await supabase
          .from("student_discussion_uploads")
          .select("discussionId, marksObtained")
          .eq("studentId", studentContext.studentId)
          .in("discussionId", discussionIds)
          .eq("isActive", true)
          .eq("is_deleted", false)
          .returns<DiscussionUploadRow[]>()
      : { data: [], error: null };

  if (discussionUploadsError) throw discussionUploadsError;

  let weightageQuery = supabase
    .from("faculty_weightage_configs")
    .select(
      `
      collegeSubjectId,
      collegeSectionsId,
      collegeSemesterId,
      faculty_weightage_items (
        label,
        percentage
      )
    `,
    )
    .eq("collegeId", studentContext.collegeId)
    .eq("collegeEducationId", studentContext.collegeEducationId)
    .eq("collegeBranchId", studentContext.collegeBranchId)
    .eq("collegeSectionsId", studentContext.collegeSectionsId)
    .in("collegeSubjectId", semesterSubjectIds)
    .is("deletedAt", null);

  if (studentContext.collegeSemesterId === null) {
    weightageQuery = weightageQuery.is("collegeSemesterId", null);
  } else {
    weightageQuery = weightageQuery.eq(
      "collegeSemesterId",
      studentContext.collegeSemesterId,
    );
  }

  const { data: weightageConfigs, error: weightageConfigsError } =
    semesterSubjectIds.length
      ? await weightageQuery.returns<WeightageConfigRow[]>()
      : { data: [], error: null };

  if (weightageConfigsError) throw weightageConfigsError;

  const assignmentProgressBySubject = new Map<
    number,
    { total: number; submitted: number; obtained: number; possible: number }
  >();

  for (const assignment of assignments ?? []) {
    const stats = assignmentProgressBySubject.get(assignment.subjectId) ?? {
      total: 0,
      submitted: 0,
      obtained: 0,
      possible: 0,
    };

    stats.total += 1;
    stats.possible += assignment.marks ?? 0;

    const submission = submissionMap.get(assignment.assignmentId);
    if (submission) {
      stats.submitted += 1;
      stats.obtained += Math.min(
        submission.marksScored ?? 0,
        assignment.marks ?? 0,
      );
    }

    assignmentProgressBySubject.set(assignment.subjectId, stats);
  }

  const bestQuizSubmissionByQuizId = new Map<number, number>();
  for (const submission of quizSubmissions ?? []) {
    const previous = bestQuizSubmissionByQuizId.get(submission.quizId) ?? -1;
    const current = submission.totalMarksObtained ?? 0;
    if (current > previous) {
      bestQuizSubmissionByQuizId.set(submission.quizId, current);
    }
  }

  const quizProgressBySubject = new Map<
    number,
    { obtained: number; possible: number }
  >();

  for (const quiz of quizzes ?? []) {
    const stats = quizProgressBySubject.get(quiz.collegeSubjectId) ?? {
      obtained: 0,
      possible: 0,
    };

    stats.possible += quiz.totalMarks ?? 0;
    stats.obtained += Math.min(
      bestQuizSubmissionByQuizId.get(quiz.quizId) ?? 0,
      quiz.totalMarks ?? 0,
    );

    quizProgressBySubject.set(quiz.collegeSubjectId, stats);
  }

  const subjectIdsByFacultyId = new Map<number, number[]>();
  for (const row of facultySectionRows ?? []) {
    const existing = subjectIdsByFacultyId.get(row.facultyId) ?? [];
    if (!existing.includes(row.collegeSubjectId)) {
      existing.push(row.collegeSubjectId);
      subjectIdsByFacultyId.set(row.facultyId, existing);
    }
  }

  const discussionSectionById = new Map(
    (discussionSections ?? []).map((section) => [section.discussionId, section]),
  );
  const discussionUploadById = new Map(
    (discussionUploads ?? []).map((upload) => [upload.discussionId, upload]),
  );

  const discussionScoresBySubject = new Map<number, { obtained: number; total: number }>();
  for (const discussion of discussions ?? []) {
    const section = discussionSectionById.get(discussion.discussionId);
    if (!section) continue;

    const mappedSubjectIds = (
      subjectIdsByFacultyId.get(discussion.createdBy ?? -1) ?? []
    ).filter((subjectId) => semesterSubjectIds.includes(subjectId));

    const effectiveSubjectIds =
      mappedSubjectIds.length === 1
        ? mappedSubjectIds
        : semesterSubjectIds.length === 1
          ? [semesterSubjectIds[0]]
          : [];

    if (!effectiveSubjectIds.length) continue;

    const upload = discussionUploadById.get(discussion.discussionId);
    const totalMarks = Number(section.marks) || 0;
    const obtainedMarks = Math.min(Number(upload?.marksObtained) || 0, totalMarks);

    for (const subjectId of effectiveSubjectIds) {
      const stats = discussionScoresBySubject.get(subjectId) ?? {
        obtained: 0,
        total: 0,
      };
      stats.obtained += obtainedMarks;
      stats.total += totalMarks;
      discussionScoresBySubject.set(subjectId, stats);
    }
  }

  const adminAlignedDetails =
    studentPinRow?.pinNumber && semesterSubjectIds.length > 0
      ? await getAdminStudentProgressDetails({
          rollNo: studentPinRow.pinNumber,
          collegeId: studentContext.collegeId,
          collegeEducationId: studentContext.collegeEducationId,
          collegeBranchIds: [studentContext.collegeBranchId],
          academicYearIds: [studentContext.collegeAcademicYearId],
          semesterIds: studentContext.collegeSemesterId
            ? [studentContext.collegeSemesterId]
            : [],
          sectionIds: [studentContext.collegeSectionsId],
          subjectIds: semesterSubjectIds,
          departmentLabel: studentContext.collegeBranchCode,
        })
      : null;

  const adminAcademicPerformanceBySubject = new Map(
    (adminAlignedDetails?.academicPerformance ?? []).map((item) => [
      item.subject,
      item.value,
    ]),
  );

  const subjectProgressRows = (semesterSubjects ?? []).map((subject) => {
    const attendanceStats = subjectAttendanceMap.get(subject.collegeSubjectId) ?? {
      attended: 0,
      total: 0,
    };
    const assignmentStats =
      assignmentProgressBySubject.get(subject.collegeSubjectId) ?? {
        total: 0,
        submitted: 0,
        obtained: 0,
        possible: 0,
      };
    const quizStats = quizProgressBySubject.get(subject.collegeSubjectId) ?? {
      obtained: 0,
      possible: 0,
    };
    const discussionStats =
      discussionScoresBySubject.get(subject.collegeSubjectId) ?? {
        obtained: 0,
        total: 0,
      };

    const attendancePercentage =
      attendanceStats.total > 0
        ? Math.round((attendanceStats.attended / attendanceStats.total) * 100)
        : 0;
    const subjectLabel =
      subject.subjectKey?.trim() || subject.subjectName;

    return {
      subject: subject.subjectName,
      subjectKey: subjectLabel,
      attendance: `${attendancePercentage}%`,
      assignmentsDone:
        assignmentStats.total > 0
          ? `${assignmentStats.submitted}/${assignmentStats.total}`
          : "-",
      quiz:
        quizStats.possible > 0
          ? `${quizStats.obtained}/${quizStats.possible}`
          : "-",
      discussionForum:
        discussionStats.total > 0
          ? `${discussionStats.obtained}/${discussionStats.total}`
          : "-",
      progressPercent:
        adminAcademicPerformanceBySubject.get(subjectLabel) ??
        adminAcademicPerformanceBySubject.get(
          subjectLabelById.get(subject.collegeSubjectId) ?? subject.subjectName,
        ) ??
        0,
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
    subjectProgressRows,
  };
}
