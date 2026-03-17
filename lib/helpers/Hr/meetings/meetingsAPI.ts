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
  currentTime,
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
    .select(
      `
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
    `,
      { count: "exact" },
    )
    .eq("createdBy", createdBy)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("is_deleted", false);

  if (type === "upcoming") {
    query = query.or(
      `meetingDate.gt.${currentDate},and(meetingDate.eq.${currentDate},toTime.gt.${currentTime})`,
    );
  }
  if (type === "previous") {
    query = query.or(
      `meetingDate.lt.${currentDate},and(meetingDate.eq.${currentDate},toTime.lte.${currentTime})`,
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
      participantName: null,
    };
  });

  return {
    data: formatted,
    totalPages: Math.ceil((count ?? 0) / limit),
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
  userId: number,
) {
  const now = new Date().toISOString();

  const { data: hrData, error: hrError } = await supabase
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

  if (hrError) {
    if (hrError.code === "23505") {
      return {
        success: false,
        message: "A meeting is already scheduled for this time slot.",
      };
    }
    return { success: false, message: "Failed to create HR meeting" };
  }

  const { error: colError } = await supabase.from("college_meetings").insert({
    collegeId: payload.collegeId,
    title: payload.title.trim(),
    description: payload.agenda.trim(),
    date: payload.meetingDate,
    fromTime: payload.fromTime,
    toTime: payload.toTime,
    meetingLink: payload.meetingLink.trim(),
    createdBy: userId,
    isActive: true,
    is_deleted: false,
    createdAt: now,
    updatedAt: now,
  });

  if (colError) console.error("❌ college_meetings INSERT ERROR:", colError);

  return { success: true, hrMeetingId: hrData.hrMeetingId };
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
  },
) {
  const now = new Date().toISOString();

  const { data: oldMeeting } = await supabase
    .from("hr_meetings")
    .select("meetingLink, meetingDate, fromTime")
    .eq("hrMeetingId", hrMeetingId)
    .single();

  const updatePayload = {
    title: payload.title.trim(),
    agenda: payload.agenda.trim(),
    meetingDate: payload.meetingDate,
    fromTime: payload.fromTime,
    toTime: payload.toTime,
    meetingLink: payload.meetingLink.trim(),
    updatedAt: now,
  };

  const { error: hrError } = await supabase
    .from("hr_meetings")
    .update(updatePayload)
    .eq("hrMeetingId", hrMeetingId);

  if (hrError)
    return {
      success: false,
      message: "Failed to update meeting",
      error: hrError,
    };

  if (oldMeeting) {
    const { error: colError } = await supabase
      .from("college_meetings")
      .update({
        title: payload.title.trim(),
        description: payload.agenda.trim(),
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        meetingLink: payload.meetingLink.trim(),
        updatedAt: now,
      })
      .match({
        meetingLink: oldMeeting.meetingLink,
        date: oldMeeting.meetingDate,
        fromTime: oldMeeting.fromTime,
      });

    if (colError) console.error("❌ college_meetings UPDATE ERROR:", colError);
  }

  return { success: true };
}

export async function deactivateHrMeeting(hrMeetingId: number) {
  const now = new Date().toISOString();

  const { data: hrData, error: hrError } = await supabase
    .from("hr_meetings")
    .update({ isActive: false, is_deleted: true, deletedAt: now })
    .eq("hrMeetingId", hrMeetingId)
    .select("meetingLink, meetingDate, fromTime")
    .single();

  if (hrError) return { success: false };

  if (hrData) {
    await supabase
      .from("college_meetings")
      .update({ isActive: false, deletedAt: now })
      .match({
        meetingLink: hrData.meetingLink,
        date: hrData.meetingDate,
        fromTime: hrData.fromTime,
      });
  }

  return { success: true };
}

export async function scheduleMeetingReminder(
  hrMeetingId: number,
  meetingDate: string,
  fromTime24: string,
  reminderMinutes: number,
) {
  const meetingDateTime = new Date(`${meetingDate}T${fromTime24}`);
  const runAt = new Date(
    meetingDateTime.getTime() - reminderMinutes * 60000,
  ).toISOString();

  const { data: hrMeeting } = await supabase
    .from("hr_meetings")
    .select("meetingLink, meetingDate, fromTime")
    .eq("hrMeetingId", hrMeetingId)
    .single();

  if (!hrMeeting) return { success: false, message: "Meeting not found" };

  const { data: colMeeting } = await supabase
    .from("college_meetings")
    .select("collegeMeetingId")
    .match({
      meetingLink: hrMeeting.meetingLink,
      date: hrMeeting.meetingDate,
      fromTime: hrMeeting.fromTime,
    })
    .single();

  if (!colMeeting)
    return { success: false, message: "Universal meeting record not found" };

  const { error } = await supabase.from("meeting_remainder_jobs").insert({
    meetingId: colMeeting.collegeMeetingId,
    meetingType: "CollegeHr",
    runAt,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (error) return { success: false, error };
  return { success: true };
}
