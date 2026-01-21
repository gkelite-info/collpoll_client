import { supabase } from "@/lib/supabaseClient";
import { CalendarEventType, Department, Section, Semester } from "./types";
import { normalizeUUID, normalizeWithUUID } from "@/app/utils/jsonWithUuid";

type FetchCalendarEventsResult =
    | { success: true; events: any[] }
    | { success: false; error: string };


// export const upsertCalendarEvent = async (payload: {
//     facultyId: number | null;
//     eventTitle: string;
//     eventTopic: string;
//     type: CalendarEventType;
//     date: string;
//     roomNo: string;
//     fromTime: string;
//     toTime: string;
//     degree: string;
//     department: Department[];
//     year: string;
//     semester: Semester[];
//     section: Section[];
// }) => {
//     try {

//         if (payload.fromTime >= payload.toTime) {
//             throw new Error("From time must be earlier than To time");
//         }
//         const now = new Date().toISOString();

//         const { data, error } = await supabase
//             .from("calendarEvent")
//             .insert(
//                 {
//                     facultyId: payload.facultyId,
//                     eventTitle: payload.eventTitle,
//                     eventTopic: payload.eventTopic,
//                     type: payload.type,
//                     date: payload.date,
//                     roomNo: payload.roomNo,
//                     fromTime: payload.fromTime,
//                     toTime: payload.toTime,
//                     degree: payload.degree,

//                     department: normalizeWithUUID(payload.department),
//                     semester: normalizeWithUUID(payload.semester),
//                     section: normalizeWithUUID(payload.section),

//                     year: payload.year,
//                     createdAt: now,
//                     updatedAt: now,

//                 },
//             )
//             .select()
//             .single();

//         if (error) throw error;

//         return {
//             success: true,
//             message: "Calendar event saved successfully",
//             data,
//         };
//     } catch (err: any) {
//         console.error("UPSERT CALENDAR EVENT ERROR:", err.message);
//         return {
//             success: false,
//             error: err.message || "Failed to save calendar event",
//         };
//     }
// };


export const upsertCalendarEvent = async (
    payload: {
        facultyId: number | null;
        eventTitle: string;
        eventTopic: string;
        type: CalendarEventType;
        date: string;
        roomNo: string;
        fromTime: string;
        toTime: string;
        degree: string;
        department: Department[];
        year: string;
        semester: Semester[];
        section: Section[];
    },
    calendarEventId?: number
) => {
    try {
        if (payload.fromTime >= payload.toTime) {
            throw new Error("From time must be earlier than To time");
        }

        const now = new Date().toISOString();

        const baseData = {
            facultyId: payload.facultyId,
            eventTitle: payload.eventTitle,
            eventTopic: payload.eventTopic,
            type: payload.type,
            date: payload.date,
            roomNo: payload.roomNo,
            fromTime: payload.fromTime,
            toTime: payload.toTime,
            degree: payload.degree,
            department: normalizeWithUUID(payload.department),
            semester: normalizeWithUUID(payload.semester),
            section: normalizeWithUUID(payload.section),
            year: payload.year,
            updatedAt: now,
        };

        // 🔄 UPDATE
        if (calendarEventId) {
            const { data, error } = await supabase
                .from("calendarEvent")
                .update(baseData)
                .eq("calendarEventId", calendarEventId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        }

        // ➕ INSERT
        const { data, error } = await supabase
            .from("calendarEvent")
            .insert({
                ...baseData,
                createdAt: now,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };

    } catch (err: any) {
        return { success: false, error: err.message };
    }
};


export const fetchCalendarEventsByFaculty = async (facultyId: number): Promise<FetchCalendarEventsResult> => {
    try {
        const { data, error } = await supabase
            .from("calendarEvent")
            .select("*")
            .eq("facultyId", facultyId)
            .eq("is_deleted", false)
            .order("date", { ascending: true });

        if (error) throw error;

        return {
            success: true,
            events: data ?? [],
        };
    } catch (err: any) {
        console.error("FETCH CALENDAR EVENTS ERROR:", err.message);
        return {
            success: false,
            error: err.message,
        };
    }
};

export const fetchCalendarEventById = async (calendarEventId: number) => {
    try {
        const { data, error } = await supabase
            .from("calendarEvent")
            .select("*")
            .eq("calendarEventId", calendarEventId)
            .single();

        if (error) throw error;

        return {
            success: true,
            event: data,
        };
    } catch (err: any) {
        console.error("FETCH CALENDAR EVENT ERROR:", err.message);
        return {
            success: false,
            error: err.message,
        };
    }
};

export const deleteCalendarEventByFaculty = async (
    calendarEventId: number,
    facultyId: number
) => {
    try {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from("calendarEvent")
            .delete()
            .eq("calendarEventId", calendarEventId)
            .eq("facultyId", facultyId);

        if (error) throw error;

        return { success: true };
    } catch (err: any) {
        console.error("DELETE CALENDAR EVENT ERROR:", err.message);
        return {
            success: false,
            error: err.message,
        };
    }
};


export const deleteCalendarEvent = async (calendarEventId: number) => {
    try {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from("calendarEvent")
            .update({
                is_deleted: true,
                deletedAt: now,
                updatedAt: now,
            })
            .eq("calendarEventId", calendarEventId);

        if (error) throw error;

        return { success: true };
    } catch (err: any) {
        console.error("DELETE CALENDAR EVENT ERROR:", err.message);
        return {
            success: false,
            error: err.message,
        };
    }
};

export const updateCalendarEvent = async (
    calendarEventId: number,
    payload: any
) => {
    try {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from("calendarEvent")
            .update({
                ...payload,
                semester: normalizeUUID(payload.semester),
                department: normalizeUUID(payload.department),
                section: normalizeUUID(payload.section),
                updatedAt: now,
            })
            .eq("calendarEventId", calendarEventId);

        if (error) throw error;

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};