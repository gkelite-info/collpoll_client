import { supabase } from "@/lib/supabaseClient";
import { getStudentDashboardData as getStudentDash } from "@/lib/helpers/student/attendance/studentAttendanceActions";
import { getStudentDashboardData as getSubjectWise } from "@/lib/helpers/student/attendance/subjectWiseStats";
import { getStudentAttendanceDetails as getDetails } from "@/lib/helpers/student/attendance/getStudentAttendanceDetails";
import { fetchParentContext } from "@/app/utils/context/parent/parentContextAPI";

export async function getParentDashboardData(
  userId: number,
  dateStr: string,
  page: number,
  limit: number,
) {
  const parent = await fetchParentContext(userId);
  if (!parent || !parent.studentId)
    throw new Error("Parent or student ID not found");

  const { data: student } = await supabase
    .from("students")
    .select("userId")
    .eq("studentId", parent.studentId)
    .single();

  if (!student || !student.userId) throw new Error("Student User ID not found");

  return getStudentDash(student.userId, dateStr, page, limit, false);
}

export async function getParentSubjectWiseStats(
  userId: number,
  dateStr: string,
  page: number,
  limit: number,
) {
  const parent = await fetchParentContext(userId);
  if (!parent || !parent.studentId)
    throw new Error("Parent or student ID not found");

  const { data: student } = await supabase
    .from("students")
    .select("userId")
    .eq("studentId", parent.studentId)
    .single();

  if (!student || !student.userId) throw new Error("Student User ID not found");

  return getSubjectWise(student.userId, dateStr, page, limit);
}

export async function getParentAttendanceDetails(params: {
  userId: number;
  subjectId?: number;
  statusFilter?: "ALL" | "ATTENDED" | "ABSENT" | "LEAVE";
  page?: number;
  limit?: number;
}) {
  const parent = await fetchParentContext(params.userId);
  if (!parent || !parent.studentId)
    throw new Error("Parent or student ID not found");

  const { data: student } = await supabase
    .from("students")
    .select("userId")
    .eq("studentId", parent.studentId)
    .single();

  if (!student || !student.userId) throw new Error("Student User ID not found");

  return getDetails({
    ...params,
    userId: student.userId,
  });
}
