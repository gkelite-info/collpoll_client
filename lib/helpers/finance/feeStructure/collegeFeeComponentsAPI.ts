import { supabase } from "@/lib/supabaseClient";

export type CollegeFeeComponentRow = {
  feeComponentId: number;
  feeStructureId: number;
  feeTypeId: number;
  amount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function fetchAllFeeStructures(collegeId: number) {
  try {
    // 1. Fetch structures
    const { data: structures, error: structError } = await supabase
      .from("college_fee_structure")
      .select(
        `
        *,
        college_branch ( collegeBranchId, collegeBranchCode, collegeBranchType ),
        college_academic_year ( collegeAcademicYearId, collegeAcademicYear )
      `,
      )
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .order("createdAt", { ascending: false });

    if (structError) throw structError;
    if (!structures || structures.length === 0) return [];

    // 2. Fetch components
    const structureIds = structures.map((s) => s.feeStructureId);
    const { data: components, error: compError } = await supabase
      .from("college_fee_components")
      .select(`*, fee_type_master ( feeTypeId, feeTypeName )`)
      .in("feeStructureId", structureIds)
      .eq("isActive", true);

    if (compError) throw compError;

    // 3. Merge
    return structures.map((struct) => {
      const myComps =
        components?.filter((c) => c.feeStructureId === struct.feeStructureId) ||
        [];
      const totalAmount = myComps.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      );

      return {
        ...struct,
        branchName:
          struct.college_branch?.collegeBranchCode || "Unknown Branch",
        branchId: struct.college_branch?.collegeBranchId,
        academicYear:
          struct.college_academic_year?.collegeAcademicYear || "Unknown Year",
        academicYearId: struct.college_academic_year?.collegeAcademicYearId,
        components: myComps.map((c) => ({
          label: c.fee_type_master?.feeTypeName,
          amount: c.amount,
          typeId: c.feeTypeId,
        })),
        totalAmount,
      };
    });
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    return [];
  }
}

export async function fetchFeeComponents(feeStructureId: number) {
  const { data, error } = await supabase
    .from("college_fee_components")
    .select(
      `
      feeComponentId,
      feeStructureId,
      feeTypeId,
      amount,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
    )
    .eq("feeStructureId", feeStructureId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("feeComponentId", { ascending: true });

  if (error) {
    console.error("fetchFeeComponents error:", error);
    throw error;
  }

  return data ?? [];
}

export async function saveFeeComponent(payload: {
  feeStructureId: number;
  feeTypeId: number;
  amount: number;
}) {
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("college_fee_components")
    .select("createdAt")
    .match({
      feeStructureId: payload.feeStructureId,
      feeTypeId: payload.feeTypeId,
    })
    .maybeSingle();

  const { data, error } = await supabase
    .from("college_fee_components")
    .upsert(
      {
        ...payload,
        updatedAt: now,
        createdAt: existing?.createdAt || now,
        isActive: true,
      },
      { onConflict: "feeStructureId,feeTypeId" },
    )
    .select("feeComponentId")
    .single();

  if (error) {
    console.error("saveFeeComponent error:", error);
    return { success: false, error };
  }

  return { success: true, feeComponentId: data.feeComponentId };
}

export async function deactivateFeeComponent(feeComponentId: number) {
  const { error } = await supabase
    .from("college_fee_components")
    .update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    })
    .eq("feeComponentId", feeComponentId);

  if (error) {
    console.error("deactivateFeeComponent error:", error);
    return { success: false };
  }

  return { success: true };
}
