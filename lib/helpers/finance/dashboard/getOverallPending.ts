import { supabase } from "@/lib/supabaseClient";

export async function getOverallPending(filters: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId?: number;
  selectedYear?: string;
}) {
  const {
    collegeEducationId,
    collegeBranchId,
    selectedYear,
  } = filters;

  console.log("🔎 Pending Filters:", filters);

  let obligationQuery = supabase
    .from("student_fee_obligation")
    .select(`
      studentFeeObligationId,
      totalAmount
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

  console.log("📊 Obligations:", obligations);

  if (!obligations?.length) return 0;

  const obligationIds = obligations.map(
    (o) => o.studentFeeObligationId
  );

  let ledgerQuery = supabase
    .from("student_fee_ledger")
    .select(`
      studentFeeObligationId,
      amount,
      createdAt
    `)
    .in("studentFeeObligationId", obligationIds);

  if (selectedYear) {
    const start = new Date(`${selectedYear}-01-01T00:00:00Z`);
    const end = new Date(`${selectedYear}-12-31T23:59:59Z`);

    ledgerQuery = ledgerQuery
      .gte("createdAt", start.toISOString())
      .lte("createdAt", end.toISOString());
  }

  const { data: ledgers } = await ledgerQuery;

  console.log("📘 Ledgers:", ledgers);

  const paidMap: Record<number, number> = {};

  obligations.forEach((o) => {
    paidMap[o.studentFeeObligationId] = 0;
  });

  ledgers?.forEach((l) => {
    paidMap[l.studentFeeObligationId] += Number(l.amount);
  });

  let totalPending = 0;

  obligations.forEach((o) => {
    const paid = paidMap[o.studentFeeObligationId] || 0;
    const pending = Number(o.totalAmount) - paid;

    if (pending > 0) {
      totalPending += pending;
    }
  });

  console.log("💰 Final Pending:", totalPending);

  return totalPending;
}