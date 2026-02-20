import { supabase } from "@/lib/supabaseClient";

type OverallFinanceFilters = {
  collegeId: number;
  collegeEducationId: number;
};

export async function getOverallFinanceTotal(
  filters: OverallFinanceFilters
) {
  const { collegeId, collegeEducationId } = filters;

  /* 1️⃣ Get Active Students */

  const { data: students } = await supabase
    .from("students")
    .select("studentId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null);

  if (!students?.length) return 0;

  const studentIds = students.map((s) => s.studentId);

  /* 2️⃣ Get Obligations */

  const { data: obligations } = await supabase
    .from("student_fee_obligation")
    .select("studentFeeObligationId")
    .in("studentId", studentIds)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (!obligations?.length) return 0;

  const obligationIds = obligations.map(
    (o) => o.studentFeeObligationId
  );

  /* 3️⃣ Get Success Transactions */

  const { data: transactions } = await supabase
    .from("student_payment_transaction")
    .select("studentPaymentTransactionId")
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (!transactions?.length) return 0;

  const transactionIds = transactions.map(
    (t) => t.studentPaymentTransactionId
  );

  /* 4️⃣ Sum All Collections */

  const { data: collections } = await supabase
    .from("student_fee_collection")
    .select("collectedAmount")
    .in("studentPaymentTransactionId", transactionIds);

  if (!collections?.length) return 0;

  const total = collections.reduce(
    (sum, c) => sum + Number(c.collectedAmount || 0),
    0
  );

  return total;
}