import { supabase } from "@/lib/supabaseClient";

export type AssignmentSubmissionFilter =
  | "All"
  | "Evaluated"
  | "Pending"
  | "Not Submitted";

export async function fetchAssignmentTableData(
  assignmentId: string,
  page: number = 1,
  limit: number = 10,
  filter: AssignmentSubmissionFilter = "All",
  submissionDate?: string,
) {
  const { data: assign, error: assignErr } = await supabase
    .from("assignments")
    .select("collegeBranchId, marks")
    .eq("assignmentId", assignmentId)
    .single();

  if (assignErr) throw assignErr;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let matchingSubmissionStudentIds: number[] = [];

  if (filter !== "All" || submissionDate) {
    let submissionQuery = supabase
      .from("student_assignments_submission")
      .select("studentId")
      .eq("assignmentId", assignmentId);

    if (submissionDate) {
      submissionQuery = submissionQuery.eq("submittedOn", submissionDate);
    }

    if (filter === "Evaluated") {
      submissionQuery = submissionQuery.eq("status", "Evaluated");
    } else if (filter === "Pending") {
      submissionQuery = submissionQuery.or(
        "status.neq.Evaluated,status.is.null",
      );
    }

    const { data: matchingSubmissions, error: matchingSubmissionError } =
      await submissionQuery;

    if (matchingSubmissionError) throw matchingSubmissionError;

    matchingSubmissionStudentIds = Array.from(
      new Set((matchingSubmissions || []).map((submission) => submission.studentId)),
    );

    if (
      (filter !== "Not Submitted" || submissionDate) &&
      filter !== "Not Submitted" &&
      matchingSubmissionStudentIds.length === 0
    ) {
      return { students: [], submissions: [], totalCount: 0 };
    }
  }

  let studentsQuery = supabase
    .from("students")
    .select(
      `studentId, student_pins ( pinNumber ), users (fullName, email, userId, user_profile ( profileUrl, is_deleted ))`,
      { count: "exact" },
    )
    .eq("collegeBranchId", assign.collegeBranchId)
    .eq("isActive", true);

  if (filter === "Not Submitted" && matchingSubmissionStudentIds.length > 0) {
    studentsQuery = studentsQuery.not(
      "studentId",
      "in",
      `(${matchingSubmissionStudentIds.join(",")})`,
    );
  } else if (filter !== "All" || submissionDate) {
    studentsQuery = studentsQuery.in("studentId", matchingSubmissionStudentIds);
  }

  const {
    data: students,
    count: totalCount,
    error: studentError,
  } = await studentsQuery
    .order("studentId", { ascending: true })
    .range(from, to);

  if (studentError) throw studentError;

  const studentIds = students?.map(s => s.studentId) || [];

  const { data: submissions, error: submissionError } = await supabase
    .from("student_assignments_submission")
    .select("*")
    .eq("assignmentId", assignmentId)
    .in("studentId", studentIds.length > 0 ? studentIds : [0]);

  if (submissionError) throw submissionError;

  return { students, submissions, totalCount: totalCount || 0 };
}
