import { supabase } from "@/lib/supabaseClient";
import { CalendarEventType, Department, Section, Semester, UiNamedItem } from "./types";
import { adminNormalizeWithUUID, normalizeWithUUID } from "@/app/utils/jsonWithUuid";

export const upsertCalendarEvent = async (payload: {
    facultyId: number | null;
    eventTitle: string;
    eventTopic: string;
    type: CalendarEventType;
    date: string;
    roomNo: string;
    fromTime: string;
    toTime: string;
    degree: string;
    department: UiNamedItem[];
    year: string;
    semester: UiNamedItem[];
    section: UiNamedItem[];
}) => {
    try {

        if (payload.fromTime >= payload.toTime) {
            throw new Error("From time must be earlier than To time");
        }
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from("calendarEvent")
            .insert(
                {
                    facultyId: payload.facultyId,
                    eventTitle: payload.eventTitle,
                    eventTopic: payload.eventTopic,
                    type: payload.type,
                    date: payload.date,
                    roomNo: payload.roomNo,
                    fromTime: payload.fromTime,
                    toTime: payload.toTime,
                    degree: payload.degree,

                    department: adminNormalizeWithUUID(payload.department),
                    semester: adminNormalizeWithUUID(payload.semester),
                    section: adminNormalizeWithUUID(payload.section),

                    year: payload.year,
                    createdAt: now,
                    updatedAt: now,

                },
            )
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            message: "Calendar event saved successfully",
            data,
        };
    } catch (err: any) {
        console.error("UPSERT CALENDAR EVENT ERROR:", err.message);
        return {
            success: false,
            error: err.message || "Failed to save calendar event",
        };
    }
};

export const upsertCalendarEventAdmin = async (payload: {
    facultyId: number | null;
    eventTitle: string;
    eventTopic: string;
    type: CalendarEventType;
    date: string;
    roomNo: string;
    fromTime: string;
    toTime: string;
    degree: string;
    department: UiNamedItem[];
    year: string;
    semester: UiNamedItem[];
    section: UiNamedItem[];
}) => {
    try {

        if (payload.fromTime >= payload.toTime) {
            throw new Error("From time must be earlier than To time");
        }
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from("calendarEvent")
            .insert(
                {
                    facultyId: payload.facultyId,
                    eventTitle: payload.eventTitle,
                    eventTopic: payload.eventTopic,
                    type: payload.type,
                    date: payload.date,
                    roomNo: payload.roomNo,
                    fromTime: payload.fromTime,
                    toTime: payload.toTime,
                    degree: payload.degree,

                    department: adminNormalizeWithUUID(payload.department),
                    semester: adminNormalizeWithUUID(payload.semester),
                    section: adminNormalizeWithUUID(payload.section),

                    year: payload.year,
                    createdAt: now,
                    updatedAt: now,

                },
            )
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            message: "Calendar event saved successfully",
            data,
        };
    } catch (err: any) {
        console.error("UPSERT CALENDAR EVENT ERROR:", err.message);
        return {
            success: false,
            error: err.message || "Failed to save calendar event",
        };
    }
};


export const fetchCalendarEventsByFaculty = async (facultyId: number) => {
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
                semester: normalizeWithUUID(payload.semester),
                department: normalizeWithUUID(payload.department),
                section: normalizeWithUUID(payload.section),
                updatedAt: now,
            })
            .eq("calendarEventId", calendarEventId);

        if (error) throw error;

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};

export const updateCalendarEventAdmin = async (
    calendarEventId: number,
    payload: any
) => {
    try {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from("calendarEvent")
            .update({
                ...payload,
                semester: adminNormalizeWithUUID(payload.semester),
                department: adminNormalizeWithUUID(payload.department),
                section: adminNormalizeWithUUID(payload.section),
                updatedAt: now,
            })
            .eq("calendarEventId", calendarEventId);

        if (error) throw error;

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};