import { supabase } from "@/lib/supabaseClient";

export async function createUser(payload: any) {
  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}
