import { supabase } from "@/lib/supabaseClient";

export type HrMeetingParticipantRow = {
  hrMeetingParticipantId: number;
  hrMeetingId: number;
  userId: number;
  role: "Faculty" | "Admin" | "Finance" | "Placement";
  notifiedInApp: boolean;
  notifiedEmail: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchMeetingParticipants(meetingId: number) {
  const { data, error } = await supabase
    .from("hr_meeting_participants")
    .select(
      `
      userId,
      role,
      users (
        fullName
      )
    `,
    )
    .eq("hrMeetingId", meetingId);

  if (error) throw error;

  return (data ?? []).map((p: any) => {
    return {
      id: p.userId,
      name: p.users?.fullName ?? "Unknown",
      role: p.role,
      branch: "",
      year: "",
      section: "",
    };
  });
}

export async function clearMeetingParticipants(hrMeetingId: number) {
  const { data: hrMeeting } = await supabase
    .from("hr_meetings")
    .select("meetingLink, meetingDate, fromTime")
    .eq("hrMeetingId", hrMeetingId)
    .single();

  await supabase
    .from("hr_meeting_participants")
    .delete()
    .eq("hrMeetingId", hrMeetingId);

  if (hrMeeting) {
    const { data: colMeeting } = await supabase
      .from("college_meetings")
      .select("collegeMeetingId")
      .match({
        meetingLink: hrMeeting.meetingLink,
        date: hrMeeting.meetingDate,
        fromTime: hrMeeting.fromTime,
      })
      .single();

    if (colMeeting) {
      await supabase
        .from("college_meeting_participants")
        .delete()
        .eq("collegeMeetingId", colMeeting.collegeMeetingId);
    }
  }
  return { success: true };
}

export async function addMeetingParticipants(
  hrMeetingId: number,
  participants: {
    userId: number;
    role: "Faculty" | "Admin" | "Finance" | "Placement";
    notifiedInApp: boolean;
    notifiedEmail: boolean;
  }[],
) {
  if (!participants.length) return { success: true };
  const now = new Date().toISOString();

  const hrRows = participants.map((p) => ({
    hrMeetingId,
    userId: p.userId,
    role: p.role,
    notifiedInApp: p.notifiedInApp,
    notifiedEmail: p.notifiedEmail,
    createdAt: now,
    updatedAt: now,
  }));

  const { error: hrError } = await supabase
    .from("hr_meeting_participants")
    .insert(hrRows);
  if (hrError) return { success: false, error: hrError };

  const { data: hrMeeting } = await supabase
    .from("hr_meetings")
    .select("meetingLink, meetingDate, fromTime")
    .eq("hrMeetingId", hrMeetingId)
    .single();

  if (hrMeeting) {
    const { data: colMeeting } = await supabase
      .from("college_meetings")
      .select("collegeMeetingId")
      .match({
        meetingLink: hrMeeting.meetingLink,
        date: hrMeeting.meetingDate,
        fromTime: hrMeeting.fromTime,
      })
      .single();

    if (colMeeting) {
      const colRows = participants.map((p) => ({
        collegeMeetingId: colMeeting.collegeMeetingId,
        userId: p.userId,
        role: p.role,
        notifiedInApp: p.notifiedInApp,
        notifiedEmail: p.notifiedEmail,
        createdAt: now,
        updatedAt: now,
      }));
      await supabase.from("college_meeting_participants").insert(colRows);
    }
  }

  return { success: true };
}
