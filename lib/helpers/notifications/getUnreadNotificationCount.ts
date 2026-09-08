import { supabase } from "@/lib/supabaseClient";
import { createQueryError } from "@/lib/helpers/queryError";

export async function getUnreadNotificationCount(userId: number) {
  const { count, error, status, statusText } = await supabase
    .from("notifications")
    .select("userId", { count: "exact" })
    .eq("userId", userId)
    .eq("isRead", false)
    .limit(1);

  if (error) {
    throw createQueryError("getUnreadNotificationCount", error, status, statusText);
  }

  return count ?? 0;
}
