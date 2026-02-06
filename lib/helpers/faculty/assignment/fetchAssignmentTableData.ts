import { supabase } from "@/lib/supabaseClient";

export async function fetchAssignmentTableData(assignmentId: string) {
  const { data: assign, error: assignErr } = await supabase
    .from("assignments")
    .select("collegeBranchId, marks")
    .eq("assignmentId", assignmentId)
    .single();

  if (assignErr) throw assignErr;

  console.log("Test log");

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select(`studentId, users (fullName, email, userId)`)
    .eq("collegeBranchId", assign.collegeBranchId)
    .eq("isActive", true);

  if (studentError) throw studentError;

  const { data: submissions, error: submissionError } = await supabase
    .from("student_assignments_submission")
    .select("*")
    .eq("assignmentId", assignmentId);

  if (submissionError) throw submissionError;

  return { students, submissions };
}
