import { supabase } from "@/lib/supabaseClient";

export async function getUnreadNotificationCount(userId: number) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId)
    .eq("isRead", false);

  if (error) {
    console.error("getUnreadNotificationCount error:", error);
    return 0;
  }

  return count ?? 0;
}
