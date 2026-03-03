import { supabase } from "@/lib/supabaseClient";

export async function getOverallFinanceTotal(
  collegeId: number,
  collegeEducationId: number
) {
  console.log("💰 Overall Finance Ledger Scoped Query:", {
    collegeId,
    collegeEducationId,
  });

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

    // 🔐 STRICT SCOPE AT STUDENT LEVEL
    .eq("student_payment_transaction.student_fee_obligation.students.collegeId", collegeId)
    .eq("student_payment_transaction.student_fee_obligation.students.collegeEducationId", collegeEducationId)

    // Only successful transactions
    .eq("student_payment_transaction.paymentStatus", "success")

    // Safety filters
    .eq("student_payment_transaction.student_fee_obligation.students.status", "Active")
    .eq("student_payment_transaction.student_fee_obligation.students.isActive", true)
    .is("student_payment_transaction.student_fee_obligation.students.deletedAt", null)

    .eq("student_payment_transaction.student_fee_obligation.isActive", true)
    .is("student_payment_transaction.student_fee_obligation.deletedAt", null);

  if (error) {
    console.error("❌ Overall Finance Error:", error);
    throw error;
  }

  const total = (data ?? []).reduce(
    (sum: number, row: any) => sum + Number(row.amount ?? 0),
    0
  );

  console.log("✅ Overall Finance Total:", total);

  return total;
}