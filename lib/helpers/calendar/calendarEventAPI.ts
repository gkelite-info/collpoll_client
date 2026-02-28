import { supabase } from "@/lib/supabaseClient";

export type CalendarEventRow = {
    facultyId: number;
    subject: string | null;
    college_subjects?: {
        collegeSubjectId: number;
        subjectName: string;
        subjectKey: string;
    } | null;
    eventTopic: number | null;
    college_subject_unit_topics?: {
        collegeSubjectUnitTopicId: number;
        topicTitle: string;
    } | null;
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
    deletedAt,

    college_subjects:subject (
      collegeSubjectId,
      subjectName,
      subjectKey
    ),

    college_subject_unit_topics:eventTopic (
      collegeSubjectUnitTopicId,
      topicTitle
    )
  `)
        .is("deletedAt", null)
        .eq("is_deleted", false);

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

export async function saveCalendarEvent(payload: {
    calendarEventId?: number; // ✅ needed for edit
    facultyId: number;
    subjectId: number | null; // ✅ FIXED
    eventTopic: number | null;
    type: "class" | "meeting" | "exam" | "quiz";
    date: string;
    roomNo: string;
    fromTime: string;
    toTime: string;
    meetingLink?: string | null;
}) {
    const now = new Date().toISOString();

    // 🔁 EDIT
    if (payload.calendarEventId) {
        const { error } = await supabase
            .from("calendar_event")
            .update({
                subject: payload.subjectId,
                eventTopic: payload.eventTopic,
                type: payload.type,
                date: payload.date,
                roomNo: payload.roomNo,
                fromTime: payload.fromTime,
                toTime: payload.toTime,
                meetingLink: payload.meetingLink ?? null,
                updatedAt: now,
            })
            .eq("calendarEventId", payload.calendarEventId);

        if (error) {
            console.error("updateCalendarEvent error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            calendarEventId: payload.calendarEventId,
        };
    }

    // ➕ CREATE
    const { data, error } = await supabase
        .from("calendar_event")
        .insert({
            facultyId: payload.facultyId,
            subject: payload.subjectId,
            eventTopic: payload.eventTopic,
            type: payload.type,
            date: payload.date,
            roomNo: payload.roomNo,
            fromTime: payload.fromTime,
            toTime: payload.toTime,
            meetingLink: payload.meetingLink ?? null,
            createdAt: now,
            updatedAt: now,
        })
        .select("calendarEventId")
        .single();

    if (error) {
        console.error("insertCalendarEvent error:", error);
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