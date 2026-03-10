import { supabase } from "@/lib/supabaseClient";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";

export type HrMeetingRow = {
    hrMeetingId: number;
    collegeHrId: number;
    title: string;
    agenda: string;
    meetingDate: string;
    fromTime: string;
    toTime: string;
    collegeId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchHrMeetings(collegeId: number) {
    const { data, error } = await supabase
        .from("hr_meetings")
        .select(`
      hrMeetingId,
      collegeHrId,
      title,
      agenda,
      meetingDate,
      fromTime,
      toTime,
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
        .order("meetingDate", { ascending: false });

    if (error) {
        console.error("fetchHrMeetings error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchHrMeetingsForLoggedInAdmin(userId: number) {
    const { collegeId } = await fetchAdminContext(userId);
    return fetchHrMeetings(collegeId);
}


export async function saveHrMeeting(
    payload: {
        hrMeetingId?: number;
        collegeHrId: number;
        title: string;
        agenda: string;
        meetingDate: string;
        fromTime: string;
        toTime: string;
        collegeId: number;
    },
    userId: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("hr_meetings")
        .upsert(
            {
                hrMeetingId: payload.hrMeetingId,
                collegeHrId: payload.collegeHrId,
                title: payload.title.trim(),
                agenda: payload.agenda.trim(),
                meetingDate: payload.meetingDate,
                fromTime: payload.fromTime,
                toTime: payload.toTime,
                collegeId: payload.collegeId,
                createdBy: userId,
                createdAt: now,
                updatedAt: now,
            },
            { onConflict: "hrMeetingId" },
        )
        .select("hrMeetingId")
        .single();

    if (error) {
        console.error("saveHrMeeting error:", error);
        return { success: false, error };
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