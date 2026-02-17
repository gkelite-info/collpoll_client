import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { supabase } from "@/lib/supabaseClient";

export type CollegeSessionRow = {
    collegeSessionId: number;
    collegeId: number;
    sessionName: string;
    startYear: number;
    endYear: number;
    is_deleted: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchCollegeSessions(collegeId: number) {
    const { data, error } = await supabase
        .from("college_session")
        .select(`
      collegeSessionId,
      collegeId,
      sessionName,
      startYear,
      endYear,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
        .order("startYear", { ascending: true });

    if (error) {
        console.error("fetchCollegeSessions error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchSessionOptions(collegeId: number) {
    const rows = await fetchCollegeSessions(collegeId);

    return rows.map((row) => ({
        id: row.collegeSessionId,
        label: row.sessionName,
        value: row.collegeSessionId,
        startYear: row.startYear,
        endYear: row.endYear,
    }));
}

export async function fetchExistingCollegeSession(
    collegeId: number,
    startYear: number,
    endYear: number,
) {
    const { data, error } = await supabase
        .from("college_session")
        .select("collegeSessionId")
        .eq("collegeId", collegeId)
        .eq("startYear", startYear)
        .eq("endYear", endYear)
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

export async function saveCollegeSession(
    payload: {
        collegeId: number;
        sessionName: string;
        startYear: number;
        endYear: number;
    },
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_session")
        .upsert(
            {
                collegeId: payload.collegeId,
                sessionName: payload.sessionName.trim(),
                startYear: payload.startYear,
                endYear: payload.endYear,
                is_deleted: false,
                createdAt: now,
                updatedAt: now,
            },
            {
                onConflict: "collegeId,startYear,endYear",
            },
        )
        .select("collegeSessionId")
        .single();

    if (error) {
        console.error("saveCollegeSession error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        collegeSessionId: data.collegeSessionId,
    };
}

export async function deactivateCollegeSession(collegeSessionId: number) {
    const { error } = await supabase
        .from("college_session")
        .update({
            is_deleted: true,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .eq("collegeSessionId", collegeSessionId);

    if (error) {
        console.error("deactivateCollegeSession error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function fetchSessionsForLoggedInAdmin(userId: number) {
    const { collegeId } = await fetchAdminContext(userId);

    const rows = await fetchCollegeSessions(collegeId);

    return rows.map((row) => ({
        id: row.collegeSessionId,
        label: row.sessionName,
        value: row.collegeSessionId,
        startYear: row.startYear,
        endYear: row.endYear,
    }));
}
