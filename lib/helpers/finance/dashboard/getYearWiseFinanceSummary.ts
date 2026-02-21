import { supabase } from "@/lib/supabaseClient";

export async function getYearWiseFinanceSummary({
  collegeId,
  collegeEducationId,
  branchCode,
}: {
  collegeId: number;
  collegeEducationId: number;
  branchCode: string;
}) {
  console.log(" INPUT FILTERS:", {
    collegeId,
    collegeEducationId,
    branchCode,
  });
  const { data: branch, error: branchError } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchCode")
    .eq("collegeBranchCode", branchCode)
    .eq("collegeId", collegeId)
    .single();

  if (branchError) {
    return [];
  }
  if (!branch) {
    return [];
  }
  const branchId = branch.collegeBranchId;
  const { data: years, error: yearError } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeBranchId", branchId)
    .eq("collegeId", collegeId)
    .is("deletedAt", null);

  if (yearError) {
    return [];
  }
  if (!years || years.length === 0) {
    return [];
  }
  const { data: obligations, error: obligationError } = await supabase
    .from("student_fee_obligation")
    .select(
      "studentFeeObligationId, totalAmount, collegeAcademicYearId"
    )
    .eq("collegeBranchId", branchId);

  if (obligationError) {
    return [];
  }
  const yearMap = new Map();
  years.forEach((y) => {
    yearMap.set(y.collegeAcademicYearId, {
      yearId: y.collegeAcademicYearId,
      year: y.collegeAcademicYear,
      expected: 0,
      collected: 0,
    });
  });
  obligations?.forEach((o) => {
    const year = yearMap.get(o.collegeAcademicYearId);
    if (year) {
      year.expected += o.totalAmount;
    }
  });
  const obligationIds =
    obligations?.map((o) => o.studentFeeObligationId) || [];
  if (obligationIds.length > 0) {
    const { data: ledger, error: ledgerError } = await supabase
      .from("student_fee_ledger")
      .select("studentFeeObligationId, amount")
      .in("studentFeeObligationId", obligationIds);
    if (ledgerError) {
    } else {
      ledger?.forEach((entry) => {
        const obligation = obligations.find(
          (o) =>
            o.studentFeeObligationId ===
            entry.studentFeeObligationId
        );

        if (obligation) {
          const year = yearMap.get(
            obligation.collegeAcademicYearId
          );

          if (year) {
            year.collected += entry.amount;
          }
        }
      });
    }
  }
  const result = Array.from(yearMap.values()).map((y) => {
    const pending = y.expected - y.collected;
    const percentage =
      y.expected === 0
        ? 0
        : Number(
            ((y.collected / y.expected) * 100).toFixed(2)
          );

    return {
      yearId: y.yearId,
      year: y.year,
      expected: y.expected,
      collected: y.collected,
      pending,
      collectionPercentage: percentage,
    };
  });
  return result;
}