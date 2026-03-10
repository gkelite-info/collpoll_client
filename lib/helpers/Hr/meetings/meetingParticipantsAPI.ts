import { supabase } from "@/lib/supabaseClient";

export type HrMeetingParticipantRow = {
    id: number;
    hrMeetingId: number;
    userId: number;
    userRole: "FACULTY" | "ADMIN" | "FINANCE" | "PLACEMENT";
    notifiedInApp: boolean;
    notifiedEmail: boolean;
    createdAt: string;
};


export async function fetchMeetingParticipants(hrMeetingId: number) {
    const { data, error } = await supabase
        .from("hr_meeting_participants")
        .select(`
      id,
      hrMeetingId,
      userId,
      userRole,
      notifiedInApp,
      notifiedEmail,
      createdAt
    `)
        .eq("hrMeetingId", hrMeetingId)
        .order("id", { ascending: true });

    if (error) {
        console.error("fetchMeetingParticipants error:", error);
        throw error;
    }

    return data ?? [];
}


export async function addMeetingParticipants(
    hrMeetingId: number,
    participants: {
        userId: number;
        userRole: "FACULTY" | "ADMIN" | "FINANCE" | "PLACEMENT";
    }[],
) {
    if (!participants.length) {
        return { success: true };
    }

    const rows = participants.map((p) => ({
        hrMeetingId,
        userId: p.userId,
        userRole: p.userRole,
        notifiedInApp: true,
        notifiedEmail: false,
    }));

    const { error } = await supabase
        .from("hr_meeting_participants")
        .insert(rows);

    if (error) {
        console.error("addMeetingParticipants error:", error);
        return { success: false, error };
    }

    return { success: true };
}


export async function removeMeetingParticipant(
    hrMeetingId: number,
    userId: number,
) {
    const { error } = await supabase
        .from("hr_meeting_participants")
        .delete()
        .eq("hrMeetingId", hrMeetingId)
        .eq("userId", userId);

    if (error) {
        console.error("removeMeetingParticipant error:", error);
        return { success: false };
    }

    return { success: true };
}