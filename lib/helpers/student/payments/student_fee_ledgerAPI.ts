import { supabase } from "@/lib/supabaseClient";

export type StudentFeeLedgerRow = {
    studentFeeLedgerId: number;
    studentFeeObligationId: number;
    studentPaymentTransactionId: number;
    amount: number;
    remarks: string | null;
    createdAt: string;
    updatedAt: string;
};


export async function fetchStudentFeeLedger(
    studentFeeObligationId: number,
) {
    const { data, error } = await supabase
        .from("student_fee_ledger")
        .select(`
      studentFeeLedgerId,
      studentFeeObligationId,
      studentPaymentTransactionId,
      amount,
      remarks,
      createdAt,
      updatedAt
    `)
        .eq("studentFeeObligationId", studentFeeObligationId)
        .order("studentFeeLedgerId", { ascending: true });

    if (error) {
        console.error("fetchStudentFeeLedger error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchLedgerByTransactionId(
    studentPaymentTransactionId: number,
) {
    const { data, error } = await supabase
        .from("student_fee_ledger")
        .select(`
      studentFeeLedgerId,
      amount,
      remarks
    `)
        .eq(
            "studentPaymentTransactionId",
            studentPaymentTransactionId,
        )
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }

    return data;
}


export async function createStudentFeeLedger(payload: {
    studentFeeObligationId: number;
    studentPaymentTransactionId: number;
    amount: number;
    remarks?: string;
}) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("student_fee_ledger")
        .insert({
            studentFeeObligationId:
                payload.studentFeeObligationId,
            studentPaymentTransactionId:
                payload.studentPaymentTransactionId,
            amount: payload.amount,
            remarks: payload.remarks ?? null,
            updatedAt: now,
        })
        .select("studentFeeLedgerId")
        .single();

    if (error) {
        console.error(
            "createStudentFeeLedger error:",
            error,
        );
        return { success: false, error };
    }

    return {
        success: true,
        studentFeeLedgerId: data.studentFeeLedgerId,
    };
}


export async function fetchLedgerTotalAmount(
    studentFeeObligationId: number,
) {
    const { data, error } = await supabase
        .from("student_fee_ledger")
        .select("amount")
        .eq("studentFeeObligationId", studentFeeObligationId);

    if (error) {
        console.error(
            "fetchLedgerTotalAmount error:",
            error,
        );
        throw error;
    }

    const total =
        data?.reduce(
            (sum, row) => sum + Number(row.amount),
            0,
        ) ?? 0;

    return total;
}