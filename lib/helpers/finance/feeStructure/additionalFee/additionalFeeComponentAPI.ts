import { supabase } from "@/lib/supabaseClient";

export type CollegeAdditionalFeeComponentRow = {
    additionalFeeComponentId: number;
    additionalFeeStructureId: number;

    department: string;
    courseType: string;
    amount: number;

    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchAdditionalFeeComponents(
    additionalFeeStructureId: number,
) {
    const { data, error } = await supabase
        .from("college_additional_fee_components")
        .select("*")
        .eq("additionalFeeStructureId", additionalFeeStructureId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("additionalFeeComponentId", { ascending: true });

    if (error) {
        console.error("fetchAdditionalFeeComponents error:", error);
        throw error;
    }

    return data ?? [];
}

export async function saveAdditionalFeeComponent(
    payload: {
        additionalFeeStructureId: number;
        department: string;
        courseType: string;
        amount: number;
    },
) {
    const now = new Date().toISOString();
    const trimmedDepartment = payload.department.trim();
    const trimmedCourseType = payload.courseType.trim();

    const { data: existing } = await supabase
        .from("college_additional_fee_components")
        .select("createdAt")
        .eq("additionalFeeStructureId", payload.additionalFeeStructureId)
        .eq("department", trimmedDepartment)
        .eq("courseType", trimmedCourseType)
        .maybeSingle();

    const { data, error } = await supabase
        .from("college_additional_fee_components")
        .insert({
            additionalFeeStructureId: payload.additionalFeeStructureId,
            department: payload.department.trim(),
            courseType: payload.courseType.trim(),
            amount: payload.amount,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
        })
        .select("additionalFeeComponentId")
        .single();

    if (error) {
        console.error("saveAdditionalFeeComponent error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        additionalFeeComponentId: data.additionalFeeComponentId,
    };
}

export async function deactivateAdditionalFeeComponent(
    additionalFeeComponentId: number,
) {
    const { error } = await supabase
        .from("college_additional_fee_components")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("additionalFeeComponentId", additionalFeeComponentId);

    if (error) {
        console.error("deactivateAdditionalFeeComponent error:", error);
        return { success: false };
    }

    return { success: true };
}