// lib/helpers/auth/getInternalUserId.ts
import { supabase } from "@/lib/supabaseClient";

export async function getInternalUserId(authUserId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("userId")
    .eq("authUserId", authUserId)
    .single();

  if (error) throw error;

  return data.userId; // ✅ number (111 / 116)
}
