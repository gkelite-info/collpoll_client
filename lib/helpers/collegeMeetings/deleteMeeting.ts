import { supabase } from "@/lib/supabaseClient";

export async function deleteMeeting(meetingId: number) {
  const { error } = await supabase
    .from("college_meetings")
    .update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    })
    .eq("collegeMeetingId", meetingId);

  if (error) {
    console.error("deleteMeeting error:", error);
    return { success: false, error };
  }

  return { success: true };
}
