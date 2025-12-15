import { supabase } from "@/lib/supabaseClient";
import { clearTokens } from "./tokenStorage";

export async function logoutUser() {
  try {
    await supabase.auth.signOut();
    clearTokens();

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
