import { supabase } from "@/lib/supabaseClient";

export type StudentFeeCollectionRow = {
  studentFeeCollectionId: number;
  studentPaymentTransactionId: number;
  studentFeeObligationId: number;
  collegeSemesterId: number;
  collectedAmount: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchStudentFeeCollections(
  studentFeeObligationId: number,
) {
  const { data, error } = await supabase
    .from("student_fee_collection")
    .select(
      `
      studentFeeCollectionId,
      studentPaymentTransactionId,
      studentFeeObligationId,
      collegeSemesterId,
      collectedAmount,
      createdAt,
      updatedAt
    `,
    )
    .eq("studentFeeObligationId", studentFeeObligationId)
    .order("studentFeeCollectionId", { ascending: true });

  if (error) {
    console.error("fetchStudentFeeCollections error:", error);
    throw error;
  }

  return data ?? [];
}

export async function fetchSemesterFeeCollections(collegeSemesterId: number) {
  const { data, error } = await supabase
    .from("student_fee_collection")
    .select(
      `
      studentFeeCollectionId,
      studentFeeObligationId,
      collectedAmount,
      createdAt
    `,
    )
    .eq("collegeSemesterId", collegeSemesterId);

  if (error) {
    console.error("fetchSemesterFeeCollections error:", error);
    throw error;
  }

  return data ?? [];
}

export async function createStudentFeeCollection(payload: {
  studentPaymentTransactionId: number;
  studentFeeObligationId: number;
  collegeSemesterId: number;
  collectedAmount: number;
}) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("student_fee_collection")
    .insert({
      studentPaymentTransactionId: payload.studentPaymentTransactionId,
      studentFeeObligationId: payload.studentFeeObligationId,
      collegeSemesterId: payload.collegeSemesterId,
      collectedAmount: payload.collectedAmount,
      updatedAt: now,
      createdAt: now,
    })
    .select("studentFeeCollectionId")
    .single();

  if (error) {
    console.error("createStudentFeeCollection error:", error);
    return { success: false, error };
  }

  return {
    success: true,
    studentFeeCollectionId: data.studentFeeCollectionId,
  };
}

export async function fetchTotalCollectedAmount(
  studentFeeObligationId: number,
) {
  const { data, error } = await supabase
    .from("student_fee_collection")
    .select("collectedAmount")
    .eq("studentFeeObligationId", studentFeeObligationId);

  if (error) {
    console.error("fetchTotalCollectedAmount error:", error);
    throw error;
  }

  const total =
    data?.reduce((sum, row) => sum + Number(row.collectedAmount), 0) ?? 0;

  return total;
}
