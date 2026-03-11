import { supabase } from "@/lib/supabaseClient";

export async function getOverallStudentsSummary(
  collegeId: number,
  collegeEducationId: number
) { 
  const { data, error } = await supabase
    .from("student_fee_obligation")
    .select(
      `
      studentFeeObligationId,
      studentId,
      totalAmount,
      collegeEducationId,
      students!inner (
        studentId,
        collegeId,
        collegeEducationId,
        isActive,
        deletedAt
      ),
      student_fee_ledger (
        amount
      )
    `
    )

    // 🔐 STRICT SCOPE
    .eq("students.collegeId", collegeId)
    .eq("students.collegeEducationId", collegeEducationId)
    .eq("collegeEducationId", collegeEducationId)

    // safety filters
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("students.isActive", true)
    .is("students.deletedAt", null);

  if (error) {
    console.error("❌ Cards Summary Error:", error);
    throw error;
  }

  let total = 0;
  let paid = 0;
  let partial = 0;
  let pending = 0;

  for (const row of data ?? []) {
    total++;

    const totalAmount = Number(row.totalAmount ?? 0);

    const paidAmount = (row.student_fee_ledger ?? []).reduce(
      (sum: number, l: any) => sum + Number(l.amount ?? 0),
      0
    );

    if (paidAmount >= totalAmount && totalAmount > 0) {
      paid++;
    } else if (paidAmount > 0) {
      partial++;
    } else {
      pending++;
    }
  }

  return {
    total,
    paid,
    partial,
    pending,
  };
}