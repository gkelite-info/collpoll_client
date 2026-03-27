import { supabase } from "@/lib/supabaseClient";

export type StaffPanRow = {
    staffPanId: number;
    userId: number;
    panNumber: string;
    nameOnPan: string;
    fatherName: string;
    dateOfBirth: string;
    createdAt: string;
    updatedAt: string;
};


export async function fetchStaffPanByUserId(userId: number) {
    const { data, error } = await supabase
        .from("staff_pan_details")
        .select(`
      staffPanId,
      userId,
      panNumber,
      nameOnPan,
      fatherName,
      dateOfBirth,
      createdAt,
      updatedAt
    `)
        .eq("userId", userId)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        console.error("fetchStaffPanByUserId error:", error);
        throw error;
    }

    return { success: true, data };
}

export async function fetchExistingPan(panNumber: string) {
    const { data, error } = await supabase
        .from("staff_pan_details")
        .select("staffPanId")
        .eq("panNumber", panNumber.trim().toUpperCase())
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        throw error;
    }

    return { success: true, data };
}

export async function saveStaffPan(
    payload: {
        staffPanId?: number;
        userId: number;
        panNumber: string;
        nameOnPan: string;
        fatherName: string;
        dateOfBirth: string;
    }
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        userId: payload.userId,
        panNumber: payload.panNumber.trim().toUpperCase(),
        nameOnPan: payload.nameOnPan.trim(),
        fatherName: payload.fatherName.trim(),
        dateOfBirth: payload.dateOfBirth,
        updatedAt: now,
    };

    if (!payload.staffPanId) {
        upsertPayload.createdAt = now;

        const { data, error } = await supabase
            .from("staff_pan_details")
            .insert([upsertPayload])
            .select("staffPanId")
            .single();

        if (error) {
            console.error("saveStaffPan insert error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            staffPanId: data.staffPanId,
        };
    }

    const { error } = await supabase
        .from("staff_pan_details")
        .update(upsertPayload)
        .eq("staffPanId", payload.staffPanId);

    if (error) {
        console.error("saveStaffPan update error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        staffPanId: payload.staffPanId,
    };
}

export async function deleteStaffPan(staffPanId: number) {
    const { error } = await supabase
        .from("staff_pan_details")
        .delete()
        .eq("staffPanId", staffPanId);

    if (error) {
        console.error("deleteStaffPan error:", error);
        return { success: false };
    }

    return { success: true };
}