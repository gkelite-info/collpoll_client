import { supabase } from "@/lib/supabaseClient";

export const formatShortCurrency = (value: number) => {
  if (value >= 10000000) return `₹ ${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹ ${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹ ${(value / 1000).toFixed(1)} K`;
  return `₹ ${value.toLocaleString("en-IN")}`;
};

export async function getBranchWiseCollection(
  collegeId: number,
  educationId: number,
  year: string,
) {
  const { data: branches, error: branchError } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", educationId);

  if (branchError || !branches) {
    console.error("Error fetching branches:", branchError);
    return { chartData: [], gridData: [], tableData: [] };
  }

  const branchMap: Record<
    string,
    {
      branch: string;
      total: number;
      collectedThisYear: number;
      collectedAllTime: number;
    }
  > = {};
  const branchIdToCode: Record<number, string> = {};

  branches.forEach((b) => {
    branchIdToCode[b.collegeBranchId] = b.collegeBranchCode;
    branchMap[b.collegeBranchCode] = {
      branch: b.collegeBranchCode,
      total: 0,
      collectedThisYear: 0,
      collectedAllTime: 0,
    };
  });

  const branchIds = branches.map((b) => b.collegeBranchId);
  if (branchIds.length === 0)
    return { chartData: [], gridData: [], tableData: [] };

  const { data: obligations, error: obError } = await supabase
    .from("student_fee_obligation")
    .select(
      `
      totalAmount,
      collegeBranchId,
      student_fee_collection (
        collectedAmount,
        createdAt
      )
    `,
    )
    .in("collegeBranchId", branchIds);

  if (obError) {
    console.error("Error fetching fee data:", obError);
    return { chartData: [], gridData: [], tableData: [] };
  }

  obligations?.forEach((ob: any) => {
    const branchCode = branchIdToCode[ob.collegeBranchId];
    if (!branchCode) return;
    branchMap[branchCode].total += Number(ob.totalAmount) || 0;

    ob.student_fee_collection?.forEach((coll: any) => {
      const amt = Number(coll.collectedAmount) || 0;
      branchMap[branchCode].collectedAllTime += amt;
      const collectionYear = new Date(coll.createdAt).getFullYear().toString();
      if (collectionYear === year) {
        branchMap[branchCode].collectedThisYear += amt;
      }
    });
  });

  const chartData: any[] = [];
  const gridData: any[] = [];
  const tableData: any[] = [];

  Object.values(branchMap).forEach((item) => {
    const pending = Math.max(item.total - item.collectedAllTime, 0);

    chartData.push({
      branch: item.branch,
      collected: item.collectedThisYear,
      pending: pending,
    });

    gridData.push({
      branch: item.branch,
      totalFeesShort: formatShortCurrency(item.total),
      collectedShort: formatShortCurrency(item.collectedThisYear),
      pendingShort: formatShortCurrency(pending),
    });

    tableData.push({
      branch: item.branch,
      collected: `₹ ${item.collectedThisYear.toLocaleString("en-IN")}`,
      pending: `₹ ${pending.toLocaleString("en-IN")}`,
      totalFees: `₹ ${item.total.toLocaleString("en-IN")}`,
    });
  });

  return { chartData, gridData, tableData };
}
