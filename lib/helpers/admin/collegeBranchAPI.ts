import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { supabase } from "@/lib/supabaseClient";

type BranchInput = {
    id?: number;
    type: string;
    code: string;
};

export async function upsertCollegeBranches(
    branches: {
        id?: number;
        type: string;
        code: string;
    }[],
    context: {
        collegeEducationId: number;
        collegeId: number;
        adminId: number;
    }
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_branch")
        .upsert(
            branches.map((b) => ({
                collegeBranchType: b.type,
                collegeBranchCode: b.code,
                collegeEducationId: context.collegeEducationId,
                collegeId: context.collegeId,
                createdBy: context.adminId,
                createdAt: now,
                updatedAt: now,
            })),
            { onConflict: "collegeEducationId, collegeBranchCode, collegeId" }
        )
        .select("collegeBranchId");

    if (error) {
        console.error("upsertCollegeBranches error:", error);
        throw error;
    }

    return data;
}

export async function fetchCollegeBranches(
    collegeId: number,
    collegeEducationId: number
) {
    const { data, error } = await supabase
        .from("college_branch")
        .select(`
      collegeBranchId,
      collegeBranchType,
      collegeBranchCode,
      collegeEducationId,
      collegeId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeBranchCode", { ascending: true });

    if (error) {
        console.error("fetchCollegeBranches error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchCollegeBranchesForLoggedInAdmin(
    userId: number,
    collegeEducationId: number
) {
    const { collegeId } = await fetchAdminContext(userId);

    return fetchCollegeBranches(collegeId, collegeEducationId);
}

export async function fetchBranchOptionsForAdmin(
    userId: number,
    collegeEducationId: number
) {
    const { collegeId } = await fetchAdminContext(userId);

    const { data, error } = await supabase
        .from("college_branch")
        .select(`
      collegeBranchId,
      collegeBranchType,
      collegeBranchCode
    `)
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeBranchCode", { ascending: true });

    if (error) {
        console.error("fetchBranchOptionsForAdmin error:", error);
        throw error;
    }

    return (data ?? []).map((b) => ({
        collegeBranchId: b.collegeBranchId,
        name: b.collegeBranchType,
        code: b.collegeBranchCode,
    }));
}

