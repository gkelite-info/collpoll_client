import { supabase } from "@/lib/supabaseClient";

export type FinanceManagerDashboardCardStats = {
  totalRevenueCollected: number;
  totalPendingFees: number;
  totalStudents: number;
  activeFinanceExecutives: number;
};

const emptyStats: FinanceManagerDashboardCardStats = {
  totalRevenueCollected: 0,
  totalPendingFees: 0,
  totalStudents: 0,
  activeFinanceExecutives: 0,
};

const formatShortCurrency = (value: number) => {
  const amount = Math.max(Number(value) || 0, 0);

  if (amount >= 10000000) return `\u20B9${(amount / 10000000).toFixed(1)} CR`;
  if (amount >= 100000) return `\u20B9${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `\u20B9${(amount / 1000).toFixed(1)} K`;

  return `\u20B9${amount.toLocaleString("en-IN")}`;
};

export const formatFinanceManagerDashboardCards = (
  stats: FinanceManagerDashboardCardStats,
) => [
    {
      label: "Total Revenue Collected",
      value: formatShortCurrency(stats.totalRevenueCollected),
    },
    {
      label: "Total Pending Fees",
      value: formatShortCurrency(stats.totalPendingFees),
    },
    {
      label: "Total Students",
      value: stats.totalStudents.toLocaleString("en-IN"),
    },
    {
      label: "Active Finance Executives",
      value: stats.activeFinanceExecutives.toString().padStart(2, "0"),
    },
  ];

export async function fetchFinanceManagerDashboardCards(
  collegeId: number | null | undefined,
  collegeEducationId: number | null | undefined,
): Promise<FinanceManagerDashboardCardStats> {
  if (!collegeId || !collegeEducationId) return emptyStats;



  const [
    studentsResult,
    financeManagerEducationsResult,
    obligationsResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select(
        `
        studentId,
        users!inner (
          role,
          collegeId,
          isActive,
          is_deleted,
          deletedAt
        ),
        student_academic_history!inner ( isCurrent )
      `,
        { count: "exact", head: true },
      )
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("status", "Active")
      .eq("isActive", true)
      .is("deletedAt", null)
      .eq("users.role", "Student")
      .eq("users.collegeId", collegeId)
      .eq("users.isActive", true)
      .eq("users.is_deleted", false)
      .is("users.deletedAt", null)
      .eq("student_academic_history.isCurrent", true),

    supabase
      .from("finance_manager_education_types")
      .select(`
        FinanceManagerEducationId,
        finance_manager!inner(
          collegeId,
          type,
          isActive,
          is_deleted,
          deletedAt
        )
      `, { count: "exact", head: true })
      .eq("collegeEducationId", collegeEducationId)
      .eq("finance_manager.collegeId", collegeId)
      .eq("finance_manager.type", "executive")
      .eq("finance_manager.isActive", true)
      .eq("finance_manager.is_deleted", false)
      .is("finance_manager.deletedAt", null)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null),

    supabase
      .from("student_fee_obligation")
      .select(
        `
        studentFeeObligationId,
        studentId,
        totalAmount,
        students!inner (
          studentId,
          collegeId,
          status,
          isActive,
          deletedAt
        )
      `,
      )
      .eq("students.collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("students.status", "Active")
      .eq("students.isActive", true)
      .is("students.deletedAt", null)
      .eq("isActive", true)
      .is("deletedAt", null),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (financeManagerEducationsResult.error) throw financeManagerEducationsResult.error;
  if (obligationsResult.error) throw obligationsResult.error;

  const obligations = obligationsResult.data ?? [];
  const obligationIds = obligations
    .map((obligation) => Number(obligation.studentFeeObligationId))
    .filter(Boolean);

  let totalRevenueCollected = 0;

  if (obligationIds.length > 0) {
    const { data: transactions, error: transactionError } = await supabase
      .from("student_payment_transaction")
      .select("studentPaymentTransactionId")
      .in("studentFeeObligationId", obligationIds)
      .eq("paymentStatus", "success");

    if (transactionError) throw transactionError;

    const transactionIds = (transactions ?? [])
      .map((transaction) => Number(transaction.studentPaymentTransactionId))
      .filter(Boolean);

    if (transactionIds.length > 0) {
      const { data: ledgers, error: ledgerError } = await supabase
        .from("student_fee_ledger")
        .select("amount")
        .in("studentPaymentTransactionId", transactionIds);

      if (ledgerError) throw ledgerError;

      totalRevenueCollected = (ledgers ?? []).reduce(
        (sum, ledger) => sum + Number(ledger.amount ?? 0),
        0,
      );
    }
  }

  const totalObligationAmount = obligations.reduce(
    (sum, obligation) => sum + Number(obligation.totalAmount ?? 0),
    0,
  );

  return {
    totalRevenueCollected,
    totalPendingFees: Math.max(totalObligationAmount - totalRevenueCollected, 0),
    totalStudents: studentsResult.count ?? 0,
    activeFinanceExecutives: financeManagerEducationsResult.count ?? 0,
  };
}
