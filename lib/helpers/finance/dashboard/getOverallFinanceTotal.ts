import { supabase } from "@/lib/supabaseClient";

export async function getOverallFinanceTotal(
  collegeId: number,
  collegeEducationId: number
) {
  const { data, error } = await supabase
    .from("student_fee_ledger")
    .select(`
      amount,
      student_payment_transaction!inner (
        paymentStatus,
        student_fee_obligation!inner (
          studentFeeObligationId,
          collegeEducationId,
          students!inner (
            studentId,
            collegeId,
            collegeEducationId,
            status,
            isActive,
            deletedAt
          )
        )
      )
    `)
    .eq("student_payment_transaction.student_fee_obligation.students.collegeId", collegeId)
    .eq("student_payment_transaction.student_fee_obligation.students.collegeEducationId", collegeEducationId)
    .eq("student_payment_transaction.paymentStatus", "success")
    .eq("student_payment_transaction.student_fee_obligation.students.status", "Active")
    .eq("student_payment_transaction.student_fee_obligation.students.isActive", true)
    .is("student_payment_transaction.student_fee_obligation.students.deletedAt", null)

    .eq("student_payment_transaction.student_fee_obligation.isActive", true)
    .is("student_payment_transaction.student_fee_obligation.deletedAt", null);

  if (error) {
    throw error;
  }

  const total = (data ?? []).reduce(
    (sum: number, row: any) => sum + Number(row.amount ?? 0),
    0
  );
  return total;
}