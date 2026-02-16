import { supabase } from "@/lib/supabaseClient";

export type CollegeFeeStructureRow = {
  feeStructureId: number;
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function fetchCollegeFeeStructures(collegeId: number) {
  const { data, error } = await supabase
    .from("college_fee_structure")
    .select(
      `
      feeStructureId,
      collegeId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
    )
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("feeStructureId", { ascending: true });

  if (error) {
    console.error("fetchCollegeFeeStructures error:", error);
    throw error;
  }

  return data ?? [];
}

export async function fetchExistingFeeStructure(params: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
}) {
  const { data, error } = await supabase
    .from("college_fee_structure")
    .select("feeStructureId")
    .eq("collegeId", params.collegeId)
    .eq("collegeEducationId", params.collegeEducationId)
    .eq("collegeBranchId", params.collegeBranchId)
    .eq("collegeAcademicYearId", params.collegeAcademicYearId)
    .is("deletedAt", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null };
    }
    throw error;
  }

  return { success: true, data };
}

export async function saveCollegeFeeStructure(
  payload: {
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    dueDate: string;
    lateFeePerDay: number;
    remarks?: string;
  },
  financeManagerId: number,
) {
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("college_fee_structure")
    .select("createdAt")
    .match({
      collegeId: payload.collegeId,
      collegeEducationId: payload.collegeEducationId,
      collegeBranchId: payload.collegeBranchId,
      collegeAcademicYearId: payload.collegeAcademicYearId,
    })
    .maybeSingle();

  const { data, error } = await supabase
    .from("college_fee_structure")
    .upsert(
      {
        collegeId: payload.collegeId,
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeAcademicYearId: payload.collegeAcademicYearId,

        dueDate: payload.dueDate,
        lateFeePerDay: payload.lateFeePerDay,
        remarks: payload.remarks || null,

        createdBy: financeManagerId,
        isActive: true,
        updatedAt: now,
        createdAt: existing?.createdAt || now,
      },
      {
        onConflict:
          "collegeId,collegeEducationId,collegeBranchId,collegeAcademicYearId",
      },
    )
    .select("feeStructureId")
    .maybeSingle();

  if (error) {
    console.error("saveCollegeFeeStructure error:", error);
    return { success: false, error };
  }

  return { success: true, feeStructureId: data?.feeStructureId };
}

export async function deactivateCollegeFeeStructure(feeStructureId: number) {
  const { error } = await supabase
    .from("college_fee_structure")
    .update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    })
    .eq("feeStructureId", feeStructureId);

  if (error) {
    console.error("deactivateCollegeFeeStructure error:", error);
    return { success: false };
  }

  return { success: true };
}
