import { supabase } from "@/lib/supabaseClient";

export type FeeTypeRow = {
    feeTypeId: number;
    feeTypeName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchFeeTypes() {
    const { data, error } = await supabase
        .from("fee_type_master")
        .select(`
      feeTypeId,
      feeTypeName,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("feeTypeId", { ascending: true });

    if (error) {
        console.error("fetchFeeTypes error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchFeeTypeOptions() {
    const rows = await fetchFeeTypes();

    return rows.map((row) => ({
        id: row.feeTypeId,
        label: row.feeTypeName,
        value: row.feeTypeName,
    }));
}

export async function fetchExistingFeeType(feeTypeName: string) {
    const { data, error } = await supabase
        .from("fee_type_master")
        .select("feeTypeId")
        .eq("feeTypeName", feeTypeName.trim())
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

export async function saveFeeType(feeTypeName: string) {

    const { data, error } = await supabase
        .from("fee_type_master")
        .upsert(
            {
                feeTypeName: feeTypeName.trim(),
                updatedAt: new Date().toISOString(),
            },
            { onConflict: "feeTypeName" },
        )
        .select("feeTypeId")
        .single();

    if (error) {
        console.error("saveFeeType error:", error);
        return { success: false, error };
    }

    return { success: true, feeTypeId: data.feeTypeId };
}

export async function deactivateFeeType(feeTypeId: number) {
    const { error } = await supabase
        .from("fee_type_master")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("feeTypeId", feeTypeId);

    if (error) {
        console.error("deactivateFeeType error:", error);
        return { success: false };
    }

    return { success: true };
}
