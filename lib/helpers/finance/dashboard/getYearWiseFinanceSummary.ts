import { supabase } from "@/lib/supabaseClient";

type YearFinanceFilters = {
  collegeId: number;
  collegeEducationId: number;
  branchCode: string;
};

export async function getYearWiseFinanceSummary(
  filters: YearFinanceFilters,
  page: number,
  limit: number,
  search: string = ""
) {
  try {
    const { collegeId, collegeEducationId, branchCode } = filters;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* =====================================================
       1️⃣ Resolve BranchId
    ====================================================== */

    const { data: branchData, error: branchError } = await supabase
      .from("college_branch")
      .select("collegeBranchId")
      .eq("collegeBranchCode", branchCode)
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .single();

    if (branchError || !branchData) {
      throw new Error("Branch not found");
    }

    const branchId = branchData.collegeBranchId;

    /* =====================================================
       2️⃣ Fetch Academic Years (Paginated + Search)
    ====================================================== */

    let yearQuery = supabase
      .from("college_academic_year")
      .select("collegeAcademicYearId, collegeAcademicYear", {
        count: "exact",
      })
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("collegeBranchId", branchId)
      .is("deletedAt", null);

    if (search.trim()) {
      yearQuery = yearQuery.ilike("collegeAcademicYear", `%${search.trim()}%`);
    }

    const {
      data: years,
      count: totalCount,
      error: yearError,
    } = await yearQuery.range(from, to);

    if (yearError) throw yearError;

    if (!years?.length) {
      return {
        data: [],
        totalCount: 0,
        summary: {
          totalExpected: 0,
          totalCollected: 0,
          totalPending: 0,
          overallPercentage: 0,
        },
      };
    }

    /* =====================================================
       3️⃣ Fetch ALL Obligations (Not Paginated)
    ====================================================== */

    const { data: obligations } = await supabase
      .from("student_fee_obligation")
      .select(
        "studentFeeObligationId, totalAmount, collegeAcademicYearId"
      )
      .eq("collegeEducationId", collegeEducationId)
      .eq("collegeBranchId", branchId)
      .eq("isActive", true)
      .is("deletedAt", null);

    const obligationIds =
      obligations?.map((o) => o.studentFeeObligationId) || [];

    /* =====================================================
       4️⃣ Successful Transactions
    ====================================================== */

    const { data: transactions } = await supabase
      .from("student_payment_transaction")
      .select("studentPaymentTransactionId, studentFeeObligationId")
      .in("studentFeeObligationId", obligationIds)
      .eq("paymentStatus", "success");

    const transactionIds =
      transactions?.map((t) => t.studentPaymentTransactionId) || [];

    /* =====================================================
       5️⃣ Ledger Map
    ====================================================== */

    const ledgerMap = new Map<number, number>();

    if (transactionIds.length > 0) {
      const { data: ledgers } = await supabase
        .from("student_fee_ledger")
        .select("studentFeeObligationId, amount")
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

    /* =====================================================
       6️⃣ Year Aggregation Map (ALL YEARS)
    ====================================================== */

    const yearMap = new Map<
      number,
      { expected: number; collected: number }
    >();

    obligations?.forEach((o) => {
      const expected = Number(o.totalAmount) || 0;
      const collected =
        ledgerMap.get(o.studentFeeObligationId) || 0;

      if (!yearMap.has(o.collegeAcademicYearId)) {
        yearMap.set(o.collegeAcademicYearId, {
          expected: 0,
          collected: 0,
        });
      }

      const entry = yearMap.get(o.collegeAcademicYearId)!;
      entry.expected += expected;
      entry.collected += collected;
    });

    /* =====================================================
       7️⃣ Paginated Year Result (Table)
    ====================================================== */

    const result = years.map((year) => {
      const data = yearMap.get(year.collegeAcademicYearId);

      const expected = data?.expected || 0;
      const collected = data?.collected || 0;
      // ✅ FIX: floor pending at 0 — never show negative
      const pending = Math.max(0, expected - collected);

      // ✅ FIX: cap collection % at 100 — overpayments shouldn't exceed 100%
      const collectionPercentage =
        expected === 0
          ? 0
          : Math.min(
              100,
              Number(((collected / expected) * 100).toFixed(2))
            );

      return {
        yearId: year.collegeAcademicYearId,
        year: year.collegeAcademicYear,
        expected,
        collected,
        pending,
        collectionPercentage,
      };
    });

    /* =====================================================
       8️⃣ Summary (ALL YEARS TOTAL)
    ====================================================== */

    let totalExpected = 0;
    let totalCollected = 0;

    yearMap.forEach((value) => {
      totalExpected += value.expected;
      totalCollected += value.collected;
    });

    // ✅ FIX: floor total pending at 0
    const totalPending = Math.max(0, totalExpected - totalCollected);

    // ✅ FIX: cap overall percentage at 100
    const overallPercentage =
      totalExpected === 0
        ? 0
        : Math.min(
            100,
            Number(((totalCollected / totalExpected) * 100).toFixed(2))
          );

    return {
      data: result,
      totalCount: totalCount ?? 0,
      summary: {
        totalExpected,
        totalCollected,
        totalPending,
        overallPercentage,
      },
    };
  } catch (error) {
    console.error("Year-wise finance summary error:", error);
    return {
      data: [],
      totalCount: 0,
      summary: {
        totalExpected: 0,
        totalCollected: 0,
        totalPending: 0,
        overallPercentage: 0,
      },
    };
  }
}