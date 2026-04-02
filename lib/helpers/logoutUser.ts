import { supabase } from "@/lib/supabaseClient";

export async function logoutUser() {
  try {
    localStorage.clear();
    sessionStorage.clear();
    await supabase.auth.signOut({ scope: 'global' });

    return { success: true };
  } catch (err: any) {
    console.error("Logout error caught:", err);
    return { success: true };
  }
}