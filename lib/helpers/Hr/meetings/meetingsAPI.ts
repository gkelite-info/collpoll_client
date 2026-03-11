import { supabase } from "@/lib/supabaseClient";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";

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

const convertToMinutes = (time: string) => {
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
};


// export async function fetchHrMeetings(collegeId: number) {
//     const { data, error } = await supabase
//         .from("hr_meetings")
//         .select(`
//             hrMeetingId,
//             title,
//             agenda,
//             meetingDate,
//             fromTime,
//             toTime,
//             collegeId,
//             createdBy,
//             isActive,
//             createdAt,
//             updatedAt,
//             deletedAt
//         `)
//         .eq("collegeId", collegeId)
//         .eq("isActive", true)
//         .is("deletedAt", null)
//         .order("meetingDate", { ascending: false });

//     if (error) {
//         console.error("fetchHrMeetings error:", error);
//         throw error;
//     }

//     return data ?? [];
// }

// export async function fetchHrMeetingsForLoggedInAdmin(userId: number) {
//     const { collegeId } = await fetchAdminContext(userId);
//     return fetchHrMeetings(collegeId);
// }

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
        userId,
        users (
          fullName
        )
      )
    `, { count: "exact" })
        .eq("createdBy", createdBy)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("is_deleted", false);

    query = query

    const { data, error, count } = await query
        .order("meetingDate", { ascending: type === "upcoming" })
        .order("fromTime", { ascending: type === "upcoming" })
        .range(from, to);

    if (error) throw error;

    const currentMinutes = convertToMinutes(currentTime);

    const filteredMeetings = (data ?? []).filter((meeting: any) => {
        const meetingDate = meeting.meetingDate;
        const meetingEndMinutes = convertToMinutes(meeting.toTime);
        if (type === "upcoming") {
            if (meetingDate > currentDate) return true;
            if (meetingDate === currentDate && meetingEndMinutes > currentMinutes) return true;
            return false;
        }
        if (type === "previous") {
            if (meetingDate < currentDate) return true;
            if (meetingDate === currentDate && meetingEndMinutes <= currentMinutes) return true;
            return false;
        }

        return true;
    });

    const formatted = filteredMeetings.map((meeting: any) => {
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
            participantName:
                participantCount === 1
                    ? participants[0]?.users?.fullName ?? ""
                    : null
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
        if (error) {

            console.error("saveHrMeeting error:", error);

            if (error.code === "23505") {
                return {
                    success: false,
                    message: "A meeting is already scheduled for this time slot. Please choose a different time."
                };
            }

            return { success: false, message: "Failed to create meeting" };
        }
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