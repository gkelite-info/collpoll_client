import { supabase } from "@/lib/supabaseClient";

export type StaffAadhaarRow = {
    staffAadhaarId: number;
    userId: number;
    aadhaarNumber: string;
    enrollmentNumber: string | null;
    dateOfBirth: string;
    gender: string;
    address: string | null;
    nameOnAadhaar: string;
    createdAt: string;
    updatedAt: string;
};

export async function fetchStaffAadhaarByUserId(userId: number) {
    const { data, error } = await supabase
        .from("staff_aadhaar_details")
        .select(`
      staffAadhaarId,
      userId,
      aadhaarNumber,
      enrollmentNumber,
      dateOfBirth,
      gender,
      address,
      nameOnAadhaar,
      createdAt,
      updatedAt
    `)
        .eq("userId", userId)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        console.error("fetchStaffAadhaarByUserId error:", error);
        throw error;
    }

    return { success: true, data };
}

export async function fetchExistingAadhaar(
    aadhaarNumber: string
) {
    const { data, error } = await supabase
        .from("staff_aadhaar_details")
        .select("staffAadhaarId")
        .eq("aadhaarNumber", aadhaarNumber.trim())
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        throw error;
    }

    return { success: true, data };
}

export async function saveStaffAadhaar(
    payload: {
        staffAadhaarId?: number;
        userId: number;
        aadhaarNumber: string;
        enrollmentNumber?: string | null;
        dateOfBirth: string;
        gender: string;
        address?: string | null;
        nameOnAadhaar: string;
    }
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        userId: payload.userId,
        aadhaarNumber: payload.aadhaarNumber.trim(),
        enrollmentNumber: payload.enrollmentNumber ?? null,
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        address: payload.address ?? null,
        nameOnAadhaar: payload.nameOnAadhaar.trim(),
        updatedAt: now,
    };

    if (!payload.staffAadhaarId) {
        upsertPayload.createdAt = now;

        const { data, error } = await supabase
            .from("staff_aadhaar_details")
            .insert([upsertPayload])
            .select("staffAadhaarId")
            .single();

        if (error) {
            console.error("saveStaffAadhaar insert error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            staffAadhaarId: data.staffAadhaarId,
        };
    }

    const { error } = await supabase
        .from("staff_aadhaar_details")
        .update(upsertPayload)
        .eq("staffAadhaarId", payload.staffAadhaarId);

    if (error) {
        console.error("saveStaffAadhaar update error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        staffAadhaarId: payload.staffAadhaarId,
    };
}

export async function deleteStaffAadhaar(staffAadhaarId: number) {
    const { error } = await supabase
        .from("staff_aadhaar_details")
        .delete()
        .eq("staffAadhaarId", staffAadhaarId);

    if (error) {
        console.error("deleteStaffAadhaar error:", error);
        return { success: false };
    }

    return { success: true };
}