import { supabase } from "@/lib/supabaseClient";

export type StudentPaymentTransactionRow = {
  studentPaymentTransactionId: number;
  studentFeeObligationId: number;
  gatewayTransactionId: string;
  gatewayOrderId: string;
  paidAmount: number;
  paymentMode: string;
  paymentStatus: string;
  initiatedBy: string;
  gatewayResponse: any | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchStudentPaymentTransactions(
  studentFeeObligationId: number,
) {
  const { data, error } = await supabase
    .from("student_payment_transaction")
    .select(
      `
      studentPaymentTransactionId,
      studentFeeObligationId,
      gatewayTransactionId,
      gatewayOrderId,
      paidAmount,
      paymentMode,
      paymentStatus,
      initiatedBy,
      gatewayResponse,
      createdAt,
      updatedAt
    `,
    )
    .eq("studentFeeObligationId", studentFeeObligationId)
    .order("studentPaymentTransactionId", { ascending: true });

  if (error) {
    console.error("fetchStudentPaymentTransactions error:", error);
    throw error;
  }

  return data ?? [];
}

export async function fetchPaymentTransactionByGatewayTxnId(
  gatewayTransactionId: string,
) {
  const { data, error } = await supabase
    .from("student_payment_transaction")
    .select(
      `
      studentPaymentTransactionId,
      studentFeeObligationId,
      paymentStatus,
      paidAmount
    `,
    )
    .eq("gatewayTransactionId", gatewayTransactionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

export async function createStudentPaymentTransaction(payload: {
  studentFeeObligationId: number;
  gatewayTransactionId: string;
  gatewayOrderId: string;
  paidAmount: number;
  paymentMode: string;
  initiatedBy?: string;
}) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("student_payment_transaction")
    .insert({
      studentFeeObligationId: payload.studentFeeObligationId,
      gatewayTransactionId: payload.gatewayTransactionId,
      gatewayOrderId: payload.gatewayOrderId,
      paidAmount: payload.paidAmount,
      paymentMode: payload.paymentMode,
      initiatedBy: payload.initiatedBy ?? "Student",
      updatedAt: now,
      createdAt: now,
    })
    .select("studentPaymentTransactionId")
    .single();

  if (error) {
    console.error("createStudentPaymentTransaction error:", error);
    return { success: false, error };
  }

  return {
    success: true,
    studentPaymentTransactionId: data.studentPaymentTransactionId,
  };
}

export async function updateStudentPaymentStatus(
  studentPaymentTransactionId: number,
  payload: {
    paymentStatus: string;
    gatewayResponse?: any;
  },
) {
  const { error } = await supabase
    .from("student_payment_transaction")
    .update({
      paymentStatus: payload.paymentStatus,
      gatewayResponse: payload.gatewayResponse ?? null,
      updatedAt: new Date().toISOString(),
    })
    .eq("studentPaymentTransactionId", studentPaymentTransactionId);

  if (error) {
    console.error("updateStudentPaymentStatus error:", error);
    return { success: false };
  }

  return { success: true };
}

export async function fetchSuccessfulPayments(studentFeeObligationId: number) {
  const { data, error } = await supabase
    .from("student_payment_transaction")
    .select(
      `
      studentPaymentTransactionId,
      paidAmount,
      paymentMode,
      createdAt
    `,
    )
    .eq("studentFeeObligationId", studentFeeObligationId)
    .eq("paymentStatus", "success");

  if (error) {
    console.error("fetchSuccessfulPayments error:", error);
    throw error;
  }

  return data ?? [];
}
