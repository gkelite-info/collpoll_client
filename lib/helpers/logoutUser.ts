import { supabase } from "@/lib/supabaseClient";

export async function logoutUser() {
  try {
    // Clear all client-side storage first
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies by setting them to empty with expiry in the past
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }

    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error("Supabase signOut error:", error);
      // Continue with logout even if signOut fails
    }

    return { success: true };
  } catch (err: any) {
    console.error("Logout error caught:", err);
    // Return success even on error to ensure redirect happens
    return { success: true };
  }
}