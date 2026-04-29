import { supabase } from "@/lib/supabaseClient";

export type StudentStatus =
  | "Active"
  | "Promoted"
  | "Detained"
  | "Repeater"
  | "Graduated";

export type StudentEntryType = "Regular" | "Lateral" | "Transfer";

export async function createStudent(
  payload: {
    userId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeSessionId?: number | null;
    createdBy: number;
    entryType: "Regular" | "Lateral" | "Transfer";
    status?: "Active" | "Inactive";
    collegeId: number;
  },
  timestamp: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("students")
    .insert({
      ...payload,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .select("studentId")
    .single();

  if (error || !data) {
    throw new Error("Failed to create student");
  }

  return data.studentId;
}

export async function createStudentAcademicHistory(payload: {
  studentId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  collegeSectionsId: number;
  promotedBy: number;
  isCurrent?: boolean;
  createdAt: string;
  updatedAt: string;
}) {
  const { error } = await supabase.from("student_academic_history").insert({
    ...payload,
    isCurrent: payload.isCurrent ?? true,
  });

  if (error) {
    throw new Error("Failed to create student academic history");
  }
}

export async function createStudentFeeObligation(
  payload: {
    studentId: number;
    collegeSessionId: number | null;
    collegeAcademicYearId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    createdBy: number;
  },
  timestamp: string,
) {
  const { data: sessionData, error: sessionError } = await supabase
    .from("college_session")
    .select("totalFeeAmount")
    .eq("collegeSessionId", payload.collegeSessionId)
    .single();

  console.log("What is sessionData", sessionData);
  console.log("Is this here", sessionError);

  if (sessionError) {
    console.error("Failed to fetch session total fee amount", sessionError);
    throw new Error("Failed to fetch session total fee amount");
  }

  const totalAmount = sessionData?.totalFeeAmount || 0;

  const { error: obligationError } = await supabase
    .from("student_fee_obligation")
    .insert({
      studentId: payload.studentId,
      collegeSessionId: payload.collegeSessionId,
      collegeAcademicYearId: payload.collegeAcademicYearId,
      collegeEducationId: payload.collegeEducationId,
      collegeBranchId: payload.collegeBranchId,
      totalAmount: totalAmount,
      createdBy: payload.createdBy,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

  if (obligationError) {
    console.error("Failed to create student fee obligation", obligationError);
    throw new Error("Failed to create student fee obligation");
  }

  return { success: true };
}
