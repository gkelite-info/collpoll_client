import { supabase } from "@/lib/supabaseClient";

export async function getUserNotifications(userId: number) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getUserNotifications error:", error);
    return [];
  }

  return data ?? [];
}
