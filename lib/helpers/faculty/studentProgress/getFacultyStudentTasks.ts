import { supabase } from "@/lib/supabaseClient";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { getBaseStudentHistory } from "./getBaseStudentHistory";
import {
  FacultyStudentProgressDetailsScope,
  AssignmentListItem,
  QuizListItem,
  DiscussionListItem,
  formatIntDate,
  formatIsoDate,
  SubjectRow,
  AssignmentRow,
  DiscussionForumRow,
  QuizRow,
  AssignmentSubmissionRow,
  DiscussionSectionRow,
  DiscussionUploadRow,
  QuizSubmissionRow
} from "./sharedProgressTypes";

export type GetTasksParams = FacultyStudentProgressDetailsScope & {
  taskType: "assignments" | "quizzes" | "discussions";
  pageParam?: number;
  pageSize?: number;
};

export type TasksResponse = {
  items: (AssignmentListItem | QuizListItem | DiscussionListItem)[];
  nextCursor: number | null;
};

export async function getFacultyStudentTasks(
  params: GetTasksParams,
): Promise<TasksResponse> {
  const baseData = await getBaseStudentHistory(params);
  if (!baseData) return { items: [], nextCursor: null };

  const { studentRow, historyRow } = baseData;
  const { taskType, pageParam = 0, pageSize = 10 } = params;
  
  const studentEduId = studentRow.collegeEducationId;
  const studentBranchId = studentRow.collegeBranchId;
  const isStudentSchool = isSchoolEducation(
    Array.isArray(studentRow.college_education)
      ? studentRow.college_education[0]?.collegeEducationType
      : studentRow.college_education?.collegeEducationType
  );

  const from = pageParam * pageSize;
  const to = from + pageSize - 1;

  let subjectsQuery = supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName, subjectKey")
    .eq("collegeAcademicYearId", historyRow.collegeAcademicYearId)
    .eq("collegeEducationId", studentEduId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (!isStudentSchool) {
    subjectsQuery = subjectsQuery.eq("collegeBranchId", studentBranchId);
  }

  const { data: subjectsData, error: subjectsError } = await subjectsQuery.returns<SubjectRow[]>();
  if (subjectsError) throw subjectsError;

  const subjectNameById = new Map(
    (subjectsData ?? []).map((subject) => [
      subject.collegeSubjectId,
      subject.subjectName,
    ]),
  );

  if (taskType === "assignments") {
    let query = supabase
      .from("assignments")
      .select("assignmentId, subjectId, topicName, submissionDeadlineInt, marks, status")
      .eq("createdBy", params.facultyId)
      .eq("collegeAcademicYearId", historyRow.collegeAcademicYearId)
      .eq("collegeSectionsId", historyRow.collegeSectionsId)
      .eq("is_deleted", false)
      .neq("status", "Cancelled")
      .order("submissionDeadlineInt", { ascending: false })
      .range(from, to);

    if (!isStudentSchool) {
      query = query.eq("collegeBranchId", studentBranchId);
    }

    const { data: assignments, error: assignmentsError } = await query.returns<AssignmentRow[]>();
    if (assignmentsError) throw assignmentsError;

    const assignmentIds = (assignments ?? []).map((a) => a.assignmentId);
    let submissions: AssignmentSubmissionRow[] = [];
    if (assignmentIds.length > 0) {
      const { data, error } = await supabase
        .from("student_assignments_submission")
        .select("assignmentId, marksScored, status")
        .eq("studentId", studentRow.studentId)
        .in("assignmentId", assignmentIds)
        .is("deletedAt", null)
        .returns<AssignmentSubmissionRow[]>();
      if (error) throw error;
      submissions = data ?? [];
    }

    const submissionById = new Map(submissions.map((s) => [s.assignmentId, s]));

    const items: AssignmentListItem[] = (assignments ?? []).map((assignment) => ({
      id: assignment.assignmentId,
      subject: subjectNameById.get(assignment.subjectId) ?? "Unknown",
      task: assignment.topicName,
      dueDate: formatIntDate(assignment.submissionDeadlineInt),
      dueDateInt: assignment.submissionDeadlineInt,
      totalMarks: assignment.marks ?? 0,
      obtainedMarks: submissionById.get(assignment.assignmentId)?.marksScored ?? 0,
      status: (() => {
        const submission = submissionById.get(assignment.assignmentId);
        if (!submission) return "Pending";
        return submission.marksScored !== null && submission.marksScored !== undefined
          ? "Completed"
          : "Incomplete";
      })(),
    }));

    return {
      items,
      nextCursor: items.length === pageSize ? pageParam + 1 : null,
    };
  }

  if (taskType === "quizzes") {
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("quizId, collegeSubjectId, totalMarks, quizTitle, endDate, status")
      .eq("facultyId", params.facultyId)
      .eq("collegeAcademicYearId", historyRow.collegeAcademicYearId)
      .eq("collegeSectionsId", historyRow.collegeSectionsId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .order("endDate", { ascending: false, nullsFirst: false })
      .range(from, to)
      .returns<QuizRow[]>();

    if (quizzesError) throw quizzesError;

    const quizIds = (quizzes ?? []).map((q) => q.quizId);
    let submissions: QuizSubmissionRow[] = [];
    if (quizIds.length > 0) {
      const { data, error } = await supabase
        .from("quiz_submissions")
        .select("quizId, totalMarksObtained, submittedAt, createdAt")
        .eq("studentId", studentRow.studentId)
        .in("quizId", quizIds)
        .eq("isActive", true)
        .is("deletedAt", null)
        .returns<QuizSubmissionRow[]>();
      if (error) throw error;
      submissions = data ?? [];
    }

    const bestQuizById = new Map<number, number>();
    for (const sub of submissions) {
      bestQuizById.set(
        sub.quizId,
        Math.max(bestQuizById.get(sub.quizId) ?? 0, sub.totalMarksObtained ?? 0),
      );
    }
    const submissionById = new Map(submissions.map((s) => [s.quizId, s]));

    const items: QuizListItem[] = (quizzes ?? []).map((quiz) => ({
      id: quiz.quizId,
      subject: subjectNameById.get(quiz.collegeSubjectId) ?? "Unknown",
      task: quiz.quizTitle,
      dueDate: formatIsoDate(quiz.endDate),
      dueDateSortKey: quiz.endDate ?? "",
      totalMarks: quiz.totalMarks ?? 0,
      obtainedMarks: bestQuizById.get(quiz.quizId) ?? 0,
      status: (() => {
        const submission = submissionById.get(quiz.quizId);
        if (!submission) return "Not Attempted";
        return submission.totalMarksObtained !== null && submission.totalMarksObtained !== undefined
          ? "Evaluated"
          : "Attempted";
      })(),
    }));

    return {
      items,
      nextCursor: items.length === pageSize ? pageParam + 1 : null,
    };
  }

  if (taskType === "discussions") {
    const { data: discussions, error: discussionsError } = await supabase
      .from("discussion_forum")
      .select("discussionId, title, deadline, createdAt, createdBy")
      .eq("createdBy", params.facultyId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .order("deadline", { ascending: false, nullsFirst: false })
      .range(from, to)
      .returns<DiscussionForumRow[]>();

    if (discussionsError) throw discussionsError;

    const discussionIds = (discussions ?? []).map((d) => d.discussionId);
    let sections: DiscussionSectionRow[] = [];
    let uploads: DiscussionUploadRow[] = [];
    if (discussionIds.length > 0) {
      const [secRes, upRes] = await Promise.all([
        supabase
          .from("discussion_forum_sections")
          .select("discussionId, collegeSectionsId, marks")
          .in("discussionId", discussionIds)
          .eq("collegeSectionsId", historyRow.collegeSectionsId)
          .eq("is_deleted", false)
          .is("deletedAt", null)
          .returns<DiscussionSectionRow[]>(),
        supabase
          .from("student_discussion_uploads")
          .select("discussionId, marksObtained, submittedAt, createdAt")
          .eq("studentId", studentRow.studentId)
          .in("discussionId", discussionIds)
          .eq("isActive", true)
          .eq("is_deleted", false)
          .returns<DiscussionUploadRow[]>(),
      ]);
      if (secRes.error) throw secRes.error;
      if (upRes.error) throw upRes.error;
      sections = secRes.data ?? [];
      uploads = upRes.data ?? [];
    }

    const sectionById = new Map(sections.map((s) => [s.discussionId, s]));
    const uploadById = new Map(uploads.map((u) => [u.discussionId, u]));
    const discussionSubjectLabel = subjectNameById.size > 1 ? "Multiple Subjects" : Array.from(subjectNameById.values())[0] ?? "Unknown";

    const validDiscussions = (discussions ?? []).filter((d) => sectionById.has(d.discussionId));
    
    const items: DiscussionListItem[] = validDiscussions.map((discussion) => {
      const section = sectionById.get(discussion.discussionId);
      const upload = uploadById.get(discussion.discussionId);
      return {
        id: discussion.discussionId,
        subject: discussionSubjectLabel,
        task: discussion.title,
        dueDate: formatIsoDate(discussion.deadline),
        dueDateSortKey: discussion.deadline ?? discussion.createdAt ?? "",
        totalMarks: section?.marks ?? 0,
        obtainedMarks: upload?.marksObtained ?? 0,
        status: (() => {
          if (!upload) return "Not Submitted";
          return upload.marksObtained !== null && upload.marksObtained !== undefined
            ? "Evaluated"
            : "Submitted";
        })(),
      };
    });

    return {
      items,
      nextCursor: (discussions ?? []).length === pageSize ? pageParam + 1 : null,
    };
  }

  return { items: [], nextCursor: null };
}
