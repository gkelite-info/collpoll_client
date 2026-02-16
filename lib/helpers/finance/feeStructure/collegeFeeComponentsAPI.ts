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
