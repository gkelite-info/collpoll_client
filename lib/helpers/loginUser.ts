import { supabase } from "@/lib/supabaseClient";

export async function loginUser(email: string, password: string) {
  try {
    // Login using Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const session = authData.session;
    const user = authData.user;

    if (!session) {
      return { success: false, error: "Login failed: No session returned" };
    }

    const auth_id = user?.id;

    // Fetch user profile from your custom table
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", auth_id)
      .single();

    if (error || !profile)
      return { success: false, error: "User profile not found" };

    // Return profile + tokens
    return {
      success: true,
      user: profile,
      tokens: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
      },
    };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
