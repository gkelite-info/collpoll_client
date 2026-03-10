import { supabase } from "@/lib/supabaseClient";

export type CollegeHrRow = {
    collegeHrId: number;
    userId: number;
    collegeId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchCollegeHrs(collegeId: number) {
    const { data, error } = await supabase
        .from("college_hr")
        .select(`
      collegeHrId,
      userId,
      collegeId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeHrId", { ascending: true });

    if (error) {
        console.error("fetchCollegeHrs error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchExistingCollegeHr(
    userId: number,
    collegeId: number,
) {
    const { data, error } = await supabase
        .from("college_hr")
        .select("collegeHrId")
        .eq("userId", userId)
        .eq("collegeId", collegeId)
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

export async function saveCollegeHr(
    payload: {
        userId: number;
        collegeId: number;
    },
    adminId: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_hr")
        .upsert(
            {
                userId: payload.userId,
                collegeId: payload.collegeId,
                createdBy: adminId,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            },
            { onConflict: "userId, collegeId" },
        )
        .select("collegeHrId")
        .single();

    if (error) {
        console.error("saveCollegeHr error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        collegeHrId: data.collegeHrId,
    };
}

export async function deactivateCollegeHr(collegeHrId: number) {
    const { error } = await supabase
        .from("college_hr")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .eq("collegeHrId", collegeHrId);

    if (error) {
        console.error("deactivateCollegeHr error:", error);
        return { success: false };
    }

    return { success: true };
}