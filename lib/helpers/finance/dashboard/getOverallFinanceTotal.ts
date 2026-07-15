import { supabase } from "@/lib/supabaseClient";

export async function getOverallFinanceTotal(
  collegeId: number,
  collegeEducationId: number
) {
  const [studentFeeResult, collegeRevenueResult] = await Promise.all([
    supabase
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
      .is("student_payment_transaction.student_fee_obligation.deletedAt", null),
    supabase
      .from("college_revenue_records")
      .select("amount")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null),
  ]);

  if (studentFeeResult.error) throw studentFeeResult.error;
  if (collegeRevenueResult.error) throw collegeRevenueResult.error;

  const studentFeeTotal = (studentFeeResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0
  );
  const collegeRevenueTotal = (collegeRevenueResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0,
  );

  return studentFeeTotal + collegeRevenueTotal;
}
