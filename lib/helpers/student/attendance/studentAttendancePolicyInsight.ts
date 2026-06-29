import {
  buildAttendancePolicyMessage,
  type AttendancePolicyMessageResult,
} from "@/lib/helpers/attendance/attendancePolicyMessage";
import { supabase } from "@/lib/supabaseClient";

type StudentAttendanceContext = {
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
};

type StudentAttendancePolicyInsightInput = {
  userId: number;
  context: StudentAttendanceContext;
  attendedClasses: number;
  totalClasses: number;
};

export type StudentAttendancePolicyInsight = AttendancePolicyMessageResult;

async function fetchStudentName(userId: number) {
  const { data } = await supabase
    .from("users")
    .select("fullName")
    .eq("userId", userId)
    .maybeSingle();

  return data?.fullName || "Student";
}

async function fetchMinAttendance(context: StudentAttendanceContext) {
  if (!context.collegeSemesterId) return null;

  let query = supabase
    .from("college_attendance_policies")
    .select("minAttendance")
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (context.collegeEducationId !== null && context.collegeEducationId !== undefined && String(context.collegeEducationId) !== "null") {
    query = query.eq("collegeEducationId", context.collegeEducationId);
  } else {
    query = query.is("collegeEducationId", null);
  }

  if (context.collegeBranchId !== null && context.collegeBranchId !== undefined && String(context.collegeBranchId) !== "null") {
    query = query.eq("collegeBranchId", context.collegeBranchId);
  } else {
    query = query.is("collegeBranchId", null);
  }

  if (context.collegeAcademicYearId !== null && context.collegeAcademicYearId !== undefined && String(context.collegeAcademicYearId) !== "null") {
    query = query.eq("collegeAcademicYearId", context.collegeAcademicYearId);
  } else {
    query = query.is("collegeAcademicYearId", null);
  }

  if (context.collegeSemesterId !== null && context.collegeSemesterId !== undefined && String(context.collegeSemesterId) !== "null") {
    query = query.eq("collegeSemesterId", context.collegeSemesterId);
  } else {
    query = query.is("collegeSemesterId", null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Student attendance policy fetch error:", error);
    return null;
  }

  return data?.minAttendance ?? null;
}

export async function buildStudentAttendancePolicyInsight({
  userId,
  context,
  attendedClasses,
  totalClasses,
}: StudentAttendancePolicyInsightInput) {
  const [studentName, minAttendance] = await Promise.all([
    fetchStudentName(userId),
    fetchMinAttendance(context),
  ]);

  return buildAttendancePolicyMessage({
    studentName,
    attendedClasses,
    totalClasses,
    minAttendance,
    audience: "student",
  });
}
