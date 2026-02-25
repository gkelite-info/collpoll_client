import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { supabase } from "@/lib/supabaseClient";

export type CollegeAdditionalFeeStructureRow = {
    additionalFeeStructureId: number;
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeSessionId: number;
    createdBy: number;

    dueDate: string;
    lateFeePerDay: number;
    remarks: string | null;

    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchAdditionalFeeStructure(
    collegeId: number,
    collegeEducationId: number,
    collegeBranchId: number,
    collegeSessionId: number,
) {
    const { data, error } = await supabase
        .from("college_additional_fee_structure")
        .select("*")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("collegeSessionId", collegeSessionId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .maybeSingle();

    if (error) {
        console.error("fetchAdditionalFeeStructure error:", error);
        throw error;
    }

    return data ?? null;
}

export async function saveAdditionalFeeStructure(
    payload: {
        collegeEducationId: number;
        collegeBranchId: number;
        collegeSessionId: number;
        dueDate: string;
        lateFeePerDay?: number;
        remarks?: string;
    },
    adminId: number,
) {
    const { collegeId } = await fetchAdminContext(adminId);
    const now = new Date().toISOString();
    const trimmedRemarks = payload.remarks?.trim() || null;

    const { data: existing } = await supabase
        .from("college_additional_fee_structure")
        .select("createdAt")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", payload.collegeEducationId)
        .eq("collegeBranchId", payload.collegeBranchId)
        .eq("collegeSessionId", payload.collegeSessionId)
        .maybeSingle();

    const { data, error } = await supabase
        .from("college_additional_fee_structure")
        .upsert(
            {
                collegeId,
                collegeEducationId: payload.collegeEducationId,
                collegeBranchId: payload.collegeBranchId,
                collegeSessionId: payload.collegeSessionId,
                createdBy: adminId,
                dueDate: payload.dueDate,
                lateFeePerDay: payload.lateFeePerDay ?? 0,
                remarks: payload.remarks ?? null,
                createdAt: existing?.createdAt || now,
                updatedAt: now,
            },
            {
                onConflict:
                    "collegeId,collegeEducationId,collegeBranchId,collegeSessionId",
            },
        )
        .select("additionalFeeStructureId")
        .single();

    if (error) {
        console.error("saveAdditionalFeeStructure error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        additionalFeeStructureId: data.additionalFeeStructureId,
    };
}

export async function deactivateAdditionalFeeStructure(
    additionalFeeStructureId: number,
) {
    const { error } = await supabase
        .from("college_additional_fee_structure")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("additionalFeeStructureId", additionalFeeStructureId);

    if (error) {
        console.error("deactivateAdditionalFeeStructure error:", error);
        return { success: false };
    }

    return { success: true };
}