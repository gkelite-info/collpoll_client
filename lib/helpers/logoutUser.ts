import { clearTokens } from "@/app/utils/context/tokenStorage";
import { supabase } from "@/lib/supabaseClient";

export async function logoutUser() {
  try {
    await supabase.auth.signOut();
    clearTokens();

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
