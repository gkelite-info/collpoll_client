import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { supabase } from "@/lib/supabaseClient";

export type HrCalendarEventRow = {
    hrCalendarEventId: number;
    title: string;
    topic: string;
    eventDate: string;
    fromTime: string;
    toTime: string;
    roomNo: string;
    collegeId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchHrCalendarEvents(collegeId: number) {
    const { data, error } = await supabase
        .from("hr_calendar_events")
        .select(`
            hrCalendarEventId,
            title,
            topic,
            eventDate,
            fromTime,
            toTime,
            roomNo,
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
        .order("eventDate", { ascending: true });

    if (error) {
        console.error("fetchHrCalendarEvents error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchHrCalendarEventsForLoggedInAdmin(userId: number) {
    const { collegeId } = await fetchAdminContext(userId);
    return fetchHrCalendarEvents(collegeId);
}


export async function saveHrCalendarEvent(
    payload: {
        hrCalendarEventId?: number;
        title: string;
        topic: string;
        eventDate: string;
        fromTime: string;
        toTime: string;
        roomNo: string;
        collegeId: number;
    },
    collegeHrId: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("hr_calendar_events")
        .upsert(
            {
                hrCalendarEventId: payload.hrCalendarEventId,
                title: payload.title.trim(),
                topic: payload.topic.trim(),
                eventDate: payload.eventDate,
                fromTime: payload.fromTime,
                toTime: payload.toTime,
                roomNo: payload.roomNo.trim(),
                collegeId: payload.collegeId,
                createdBy: collegeHrId,
                createdAt: now,
                updatedAt: now,
            },
            { onConflict: "hrCalendarEventId" },
        )
        .select("hrCalendarEventId")
        .single();

    if (error) {
        console.error("saveHrCalendarEvent error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        hrCalendarEventId: data.hrCalendarEventId,
    };
}


export async function deactivateHrCalendarEvent(hrCalendarEventId: number) {
    const { error } = await supabase
        .from("hr_calendar_events")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("hrCalendarEventId", hrCalendarEventId);

    if (error) {
        console.error("deactivateHrCalendarEvent error:", error);
        return { success: false };
    }

    return { success: true };
}