import { supabase } from "@/lib/supabaseClient";

export type StaffBankRow = {
    staffBankId: number;
    userId: number;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    branch: string | null;
    isPrimary: boolean | null;
    isActive: boolean | null;
    createdAt: string;
    updatedAt: string;
};

export async function fetchStaffBanks(userId: number) {
    const { data, error } = await supabase
        .from("staff_bank_details")
        .select(`
      staffBankId,
      userId,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      branch,
      isPrimary,
      isActive,
      createdAt,
      updatedAt
    `)
        .eq("userId", userId)
        .eq("isActive", true)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchStaffBanks error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchPrimaryStaffBank(userId: number) {
    const { data, error } = await supabase
        .from("staff_bank_details")
        .select(`
      staffBankId,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      branch
    `)
        .eq("userId", userId)
        .eq("isPrimary", true)
        .eq("isActive", true)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }
        console.error("fetchPrimaryStaffBank error:", error);
        throw error;
    }

    return data;
}

export async function saveStaffBank(
    payload: {
        staffBankId?: number;
        userId: number;
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        branch?: string | null;
    }
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        userId: payload.userId,
        bankName: payload.bankName.trim(),
        accountNumber: payload.accountNumber.trim(),
        ifscCode: payload.ifscCode.trim(),
        accountHolderName: payload.accountHolderName.trim(),
        branch: payload.branch ?? null,
        updatedAt: now,
    };

    if (!payload.staffBankId) {
        upsertPayload.createdAt = now;

        const { data, error } = await supabase
            .from("staff_bank_details")
            .insert([upsertPayload])
            .select("staffBankId")
            .single();

        if (error) {
            console.error("saveStaffBank insert error:", error);
            return { success: false, error };
        }

        return { success: true, staffBankId: data.staffBankId };
    }

    const { error } = await supabase
        .from("staff_bank_details")
        .update(upsertPayload)
        .eq("staffBankId", payload.staffBankId);

    if (error) {
        console.error("saveStaffBank update error:", error);
        return { success: false, error };
    }

    return { success: true, staffBankId: payload.staffBankId };
}

export async function setPrimaryStaffBank(
    userId: number,
    staffBankId: number
) {
    const { error: clearError } = await supabase
        .from("staff_bank_details")
        .update({ isPrimary: false })
        .eq("userId", userId)
        .eq("isPrimary", true);

    if (clearError) {
        console.error("clear primary bank error:", clearError);
        return { success: false };
    }

    const { error: setError } = await supabase
        .from("staff_bank_details")
        .update({ isPrimary: true })
        .eq("staffBankId", staffBankId)
        .eq("userId", userId);

    if (setError) {
        console.error("set primary bank error:", setError);
        return { success: false };
    }

    return { success: true };
}

export async function deactivateStaffBank(staffBankId: number) {
    const { error } = await supabase
        .from("staff_bank_details")
        .update({
            isActive: false,
            isPrimary: false,
            updatedAt: new Date().toISOString(),
        })
        .eq("staffBankId", staffBankId);

    if (error) {
        console.error("deactivateStaffBank error:", error);
        return { success: false };
    }

    return { success: true };
}