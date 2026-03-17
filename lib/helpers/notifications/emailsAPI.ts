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
