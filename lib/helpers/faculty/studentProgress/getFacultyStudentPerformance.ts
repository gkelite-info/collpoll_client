import { supabase } from "@/lib/supabaseClient";
import { getBaseStudentHistory } from "./getBaseStudentHistory";
import {
  FacultyStudentProgressDetailsScope,
  SubjectMetric,
  TaskInsight,
  GradeEntry,
  formatDate,
  getFirst,
  isAttendedStatus,
  isCancelledStatus,
  isConductedStatus,
  buildProgressWeightsFromConfigs,
  getDerivedGrade,
  AttendanceRecordRow,
  SubjectRow,
  AssignmentRow,
  DiscussionForumRow,
  QuizRow,
  WeightageConfigRow,
  AssignmentSubmissionRow,
  DiscussionSectionRow,
  DiscussionUploadRow,
  QuizSubmissionRow
} from "./sharedProgressTypes";

export type FacultyStudentPerformance = {
  academicPerformance: SubjectMetric[];
  taskWeightages: {
    assignments: number;
    quizzes: number;
    discussions: number;
  };
  taskInsights: {
    assignments: TaskInsight;
    quizzes: TaskInsight;
    discussions: TaskInsight;
  };
  grades: GradeEntry[];
};

export async function getFacultyStudentPerformance(
  scope: FacultyStudentProgressDetailsScope,
): Promise<FacultyStudentPerformance | null> {
  const baseData = await getBaseStudentHistory(scope);
  if (!baseData) return null;

  const { studentRow, historyRow } = baseData;
  const today = formatDate(new Date());

  let weightageQuery = supabase
    .from("faculty_weightage_configs")
    .select(`
      collegeSubjectId,
      collegeSectionsId,
      collegeSemesterId,
      faculty_weightage_items (
        label,
        percentage
      )
    `)
    .eq("facultyId", scope.facultyId)
    .eq("collegeId", scope.collegeId)
    .eq("collegeEducationId", scope.collegeEducationId)
    .eq("collegeSectionsId", historyRow.collegeSectionsId)
    .in("collegeSubjectId", scope.subjectIds)
    .is("deletedAt", null);

  if (!scope.isSchool) {
    weightageQuery = weightageQuery.eq("collegeBranchId", scope.collegeBranchId);
  }

  if (historyRow.collegeSemesterId === null) {
    weightageQuery = weightageQuery.is("collegeSemesterId", null);
  } else {
    weightageQuery = weightageQuery.eq("collegeSemesterId", historyRow.collegeSemesterId);
  }

  let subjectsQuery = supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName, subjectKey")
    .in("collegeSubjectId", scope.subjectIds)
    .eq("collegeAcademicYearId", historyRow.collegeAcademicYearId)
    .eq("collegeEducationId", scope.collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  let assignmentsQuery = supabase
    .from("assignments")
    .select("assignmentId, subjectId, topicName, submissionDeadlineInt, marks, status")
    .eq("createdBy", scope.facultyId)
    .eq("collegeAcademicYearId", historyRow.collegeAcademicYearId)
    .eq("collegeSectionsId", historyRow.collegeSectionsId)
    .in("subjectId", scope.subjectIds)
    .eq("is_deleted", false)
    .neq("status", "Cancelled");

  if (!scope.isSchool) {
    subjectsQuery = subjectsQuery.eq("collegeBranchId", scope.collegeBranchId);
    assignmentsQuery = assignmentsQuery.eq("collegeBranchId", scope.collegeBranchId);
  }

  const [
    attendanceResult,
    subjectsResult,
    assignmentsResult,
    discussionsResult,
    quizzesResult,
    weightagesResult,
  ] = await Promise.all([
    supabase
      .from("attendance_record")
      .select(`
        status,
        calendar_event:calendar_event (
          subject,
          facultyId,
          type,
          date,
          is_deleted
        ),
        bulk_event:bulk_calendar_events (
          subject,
          facultyId,
          type,
          fromDate,
          is_deleted
        )
      `)
      .eq("studentId", studentRow.studentId)
      .is("deletedAt", null)
      .lte("markedAt", today)
      .returns<AttendanceRecordRow[]>(),
    subjectsQuery.returns<SubjectRow[]>(),
    assignmentsQuery.returns<AssignmentRow[]>(),
    supabase
      .from("discussion_forum")
      .select("discussionId, title, deadline, createdAt, createdBy")
      .eq("createdBy", scope.facultyId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .returns<DiscussionForumRow[]>(),
    supabase
      .from("quizzes")
      .select("quizId, collegeSubjectId, totalMarks, quizTitle, endDate, status")
      .eq("facultyId", scope.facultyId)
      .eq("collegeAcademicYearId", historyRow.collegeAcademicYearId)
      .eq("collegeSectionsId", historyRow.collegeSectionsId)
      .in("collegeSubjectId", scope.subjectIds)
      .eq("isActive", true)
      .is("deletedAt", null)
      .returns<QuizRow[]>(),
    weightageQuery.returns<WeightageConfigRow[]>(),
  ]);

  if (attendanceResult.error) throw attendanceResult.error;
  if (subjectsResult.error) throw subjectsResult.error;
  if (assignmentsResult.error) throw assignmentsResult.error;
  if (discussionsResult.error) throw discussionsResult.error;
  if (quizzesResult.error) throw quizzesResult.error;
  if (weightagesResult.error) throw weightagesResult.error;

  const assignmentIds = (assignmentsResult.data ?? []).map((assignment) => assignment.assignmentId);
  const discussionIds = ((discussionsResult.data ?? []) as DiscussionForumRow[]).map(
    (discussion) => discussion.discussionId,
  );
  const quizIds = (quizzesResult.data ?? []).map((quiz) => quiz.quizId);

  const [
    assignmentSubmissionsResult,
    discussionSectionsResult,
    discussionUploadsResult,
    quizSubmissionsResult,
  ] = await Promise.all([
    assignmentIds.length
      ? supabase
          .from("student_assignments_submission")
          .select("assignmentId, marksScored, status")
          .eq("studentId", studentRow.studentId)
          .in("assignmentId", assignmentIds)
          .is("deletedAt", null)
          .returns<AssignmentSubmissionRow[]>()
      : Promise.resolve({ data: [], error: null }),
    discussionIds.length
      ? supabase
          .from("discussion_forum_sections")
          .select("discussionId, collegeSectionsId, marks")
          .in("discussionId", discussionIds)
          .eq("collegeSectionsId", historyRow.collegeSectionsId)
          .eq("is_deleted", false)
          .is("deletedAt", null)
          .returns<DiscussionSectionRow[]>()
      : Promise.resolve({ data: [], error: null }),
    discussionIds.length
      ? supabase
          .from("student_discussion_uploads")
          .select("discussionId, marksObtained, submittedAt, createdAt")
          .eq("studentId", studentRow.studentId)
          .in("discussionId", discussionIds)
          .eq("isActive", true)
          .eq("is_deleted", false)
          .returns<DiscussionUploadRow[]>()
      : Promise.resolve({ data: [], error: null }),
    quizIds.length
      ? supabase
          .from("quiz_submissions")
          .select("quizId, totalMarksObtained, submittedAt, createdAt")
          .eq("studentId", studentRow.studentId)
          .in("quizId", quizIds)
          .eq("isActive", true)
          .is("deletedAt", null)
          .returns<QuizSubmissionRow[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (assignmentSubmissionsResult.error) throw assignmentSubmissionsResult.error;
  if (discussionSectionsResult.error) throw discussionSectionsResult.error;
  if (discussionUploadsResult.error) throw discussionUploadsResult.error;
  if (quizSubmissionsResult.error) throw quizSubmissionsResult.error;

  const subjectNameById = new Map(
    ((subjectsResult.data ?? []) as SubjectRow[]).map((subject) => [
      subject.collegeSubjectId,
      subject.subjectName,
    ]),
  );
  const subjectLabelById = new Map(
    ((subjectsResult.data ?? []) as SubjectRow[]).map((subject) => [
      subject.collegeSubjectId,
      subject.subjectKey?.trim() || subject.subjectName,
    ]),
  );

  const relevantAttendance = ((attendanceResult.data ?? []) as AttendanceRecordRow[]).filter(
    (record) => {
      const singleEvent = Array.isArray(record.calendar_event)
        ? record.calendar_event[0]
        : record.calendar_event;
      const bulkEvent = Array.isArray(record.bulk_event)
        ? record.bulk_event[0]
        : record.bulk_event;
        
      const event = singleEvent || bulkEvent;
      const eventDate = singleEvent ? singleEvent.date : bulkEvent?.fromDate;

      return (
        !!event &&
        event.facultyId === scope.facultyId &&
        !!event.subject &&
        scope.subjectIds.includes(event.subject) &&
        event.type === "class" &&
        event.is_deleted === false &&
        !!eventDate &&
        eventDate <= today &&
        !isCancelledStatus(record.status) &&
        isConductedStatus(record.status)
      );
    },
  );

  const attendanceBySubject = new Map<number, { attended: number; total: number }>();
  for (const record of relevantAttendance) {
    const singleEvent = Array.isArray(record.calendar_event)
      ? record.calendar_event[0]
      : record.calendar_event;
    const bulkEvent = Array.isArray(record.bulk_event)
      ? record.bulk_event[0]
      : record.bulk_event;
    const event = singleEvent || bulkEvent;
    
    if (!event?.subject) continue;

    const subjectStats = attendanceBySubject.get(event.subject) ?? { attended: 0, total: 0 };
    subjectStats.total += 1;
    if (isAttendedStatus(record.status)) {
      subjectStats.attended += 1;
    }
    attendanceBySubject.set(event.subject, subjectStats);
  }

  const assignmentSubmissionById = new Map(
    ((assignmentSubmissionsResult.data ?? []) as AssignmentSubmissionRow[]).map((submission) => [
      submission.assignmentId,
      submission,
    ]),
  );

  const discussionSectionById = new Map(
    ((discussionSectionsResult.data ?? []) as DiscussionSectionRow[]).map((section) => [
      section.discussionId,
      section,
    ]),
  );
  const discussionUploadById = new Map(
    ((discussionUploadsResult.data ?? []) as DiscussionUploadRow[]).map((upload) => [
      upload.discussionId,
      upload,
    ]),
  );

  const discussionScoresBySubject = new Map<number, { obtained: number; total: number }>();
  const effectiveDiscussionSubjectIds = scope.subjectIds.length === 1 ? [scope.subjectIds[0]] : [];
  if (effectiveDiscussionSubjectIds.length) {
    for (const discussion of (discussionsResult.data ?? []) as DiscussionForumRow[]) {
      const section = discussionSectionById.get(discussion.discussionId);
      if (!section) continue;
      const upload = discussionUploadById.get(discussion.discussionId);
      const obtainedMarks = upload?.marksObtained ?? 0;
      const totalMarks = section.marks ?? 0;

      for (const subjectId of effectiveDiscussionSubjectIds) {
        const stats = discussionScoresBySubject.get(subjectId) ?? { obtained: 0, total: 0 };
        stats.obtained += obtainedMarks;
        stats.total += totalMarks;
        discussionScoresBySubject.set(subjectId, stats);
      }
    }
  }

  const bestQuizById = new Map<number, number>();
  for (const submission of (quizSubmissionsResult.data ?? []) as QuizSubmissionRow[]) {
    bestQuizById.set(
      submission.quizId,
      Math.max(bestQuizById.get(submission.quizId) ?? 0, submission.totalMarksObtained ?? 0),
    );
  }

  const assignmentScoresBySubject = new Map<number, { obtained: number; total: number }>();
  for (const assignment of (assignmentsResult.data ?? []) as AssignmentRow[]) {
    const stats = assignmentScoresBySubject.get(assignment.subjectId) ?? { obtained: 0, total: 0 };
    const submission = assignmentSubmissionById.get(assignment.assignmentId);
    stats.total += assignment.marks ?? 0;
    stats.obtained += submission?.marksScored ?? 0;
    assignmentScoresBySubject.set(assignment.subjectId, stats);
  }

  const quizzesBySubject = new Map<number, { obtained: number; total: number }>();
  for (const quiz of (quizzesResult.data ?? []) as QuizRow[]) {
    const stats = quizzesBySubject.get(quiz.collegeSubjectId) ?? { obtained: 0, total: 0 };
    stats.total += quiz.totalMarks ?? 0;
    stats.obtained += bestQuizById.get(quiz.quizId) ?? 0;
    quizzesBySubject.set(quiz.collegeSubjectId, stats);
  }

  const subjectIds = Array.from(subjectNameById.keys());
  const weightageConfigs = (weightagesResult.data ?? []) as WeightageConfigRow[];
  const taskWeights = buildProgressWeightsFromConfigs(weightageConfigs);
  
  const assignmentInsight = {
    obtained: Array.from(assignmentScoresBySubject.values()).reduce((sum, stats) => sum + stats.obtained, 0),
    total: Array.from(assignmentScoresBySubject.values()).reduce((sum, stats) => sum + stats.total, 0),
  };
  const quizInsight = {
    obtained: Array.from(quizzesBySubject.values()).reduce((sum, stats) => sum + stats.obtained, 0),
    total: Array.from(quizzesBySubject.values()).reduce((sum, stats) => sum + stats.total, 0),
  };
  const discussionInsight = {
    obtained: Array.from(discussionScoresBySubject.values()).reduce((sum, stats) => sum + stats.obtained, 0),
    total: Array.from(discussionScoresBySubject.values()).reduce((sum, stats) => sum + stats.total, 0),
  };

  const academicPerformance: SubjectMetric[] = subjectIds.map((subjectId) => {
    const attendanceStats = attendanceBySubject.get(subjectId) ?? { attended: 0, total: 0 };
    const assignmentStats = assignmentScoresBySubject.get(subjectId) ?? { obtained: 0, total: 0 };
    const quizStats = quizzesBySubject.get(subjectId) ?? { obtained: 0, total: 0 };
    const discussionStats = discussionScoresBySubject.get(subjectId) ?? { obtained: 0, total: 0 };

    const attendancePct = attendanceStats.total > 0 ? Math.round((attendanceStats.attended / attendanceStats.total) * 100) : null;
    const assignmentPct = assignmentStats.total > 0 ? Math.round((assignmentStats.obtained / assignmentStats.total) * 100) : null;
    const quizPct = quizStats.total > 0 ? Math.round((quizStats.obtained / quizStats.total) * 100) : null;
    const discussionPct = discussionStats.total > 0 ? Math.round((discussionStats.obtained / discussionStats.total) * 100) : null;

    const subjectConfigs = weightageConfigs.filter((config) => config.collegeSubjectId === subjectId);
    const weights = buildProgressWeightsFromConfigs(subjectConfigs);
    const totalConfiguredWeight = weights.attendance + weights.assignments + weights.quiz + weights.discussion;

    let value = 0;
    if (totalConfiguredWeight > 0) {
      if (attendancePct !== null && weights.attendance > 0) value += (attendancePct / 100) * weights.attendance;
      if (assignmentPct !== null && weights.assignments > 0) value += (assignmentPct / 100) * weights.assignments;
      if (quizPct !== null && weights.quiz > 0) value += (quizPct / 100) * weights.quiz;
      if (discussionPct !== null && weights.discussion > 0) value += (discussionPct / 100) * weights.discussion;
      value = Math.round(value);
    }

    return {
      subject: subjectLabelById.get(subjectId) ?? "Unknown",
      value,
      full: 100,
    };
  });

  const grades: GradeEntry[] = academicPerformance.map((subject) => ({
    subject: subject.subject,
    grade: getDerivedGrade(subject.value),
    improvement: subject.value >= 60 ? "Improved" : "Declining",
  }));

  return {
    academicPerformance,
    taskWeightages: {
      assignments: Math.round(taskWeights.assignments),
      quizzes: Math.round(taskWeights.quiz),
      discussions: Math.round(taskWeights.discussion),
    },
    taskInsights: {
      assignments: {
        ...assignmentInsight,
        weightedScore: assignmentInsight.total > 0 && taskWeights.assignments > 0
          ? Math.round((assignmentInsight.obtained / assignmentInsight.total) * taskWeights.assignments)
          : 0,
      },
      quizzes: {
        ...quizInsight,
        weightedScore: quizInsight.total > 0 && taskWeights.quiz > 0
          ? Math.round((quizInsight.obtained / quizInsight.total) * taskWeights.quiz)
          : 0,
      },
      discussions: {
        ...discussionInsight,
        weightedScore: discussionInsight.total > 0 && taskWeights.discussion > 0
          ? Math.round((discussionInsight.obtained / discussionInsight.total) * taskWeights.discussion)
          : 0,
      },
    },
    grades,
  };
}
