import { supabase } from "../../../supabaseClient";

type BranchFinanceFilters = {
  collegeId: number;
  collegeEducationId: number;
  collegeAcademicYearId?: number;
  collegeSessionId?: number;
};

type Obligation = {
  studentFeeObligationId: number;
  collegeBranchId: number;
  totalAmount: string;
};

type Branch = {
  collegeBranchId: number;
  collegeBranchCode: string;
};

export default async function getBranchWiseFinanceSummary(
  filters: BranchFinanceFilters,
  page: number,
  limit: number
) {
  const {
    collegeId,
    collegeEducationId,
    collegeAcademicYearId,
    collegeSessionId,
  } = filters;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* --------------------------------------------------
     1️⃣ Fetch Branches (Paginated)
  --------------------------------------------------- */

  const {
    data: branches,
    count: totalCount,
  } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchCode", {
      count: "exact",
    })
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .range(from, to);

  if (!branches?.length) {
    return {
      data: [],
      totalCount: 0,
    };
  }

  /* --------------------------------------------------
     2️⃣ Fetch Obligations (Same logic untouched)
  --------------------------------------------------- */

  let obligationQuery = supabase
    .from("student_fee_obligation")
    .select(
      "studentFeeObligationId, collegeBranchId, totalAmount"
    )
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (collegeAcademicYearId) {
    obligationQuery = obligationQuery.eq(
      "collegeAcademicYearId",
      collegeAcademicYearId
    );
  }

  if (collegeSessionId) {
    obligationQuery = obligationQuery.eq(
      "collegeSessionId",
      collegeSessionId
    );
  }

  const { data: obligations } = await obligationQuery;

  const obligationIds =
    (obligations as Obligation[])?.map(
      (o) => o.studentFeeObligationId
    ) || [];

  /* --------------------------------------------------
     3️⃣ Transactions (unchanged)
  --------------------------------------------------- */

  const { data: transactions } = await supabase
    .from("student_payment_transaction")
    .select(
      "studentPaymentTransactionId, studentFeeObligationId"
    )
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  const transactionIds =
    transactions?.map(
      (t) => t.studentPaymentTransactionId
    ) || [];

  /* --------------------------------------------------
     4️⃣ Ledger (unchanged)
  --------------------------------------------------- */

  const ledgerMap = new Map<number, number>();

  if (transactionIds.length > 0) {
    const { data: ledgers } = await supabase
      .from("student_fee_ledger")
      .select(
        "studentFeeObligationId, amount"
      )
      .in("studentPaymentTransactionId", transactionIds);

    ledgers?.forEach((l: any) => {
      const existing =
        ledgerMap.get(l.studentFeeObligationId) || 0;

      ledgerMap.set(
        l.studentFeeObligationId,
        existing + Number(l.amount)
      );
    });
  }

  /* --------------------------------------------------
     5️⃣ Aggregation (unchanged)
  --------------------------------------------------- */

  const branchMap = new Map<
    number,
    { expected: number; collected: number }
  >();

  (obligations as Obligation[])?.forEach(
    (o) => {
      const expected = Number(o.totalAmount) || 0;
      const collected =
        ledgerMap.get(o.studentFeeObligationId) || 0;

      if (!branchMap.has(o.collegeBranchId)) {
        branchMap.set(o.collegeBranchId, {
          expected: 0,
          collected: 0,
        });
      }

      const branchEntry =
        branchMap.get(o.collegeBranchId)!;

      branchEntry.expected += expected;
      branchEntry.collected += collected;
    }
  );

  /* --------------------------------------------------
     6️⃣ Final Result
  --------------------------------------------------- */

  const result = (branches as Branch[]).map(
    (branch) => {
      const data = branchMap.get(
        branch.collegeBranchId
      );

      const expected = data?.expected || 0;
      const collected = data?.collected || 0;
      const pending = expected - collected;

      const collectionPercentage =
        expected === 0
          ? 0
          : Number(
            (
              (collected / expected) *
              100
            ).toFixed(2)
          );

      return {
        branchId: branch.collegeBranchId,
        branchCode: branch.collegeBranchCode,
        expected,
        collected,
        pending,
        collectionPercentage,
      };
    }
  );

  let totalExpected = 0;
  let totalCollected = 0;

  branchMap.forEach((value) => {
    totalExpected += value.expected;
    totalCollected += value.collected;
  });

  const totalPending = totalExpected - totalCollected;

  const overallPercentage =
    totalExpected === 0
      ? 0
      : Number(((totalCollected / totalExpected) * 100).toFixed(2));

  return {
    data: result, // paginated branches
    totalCount: totalCount ?? 0,
    summary: {
      totalExpected,
      totalCollected,
      totalPending,
      overallPercentage,
    },
  };
}