import { supabase } from "@/lib/supabaseClient";

export type CollegeMeetingRow = {
    collegeMeetingId: number;
    collegeId: number;
    date: string;
    fromTime: string;
    toTime: string;
    meetingLink: string;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchCollegeMeetings(params: {
    collegeId: number;
    type?: "upcoming" | "previous";
    page?: number;
    limit?: number;
}) {
    const {
        collegeId,
        type = "upcoming",
        page = 1,
        limit = 10,
    } = params;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0];

    let query = supabase
        .from("college_meetings")
        .select("*", { count: "exact" })
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (type === "upcoming") {
        query = query.or(
            `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
        );
    } else {
        query = query.or(
            `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
        );
    }

    const { data, error, count } = await query
        .order("date", { ascending: type === "upcoming" })
        .order("fromTime", { ascending: true })
        .range(from, to);

    if (error) throw error;

    const formatted = (data ?? []).map((row) => ({
        id: row.collegeMeetingId.toString(),
        collegeMeetingId: row.collegeMeetingId,
        date: row.date,
        timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
        meetingLink: row.meetingLink,
        type,
    }));

    return {
        data: formatted,
        totalPages: Math.ceil((count ?? 0) / limit),
    };
}

export async function fetchCollegeMeetingById(
    collegeMeetingId: number,
) {
    const { data, error } = await supabase
        .from("college_meetings")
        .select("*")
        .eq("collegeMeetingId", collegeMeetingId)
        .is("deletedAt", null)
        .single();

    if (error) throw error;

    return data as CollegeMeetingRow;
}

export async function saveCollegeMeeting(
    payload: {
        id?: number;
        collegeId: number;
        date: string;
        fromTime: string;
        toTime: string;
        meetingLink: string;
    },
    userId: number,
) {
    const now = new Date().toISOString();

    if (payload.id) {
        const { data, error } = await supabase
            .from("college_meetings")
            .update({
                date: payload.date,
                fromTime: payload.fromTime,
                toTime: payload.toTime,
                meetingLink: payload.meetingLink.trim(),
                updatedAt: now,
            })
            .eq("collegeMeetingId", payload.id)
            .select("collegeMeetingId")
            .single();

        if (error) {
            console.error("updateCollegeMeeting error:", error);
            return { success: false, error };
        }

        return { success: true, collegeMeetingId: data.collegeMeetingId };
    }

    const { data, error } = await supabase
        .from("college_meetings")
        .insert({
            collegeId: payload.collegeId,
            date: payload.date,
            fromTime: payload.fromTime,
            toTime: payload.toTime,
            meetingLink: payload.meetingLink.trim(),
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
        })
        .select("collegeMeetingId")
        .single();

    if (error) {
        console.error("insertCollegeMeeting error:", error);
        return { success: false, error };
    }

    return { success: true, collegeMeetingId: data.collegeMeetingId };
}

export async function deactivateCollegeMeeting(
    collegeMeetingId: number,
) {
    const { error } = await supabase
        .from("college_meetings")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeMeetingId", collegeMeetingId);

    if (error) {
        console.error("deactivateCollegeMeeting error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function checkCollegeMeetingConflict(
    collegeId: number,
    date: string,
    fromTime: string,
    toTime: string,
    excludeMeetingId?: number,
) {
    let query = supabase
        .from("college_meetings")
        .select("collegeMeetingId, fromTime, toTime")
        .eq("collegeId", collegeId)
        .eq("date", date)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (excludeMeetingId) {
        query = query.neq("collegeMeetingId", excludeMeetingId);
    }

    const { data, error } = await query;

    if (error) return { hasConflict: false };

    for (const meeting of data ?? []) {
        if (fromTime < meeting.toTime && toTime > meeting.fromTime) {
            return { hasConflict: true };
        }
    }

    return { hasConflict: false };
}