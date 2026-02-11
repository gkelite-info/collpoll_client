import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { supabase } from "@/lib/supabaseClient";

export type CollegeAdminRow = {
    collegeAdminId: number;
    userId: number;
    collegeId: number;
    isActive: boolean;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
};


export async function fetchCollegeAdmins(collegeId: number) {
    const { data, error } = await supabase
        .from("college_admin")
        .select(`
      collegeAdminId,
      userId,
      collegeId,
      isActive,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeAdminId", { ascending: true });

    if (error) {
        console.error("fetchCollegeAdmins error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchCollegeAdminByUser(userId: number) {
    const { data, error } = await supabase
        .from("college_admin")
        .select(`
      collegeAdminId,
      userId,
      collegeId,
      isActive,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("userId", userId)
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


export async function saveCollegeAdmin(
    payload: {
        userId: number;
        collegeId: number;
        isActive?: boolean;
    },
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_admin")
        .upsert(
            {
                userId: payload.userId,
                collegeId: payload.collegeId,
                isActive: payload.isActive ?? true,
                updatedAt: now,
                createdAt: now,
            },
            {
                onConflict: "userId,collegeId,collegeAdminId",
            },
        )
        .select("collegeAdminId")
        .single();

    if (error) {
        console.error("saveCollegeAdmin error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        collegeAdminId: data.collegeAdminId,
    };
}


export async function deactivateCollegeAdmin(collegeAdminId: number) {
    const { error } = await supabase
        .from("college_admin")
        .update({
            isActive: false,
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeAdminId", collegeAdminId);

    if (error) {
        console.error("deactivateCollegeAdmin error:", error);
        return { success: false };
    }

    return { success: true };
}


export async function fetchCollegeAdminsForLoggedInAdmin(userId: number) {
    const { collegeId } = await fetchAdminContext(userId);

    const rows = await fetchCollegeAdmins(collegeId);

    return rows.map((row) => ({
        id: row.collegeAdminId,
        userId: row.userId,
        collegeId: row.collegeId,
        isActive: row.isActive,
    }));
}
