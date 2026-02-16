import { supabase } from "@/lib/supabaseClient";

export type StudentFeePaymentRow = {
    studentFeePaymentId: number;
    studentId: number;
    feeStructureId: number;
    academicYear: string;
    totalPayable: number;
    paidAmount: number;
    paymentMode: string;
    remarks: string | null;
    openingBalance: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export async function fetchStudentFeePayments(studentId: number) {
    const { data, error } = await supabase
        .from("student_fee_payment")
        .select(`
      studentFeePaymentId,
      studentId,
      feeStructureId,
      academicYear,
      totalPayable,
      paidAmount,
      paymentMode,
      remarks,
      openingBalance,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("studentId", studentId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchStudentFeePayments error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchStudentFeePaymentsWithDetails(studentId: number) {
    const { data, error } = await supabase
        .from("student_fee_payment")
        .select(`
      studentFeePaymentId,
      academicYear,
      totalPayable,
      paidAmount,
      paymentMode,
      remarks,
      openingBalance,
      student:students (
        studentId,
        fullName
      ),
      collegeFeeStructure:college_fee_structure (
        feeStructureId,
        feeTypeName
      )
    `)
        .eq("studentId", studentId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (error) {
        console.error("fetchStudentFeePaymentsWithDetails error:", error);
        throw error;
    }

    return data ?? [];
}

export async function saveStudentFeePayment(
    payload: {
        id?: number;
        studentId: number;
        feeStructureId: number;
        academicYear: string;
        totalPayable: number;
        paidAmount: number;
        paymentMode: string;
        remarks?: string;
    }
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("student_fee_payment")
        .upsert(
            {
                studentFeePaymentId: payload.id,
                studentId: payload.studentId,
                feeStructureId: payload.feeStructureId,
                academicYear: payload.academicYear,
                totalPayable: payload.totalPayable,
                paidAmount: payload.paidAmount,
                paymentMode: payload.paymentMode,
                remarks: payload.remarks ?? null,
                openingBalance: payload.totalPayable - payload.paidAmount,
                updatedAt: now,
                createdAt: now,
            },
            { onConflict: "studentFeePaymentId" }
        )
        .select("studentFeePaymentId")
        .single();

    if (error) {
        console.error("saveStudentFeePayment error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        studentFeePaymentId: data.studentFeePaymentId,
    };
}

export async function deactivateStudentFeePayment(
    studentFeePaymentId: number
) {
    const { error } = await supabase
        .from("student_fee_payment")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("studentFeePaymentId", studentFeePaymentId);

    if (error) {
        console.error("deactivateStudentFeePayment error:", error);
        return { success: false };
    }

    return { success: true };
}
