import { supabase } from "@/lib/supabaseClient";

export type CalendarEventRow = {
    facultyId: number;
    subject: string | null;
    eventTopic: string;
    type: string;
    date: string;
    roomNo: string;
    fromTime: string;
    toTime: string;
    meetingLink: string | null;
    is_deleted: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchCalendarEvents(
    filters: {
        facultyId?: number;
        date?: string;
    } = {}
) {
    let query = supabase
        .from("calendar_event")
        .select(`
      calendarEventId,
      facultyId,
      subject,
      eventTopic,
      type,
      date,
      roomNo,
      fromTime,
      toTime,
      meetingLink,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .is("deletedAt", null);

    if (filters.facultyId) {
        query = query.eq("facultyId", filters.facultyId);
    }

    if (filters.date) {
        query = query.eq("date", filters.date);
    }

    const { data, error } = await query.order("fromTime", { ascending: true });

    if (error) {
        console.error("fetchCalendarEvents error:", error);
        throw error;
    }

    return data ?? [];
}

export async function saveCalendarEvent(
    payload: {
        facultyId: number;
        subject?: string | null;
        eventTopic: string;
        type: string;
        date: string;
        roomNo: string;
        fromTime: string;
        toTime: string;
        meetingLink?: string | null;
    }
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("calendar_event")
        .upsert(
            {
                facultyId: payload.facultyId,
                subject: payload.subject ?? null,
                eventTopic: payload.eventTopic,
                type: payload.type,
                date: payload.date,
                roomNo: payload.roomNo,
                fromTime: payload.fromTime,
                toTime: payload.toTime,
                meetingLink: payload.meetingLink ?? null,
                updatedAt: now,
                createdAt: now,
            },
            { onConflict: "calendarEventId" }
        )
        .select("calendarEventId")
        .single();

    if (error) {
        console.error("saveCalendarEvent error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        calendarEventId: data.calendarEventId,
    };
}

export async function deleteCalendarEvent(calendarEventId: number) {
    const { error } = await supabase
        .from("calendar_event")
        .update({
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("calendarEventId", calendarEventId);

    if (error) {
        console.error("deleteCalendarEvent error:", error);
        return { success: false };
    }

    return { success: true };
}
