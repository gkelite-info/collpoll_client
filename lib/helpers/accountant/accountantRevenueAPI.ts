import { supabase } from "@/lib/supabaseClient";

const QUERY_CHUNK_SIZE = 200;
const emptyStudentFeeMetrics = {
  totalRevenue: 0,
  transactionCount: 0,
  monthlyRevenue: Array<number>(12).fill(0),
  recentTransactions: [] as AccountantRevenueTransaction[],
};

export type AccountantRevenueTransaction = {
  id: number;
  amount: number;
  date: string;
};

const chunk = <T,>(values: T[], size = QUERY_CHUNK_SIZE) => {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
};

export function formatAccountantRevenue(value: number) {
  const amount = Math.max(Number(value) || 0, 0);

  if (amount >= 10_000_000) {
    return `Rs ${(amount / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }

  if (amount >= 100_000) {
    return `Rs ${(amount / 100_000).toFixed(2).replace(/\.00$/, "")} L`;
  }

  return `Rs ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export type AccountantEducationOption = {
  collegeEducationId: number;
  collegeEducationType: string;
};

export async function fetchAccountantEducationOptions(
  accountantId: number | null | undefined,
  collegeId: number | null | undefined,
): Promise<AccountantEducationOption[]> {
  if (!accountantId || !collegeId) return [];

  const [accountantResult, assignmentsResult] = await Promise.all([
    supabase
      .from("accountants")
      .select("collegeEducationId")
      .eq("accountantId", accountantId)
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .maybeSingle(),
    supabase
      .from("accountant_education_types")
      .select("collegeEducationId")
      .eq("accountantId", accountantId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null),
  ]);

  if (accountantResult.error) throw accountantResult.error;
  if (assignmentsResult.error) throw assignmentsResult.error;
  if (!accountantResult.data) return [];

  const assignedEducationIds = Array.from(
    new Set(
      [
        ...(assignmentsResult.data ?? []).map((row) => row.collegeEducationId),
        accountantResult.data.collegeEducationId,
      ]
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );

  if (assignedEducationIds.length === 0) return [];

  const { data, error } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .in("collegeEducationId", assignedEducationIds)
    .order("collegeEducationType", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((education) => ({
    collegeEducationId: Number(education.collegeEducationId),
    collegeEducationType: education.collegeEducationType,
  }));
}

/**
 * Returns successful student-fee revenue for the accountant's college and
 * assigned education types. Ledger rows are used as the source of truth so a
 * payment allocated across multiple semesters is counted only once.
 */
export async function fetchAccountantStudentFeeMetrics(
  accountantId: number | null | undefined,
  collegeId: number | null | undefined,
  collegeEducationId?: number | null,
) {
  if (!accountantId || !collegeId) return emptyStudentFeeMetrics;

  const educationOptions = await fetchAccountantEducationOptions(
    accountantId,
    collegeId,
  );
  const assignedEducationIds = educationOptions.map(
    (education) => education.collegeEducationId,
  );
  const validEducationIds = collegeEducationId
    ? assignedEducationIds.filter((id) => id === collegeEducationId)
    : assignedEducationIds;

  if (validEducationIds.length === 0) return emptyStudentFeeMetrics;

  const { data: obligations, error: obligationsError } = await supabase
    .from("student_fee_obligation")
    .select(`
      studentFeeObligationId,
      students!inner (
        collegeId,
        isActive,
        deletedAt
      )
    `)
    .eq("students.collegeId", collegeId)
    .eq("students.isActive", true)
    .is("students.deletedAt", null)
    .eq("isActive", true)
    .is("deletedAt", null)
    .in("collegeEducationId", validEducationIds);

  if (obligationsError) throw obligationsError;

  const obligationIds = (obligations ?? [])
    .map((row) => Number(row.studentFeeObligationId))
    .filter(Boolean);

  if (obligationIds.length === 0) return emptyStudentFeeMetrics;

  const successfulTransactionIds: number[] = [];

  for (const obligationIdChunk of chunk(obligationIds)) {
    const { data: transactions, error: transactionsError } = await supabase
      .from("student_payment_transaction")
      .select("studentPaymentTransactionId")
      .eq("paymentStatus", "success")
      .in("studentFeeObligationId", obligationIdChunk);

    if (transactionsError) throw transactionsError;

    successfulTransactionIds.push(
      ...(transactions ?? [])
        .map((row) => Number(row.studentPaymentTransactionId))
        .filter(Boolean),
    );
  }

  if (successfulTransactionIds.length === 0) return emptyStudentFeeMetrics;

  let totalRevenue = 0;
  let transactionCount = 0;
  const monthlyRevenue = Array<number>(12).fill(0);
  const transactionTotals = new Map<
    number,
    { amount: number; date: string }
  >();
  const currentYear = new Date().getFullYear();

  for (const transactionIdChunk of chunk(successfulTransactionIds)) {
    const { data: ledgerRows, error: ledgerError } = await supabase
      .from("student_fee_ledger")
      .select("studentPaymentTransactionId, amount, createdAt")
      .in("studentPaymentTransactionId", transactionIdChunk);

    if (ledgerError) throw ledgerError;

    (ledgerRows ?? []).forEach((row) => {
      const amount = Number(row.amount) || 0;
      const createdAt = new Date(row.createdAt);
      const transactionId = Number(row.studentPaymentTransactionId);
      const currentTransaction = transactionTotals.get(transactionId);

      totalRevenue += amount;
      if (!Number.isNaN(createdAt.getTime()) && createdAt.getFullYear() === currentYear) {
        monthlyRevenue[createdAt.getMonth()] += amount;
      }
      if (transactionId) {
        transactionTotals.set(transactionId, {
          amount: (currentTransaction?.amount ?? 0) + amount,
          date:
            !currentTransaction || row.createdAt > currentTransaction.date
              ? row.createdAt
              : currentTransaction.date,
        });
      }
    });
    transactionCount += ledgerRows?.length ?? 0;
  }

  const recentTransactions = Array.from(transactionTotals.entries())
    .map(([id, transaction]) => ({ id, ...transaction }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  return { totalRevenue, transactionCount, monthlyRevenue, recentTransactions };
}

export async function fetchAccountantStudentFeeRevenue(
  accountantId: number | null | undefined,
  collegeId: number | null | undefined,
  collegeEducationId?: number | null,
) {
  const metrics = await fetchAccountantStudentFeeMetrics(
    accountantId,
    collegeId,
    collegeEducationId,
  );

  return metrics.totalRevenue;
}
