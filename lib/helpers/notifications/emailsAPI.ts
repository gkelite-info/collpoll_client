import { supabase } from "@/lib/supabaseClient";

export async function getUserEmails(userId: number, userEmail: string) {
  const { data, error } = await supabase
    .from("email_queue")
    .select("*")
    .or(`userId.eq.${userId},senderAddress.eq.${userEmail}`)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
  return data || [];
}

export async function getUnreadEmailCount(userId: number) {
  const { count, error } = await supabase
    .from("email_queue")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId)
    .eq("isRead", false)
    .not("senderName", "is", null);

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
