import { supabase } from "@/lib/supabaseClient";

export type HrCalendarEventParticipantRow = {
    hrCalendarEventParticipantId: number;
    hrCalendarEventId: number;
    userId: number;
    role: "Faculty" | "Admin" | "Finance" | "Placement";
    createdAt: string;
    updatedAt: string;
};


export async function fetchHrCalendarEventParticipants(
    hrCalendarEventId: number,
) {
    const { data, error } = await supabase
        .from("hr_calendar_event_participants")
        .select(`
            hrCalendarEventParticipantId,
            hrCalendarEventId,
            userId,
            role,
            createdAt,
            updatedAt
        `)
        .eq("hrCalendarEventId", hrCalendarEventId)
        .order("hrCalendarEventParticipantId", { ascending: true });

    if (error) {
        console.error("fetchHrCalendarEventParticipants error:", error);
        throw error;
    }

    return data ?? [];
}


export async function addHrCalendarEventParticipants(
    hrCalendarEventId: number,
    participants: {
        userId: number;
        role: "Faculty" | "Admin" | "Finance" | "Placement";
    }[],
) {
    if (!participants.length) {
        return { success: true };
    }

    const now = new Date().toISOString();

    const rows = participants.map((p) => ({
        hrCalendarEventId,
        userId: p.userId,
        role: p.role,
        createdAt: now,
        updatedAt: now,
    }));

    const { error } = await supabase
        .from("hr_calendar_event_participants")
        .insert(rows);

    if (error) {
        console.error("addHrCalendarEventParticipants error:", error);
        return { success: false, error };
    }

    return { success: true };
}


export async function removeHrCalendarEventParticipant(
    hrCalendarEventId: number,
    userId: number,
) {
    const { error } = await supabase
        .from("hr_calendar_event_participants")
        .delete()
        .eq("hrCalendarEventId", hrCalendarEventId)
        .eq("userId", userId);

    if (error) {
        console.error("removeHrCalendarEventParticipant error:", error);
        return { success: false };
    }

    return { success: true };
}