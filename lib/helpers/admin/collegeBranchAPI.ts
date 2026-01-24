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

