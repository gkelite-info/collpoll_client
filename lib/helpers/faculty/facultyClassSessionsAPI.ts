import { supabase } from "@/lib/supabaseClient";

export type FacultyClassSessionRow = {
    facultyClassSessionsId: number;
    calendarEventId: number;
    facultyId: number;
    status: "Scheduled" | "Accepted" | "Cancel";
    acceptedAt: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchFacultyClassSessionsByEvent(
    calendarEventId: number,
) {
    const { data, error } = await supabase
        .from("faculty_class_sessions")
        .select(`
      facultyClassSessionsId,
      calendarEventId,
      facultyId,
      status,
      acceptedAt,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("calendarEventId", calendarEventId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: true });

    if (error) {
        console.error("fetchFacultyClassSessionsByEvent error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchFacultyClassSessionsByFaculty(
    facultyId: number,
) {
    const { data, error } = await supabase
        .from("faculty_class_sessions")
        .select(`
      facultyClassSessionsId,
      calendarEventId,
      facultyId,
      status,
      acceptedAt,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("facultyId", facultyId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchFacultyClassSessionsByFaculty error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchExistingFacultyClassSession(
    calendarEventId: number,
    facultyId: number,
    status: "Scheduled" | "Accepted" | "Cancel",
) {
    const { data, error } = await supabase
        .from("faculty_class_sessions")
        .select("facultyClassSessionsId")
        .eq("calendarEventId", calendarEventId)
        .eq("facultyId", facultyId)
        .eq("status", status)
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


export async function saveFacultyClassSession(
    payload: {
        facultyClassSessionsId?: number;
        calendarEventId: number;
        facultyId: number;
        status: "Scheduled" | "Accepted" | "Cancel";
        acceptedAt: string;
    },
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        calendarEventId: payload.calendarEventId,
        facultyId: payload.facultyId,
        status: payload.status,
        acceptedAt: payload.acceptedAt,
        updatedAt: now,
    };

    if (payload.facultyClassSessionsId) {
        upsertPayload.facultyClassSessionsId = payload.facultyClassSessionsId;
    } else {
        upsertPayload.createdAt = now;
    }

    const { data, error } = await supabase
        .from("faculty_class_sessions")
        .upsert(upsertPayload, {
            onConflict: "calendarEventId,facultyId,status",
        })
        .select("facultyClassSessionsId")
        .single();

    if (error) {
        console.error("saveFacultyClassSession error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        facultyClassSessionsId: data.facultyClassSessionsId,
    };
}


export async function updateFacultyClassSessionStatus(
    facultyClassSessionsId: number,
    status: "Scheduled" | "Accepted" | "Cancel",
) {
    const payload: any = {
        status,
        updatedAt: new Date().toISOString(),
    };

    if (status === "Accepted") {
        payload.acceptedAt = new Date().toISOString();
    }

    const { error } = await supabase
        .from("faculty_class_sessions")
        .update(payload)
        .eq("facultyClassSessionsId", facultyClassSessionsId);

    if (error) {
        console.error("updateFacultyClassSessionStatus error:", error);
        return { success: false };
    }

    return { success: true };
}


export async function deactivateFacultyClassSession(
    facultyClassSessionsId: number,
) {
    const { error } = await supabase
        .from("faculty_class_sessions")
        .update({
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("facultyClassSessionsId", facultyClassSessionsId);

    if (error) {
        console.error("deactivateFacultyClassSession error:", error);
        return { success: false };
    }

    return { success: true };
}