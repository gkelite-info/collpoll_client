import { supabase } from "@/lib/supabaseClient";

export async function markNotificationRead(notificationId: number) {
  const { error } = await supabase
    .from("notifications")
    .update({ isRead: true })
    .eq("notificationId", notificationId);

  if (error) {
    console.error("markNotificationRead error:", error);
  }
}
