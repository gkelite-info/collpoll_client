import { supabase } from "@/lib/supabaseClient";

export async function getUserEmails(userId: number) {
  const { data, error } = await supabase
    .from("email_queue")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getUserEmails error:", error);
    return [];
  }

  return data ?? [];
}

export async function getUnreadEmailCount(userId: number) {
  const { count, error } = await supabase
    .from("email_queue")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId)
    .eq("isRead", false);

  if (error) {
    console.error("getUnreadEmailCount error:", error);
    return 0;
  }
  return count ?? 0;
}

export async function markEmailRead(emailQueueId: number) {
  const { error } = await supabase
    .from("email_queue")
    .update({ isRead: true })
    .eq("emailQueueId", emailQueueId);

  if (error) {
    console.error("markEmailRead error:", error);
    return { success: false, error };
  }
  return { success: true };
}
