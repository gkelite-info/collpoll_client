import { supabase } from "@/lib/supabaseClient";

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

  const { data: colMeeting, error: findError } = await supabase
    .from("college_meetings")
    .select("collegeMeetingId")
    .eq("meetingLink", hrMeeting.meetingLink)
    .eq("date", hrMeeting.meetingDate)
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  if (findError || !colMeeting) {
    console.error(
      "❌ Could not find college_meetings ID for cron job:",
      findError,
    );
    return { success: false, message: "Universal meeting record not found" };
  }

  const { error } = await supabase.from("meeting_remainder_jobs").insert({
    collegeMeetingId: colMeeting.collegeMeetingId,
    meetingType: "CollegeHr",
    runAt,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (error) {
    console.error("❌ meeting_remainder_jobs INSERT ERROR:", error);
    return { success: false, error };
  }
  return { success: true };
}
