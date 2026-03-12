import { supabase } from "@/lib/supabaseClient";

export type HrMeetingRow = {
    hrMeetingId: number;
    title: string;
    agenda: string;
    meetingDate: string;
    fromTime: string;
    toTime: string;
    meetingLink: string;
    collegeId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchHrMeetings({
    createdBy,
    collegeId,
    type = "upcoming",
    page = 1,
    limit = 10,
    currentDate,
    currentTime
}: {
    createdBy: number;
    collegeId: number;
    type?: "upcoming" | "previous";
    page?: number;
    limit?: number;
    currentDate: string;
    currentTime: string;
}) {

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from("hr_meetings")
        .select(`
      hrMeetingId,
      title,
      agenda,
      meetingDate,
      fromTime,
      toTime,
      meetingLink,
      hr_meeting_participants (
        userId
      )
    `, { count: "exact" })
        .eq("createdBy", createdBy)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("is_deleted", false);

    query = query

    if (type === "upcoming") {
        query = query.or(
            `meetingDate.gt.${currentDate},and(meetingDate.eq.${currentDate},toTime.gt.${currentTime})`
        );
    }
    if (type === "previous") {
        query = query.or(
            `meetingDate.lt.${currentDate},and(meetingDate.eq.${currentDate},toTime.lte.${currentTime})`
        );
    }

    const { data, error, count } = await query
        .order("meetingDate", { ascending: type === "upcoming" })
        .order("fromTime", { ascending: type === "upcoming" })
        .range(from, to);

    if (error) throw error;

    const formatted = (data ?? []).map((meeting: any) => {
        const participants = meeting.hr_meeting_participants || [];
        const participantCount = participants.length;
        return {
            id: meeting.hrMeetingId,
            hrMeetingId: meeting.hrMeetingId,
            hrSectionsId: null,
            category: "Hr",
            title: meeting.title,
            description: meeting.agenda,
            date: meeting.meetingDate,
            timeRange: `${meeting.fromTime} - ${meeting.toTime}`,
            meetingLink: meeting.meetingLink || "",
            participants: participantCount,
            educationType: "",
            branch: "",
            year: "",
            section: "",
            tags: "",
            participantName: null
        };
    });

    return {
        data: formatted,
        totalPages: Math.ceil((count ?? 0) / limit)
    };
}


export async function saveHrMeeting(
    payload: {
        title: string;
        agenda: string;
        meetingDate: string;
        fromTime: string;
        toTime: string;
        meetingLink: string;
        collegeId: number;
    },
    collegeHrId: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("hr_meetings")
        .upsert(
            {
                title: payload.title.trim(),
                agenda: payload.agenda.trim(),
                meetingDate: payload.meetingDate,
                fromTime: payload.fromTime,
                toTime: payload.toTime,
                meetingLink: payload.meetingLink.trim(),
                collegeId: payload.collegeId,
                createdBy: collegeHrId,
                createdAt: now,
                updatedAt: now,
            },
            { onConflict: "hrMeetingId" },
        )
        .select("hrMeetingId")
        .single();

    if (error) {

        // ✅ Expected conflict error
        if (error.code === "23505") {
            console.log("Meeting conflict detected");

            return {
                success: false,
                message: "A meeting is already scheduled for this time slot. Please choose a different time."
            };
        }

        // ❗ Unexpected error
        console.error("saveHrMeeting unexpected error:", error);

        return {
            success: false,
            message: "Failed to create meeting"
        };
    }

    return {
        success: true,
        hrMeetingId: data.hrMeetingId,
    };
}


export async function deactivateHrMeeting(hrMeetingId: number) {
    const { error } = await supabase
        .from("hr_meetings")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("hrMeetingId", hrMeetingId);

    if (error) {
        console.error("deactivateHrMeeting error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function updateHrMeeting(
    hrMeetingId: number,
    payload: {
        title: string;
        agenda: string;
        meetingDate: string;
        fromTime: string;
        toTime: string;
        meetingLink: string;
    }
) {

    console.log("updateHrMeeting called");
    console.log("Meeting ID:", hrMeetingId);
    console.log("Payload:", payload);

    const updatePayload = {
        title: payload.title.trim(),
        agenda: payload.agenda.trim(),
        meetingDate: payload.meetingDate,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        meetingLink: payload.meetingLink.trim(),
        updatedAt: new Date().toISOString(),
    };

    console.log("Final Update Payload:", updatePayload);

    const { data, error } = await supabase
        .from("hr_meetings")
        .update(updatePayload)
        .eq("hrMeetingId", hrMeetingId)
        .select();

    console.log("Supabase response data:", data);

    if (error) {

        console.error("updateHrMeeting error:", error);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        console.error("Error code:", error.code);

        // ✅ Detect duplicate meeting slot
        if (error.code === "23505") {
            return {
                success: false,
                message: "A meeting is already scheduled for this time slot.",
                error
            };
        }

        return {
            success: false,
            message: "Failed to update meeting",
            error
        };
    }
    console.log("Meeting updated successfully");

    return { success: true };
}