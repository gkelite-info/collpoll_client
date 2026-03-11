import { supabase } from "@/lib/supabaseClient";

type TodayCollectionFilters = {
  collegeId: number;
  collegeEducationId: number;
};

export async function getTodayCollectionSummary(
  filters: TodayCollectionFilters
) {
  const { collegeId, collegeEducationId } = filters;
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("studentId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null);

  if (studentError) {
    return { todayTotal: 0 };
  }

  if (!students?.length) {
    return { todayTotal: 0 };
  }

  const studentIds = students.map((s) => s.studentId);
  const { data: obligations, error: obligationError } = await supabase
    .from("student_fee_obligation")
    .select("studentFeeObligationId")
    .in("studentId", studentIds)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (obligationError) {
    return { todayTotal: 0 };
  }

  if (!obligations?.length) {
    return { todayTotal: 0 };
  }

  const obligationIds = obligations.map(
    (o) => o.studentFeeObligationId
  );

  const { data: transactions, error: transactionError } = await supabase
    .from("student_payment_transaction")
    .select("studentPaymentTransactionId")
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (transactionError) {
    return { todayTotal: 0 };
  }

  if (!transactions?.length) {
    return { todayTotal: 0 };
  }

  const transactionIds = transactions.map(
    (t) => t.studentPaymentTransactionId
  );
  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0, 0, 0
  ).toISOString();

  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23, 59, 59
  ).toISOString();
  const { data: ledgers, error: ledgerError } = await supabase
    .from("student_fee_ledger")
    .select("amount, createdAt")
    .in("studentPaymentTransactionId", transactionIds)
    .gte("createdAt", todayStart)
    .lte("createdAt", todayEnd);

  if (ledgerError) {
    return { todayTotal: 0 };
  }

  if (!ledgers?.length) {
    return { todayTotal: 0 };
  }

  const todayTotal = ledgers.reduce(
    (sum, l) => sum + (Number(l.amount) || 0),
    0
  );
  return { todayTotal };
}