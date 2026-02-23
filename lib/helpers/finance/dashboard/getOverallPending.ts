import { supabase } from "@/lib/supabaseClient";

export async function getOverallPending(filters: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId?: number;
  selectedYear?: string;
}) {
  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    selectedYear,
  } = filters;

  let obligationQuery = supabase
    .from("student_fee_obligation")
    .select(`
      studentFeeObligationId,
      totalAmount,
      collegeBranchId
    `)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (collegeBranchId) {
    obligationQuery = obligationQuery.eq(
      "collegeBranchId",
      collegeBranchId
    );
  }

  const { data: obligations } = await obligationQuery;

  if (!obligations?.length) return 0;

  const obligationIds = obligations.map(
    (o) => o.studentFeeObligationId
  );

  const { data: transactions } = await supabase
    .from("student_payment_transaction")
    .select(
      "studentPaymentTransactionId, studentFeeObligationId"
    )
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (!transactions?.length) {
    // No successful payments → full pending
    return obligations.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0
    );
  }

  const transactionIds = transactions.map(
    (t) => t.studentPaymentTransactionId
  );

  let ledgerQuery = supabase
    .from("student_fee_ledger")
    .select(
      "studentPaymentTransactionId, amount, createdAt"
    )
    .in("studentPaymentTransactionId", transactionIds);

  if (selectedYear) {
    const start = new Date(
      `${selectedYear}-01-01T00:00:00`
    ).toISOString();

    const end = new Date(
      `${selectedYear}-12-31T23:59:59`
    ).toISOString();

    ledgerQuery = ledgerQuery
      .gte("createdAt", start)
      .lte("createdAt", end);
  }

  const { data: ledgers } = await ledgerQuery;

  const paidMap: Record<number, number> = {};

  obligations.forEach((o) => {
    paidMap[o.studentFeeObligationId] = 0;
  });

  ledgers?.forEach((l: any) => {
    const txn = transactions.find(
      (t) =>
        t.studentPaymentTransactionId ===
        l.studentPaymentTransactionId
    );

    if (txn) {
      paidMap[txn.studentFeeObligationId] += Number(
        l.amount
      );
    }
  });

  let totalPending = 0;

  obligations.forEach((o) => {
    const paid =
      paidMap[o.studentFeeObligationId] || 0;

    if (paid === 0) {
      totalPending += Number(o.totalAmount);
    }
  });

  return totalPending;
}