import { supabase } from "@/lib/supabaseClient";

type InsightFilters = {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId?: number;
  selectedYear?: string;
};

export async function getQuickInsights(filters: InsightFilters) {
  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    selectedYear,
  } = filters;

  let studentQuery = supabase
    .from("students")
    .select("studentId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null);

  if (collegeBranchId) {
    studentQuery = studentQuery.eq("collegeBranchId", collegeBranchId);
  }

  const { data: students } = await studentQuery;
  if (!students?.length) return emptyInsight();

  const studentIds = students.map((s) => s.studentId);

  const { data: obligations } = await supabase
    .from("student_fee_obligation")
    .select("studentFeeObligationId")
    .in("studentId", studentIds)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (!obligations?.length) return emptyInsight();

  const obligationIds = obligations.map(
    (o) => o.studentFeeObligationId
  );
  const { data: transactions } = await supabase
    .from("student_payment_transaction")
    .select("studentPaymentTransactionId")
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (!transactions?.length) return emptyInsight();

  const transactionIds = transactions.map(
    (t) => t.studentPaymentTransactionId
  );

  let ledgerQuery = supabase
    .from("student_fee_ledger")
    .select("amount, createdAt")
    .in("studentPaymentTransactionId", transactionIds);
  if (selectedYear) {
    const startOfSelectedYear = new Date(
      `${selectedYear}-01-01T00:00:00`
    );
    const endOfSelectedYear = new Date(
      `${selectedYear}-12-31T23:59:59`
    );

    ledgerQuery = ledgerQuery
      .gte("createdAt", startOfSelectedYear.toISOString())
      .lte("createdAt", endOfSelectedYear.toISOString());
  }

  const { data: ledgers } = await ledgerQuery;
  if (!ledgers?.length) return emptyInsight();
  const today = new Date();
  const baseYear = selectedYear
    ? Number(selectedYear)
    : today.getFullYear();

  const yearLedgers = ledgers.filter((entry: any) => {
    const created = new Date(entry.createdAt);
    return created.getFullYear() === baseYear;
  });

  if (!yearLedgers.length) return emptyInsight();

  const day = today.getDay();
  const diff = day === 0 ? 6 : day - 1;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setMilliseconds(-1);
  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  const startOfYear = new Date(baseYear, 0, 1);
  const endOfYear = new Date(
    baseYear,
    11,
    31,
    23,
    59,
    59,
    999
  );
  let thisWeek = 0;
  let lastWeek = 0;
  let thisMonth = 0;
  let thisYear = 0;

  yearLedgers.forEach((entry: any) => {
    const amount = Number(entry.amount) || 0;
    const created = new Date(entry.createdAt);

    if (created >= startOfWeek && created <= endOfWeek)
      thisWeek += amount;

    if (created >= startOfLastWeek && created <= endOfLastWeek)
      lastWeek += amount;

    if (created >= startOfMonth && created <= endOfMonth)
      thisMonth += amount;

    if (created >= startOfYear && created <= endOfYear)
      thisYear += amount;
  });

  return {
    thisWeek,
    lastWeek,
    thisMonth,
    thisYear,
  };
}

function emptyInsight() {
  return {
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  };
}