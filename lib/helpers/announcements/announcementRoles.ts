import { supabase } from "@/lib/supabaseClient";

export type CollegeAnnouncementRoleRow = {
    collegeAnnouncementRolesId: number;
    collegeAnnouncementId: number;
    role: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchAnnouncementRoles(
    collegeAnnouncementId: number,
) {
    const { data, error } = await supabase
        .from("college_announcements_roles")
        .select(`
      collegeAnnouncementRolesId,
      collegeAnnouncementId,
      role,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeAnnouncementId", collegeAnnouncementId)
        .is("deletedAt", null)
        .order("collegeAnnouncementRolesId", { ascending: true });

    if (error) {
        console.error("fetchAnnouncementRoles error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchExistingAnnouncementRole(
    collegeAnnouncementId: number,
    role: string,
) {
    const { data, error } = await supabase
        .from("college_announcements_roles")
        .select("collegeAnnouncementRolesId, createdAt")
        .eq("collegeAnnouncementId", collegeAnnouncementId)
        .eq("role", role)
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

export async function saveAnnouncementRole(
    payload: {
        collegeAnnouncementId: number;
        role: string;
    },
) {
    const now = new Date().toISOString();

    const existing = await fetchExistingAnnouncementRole(
        payload.collegeAnnouncementId,
        payload.role,
    );

    const upsertPayload: any = {
        collegeAnnouncementId: payload.collegeAnnouncementId,
        role: payload.role,
        updatedAt: now,
    };

    if (!existing.data) {
        upsertPayload.createdAt = now;
    }

    const { data, error } = await supabase
        .from("college_announcements_roles")
        .upsert(upsertPayload, {
            onConflict: "collegeAnnouncementId, role",
        })
        .select("collegeAnnouncementRolesId")
        .single();

    if (error) {
        console.error("saveAnnouncementRole error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        collegeAnnouncementRolesId: data.collegeAnnouncementRolesId,
    };
}

export async function deactivateAnnouncementRole(
    collegeAnnouncementRolesId: number,
) {
    const { error } = await supabase
        .from("college_announcements_roles")
        .update({
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .eq("collegeAnnouncementRolesId", collegeAnnouncementRolesId);

    if (error) {
        console.error("deactivateAnnouncementRole error:", error);
        return { success: false };
    }

    return { success: true };
}