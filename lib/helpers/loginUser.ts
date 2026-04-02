"use server";

import { supabase } from "@/lib/supabaseClient";
import { headers } from "next/headers";

export async function loginUser(email: string, password: string) {
  try {
    const host = (await headers()).get("host") || "";
    const parts = host.replace(':3000', '').split(".");

    // Logic: If there's no subdomain (like localhost:3000), use "GK"
    let subdomain = "GK";
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      subdomain = parts[0];
    }

    // Use .maybeSingle() instead of .single() to prevent crashing if not found
    const { data: currentPortal, error: portalError } = await supabase
      .from("colleges")
      .select("collegeId")
      .ilike("collegeCode", subdomain)
      .maybeSingle();

    if (portalError || !currentPortal) {
      return { success: false, error: `Portal for "${subdomain}" is not registered.` };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: "Invalid email or password." };
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("userId, fullName, role, collegeId, isActive")
      .eq("auth_id", authData.user.id)
      .maybeSingle();

    if (!userProfile || profileError) {
      await supabase.auth.signOut();
      return { success: false, error: "User profile not found." };
    }

    // Comparison logic
    if (Number(userProfile.collegeId) !== Number(currentPortal.collegeId)) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Access Denied: You are not authorized for this specific college portal."
      };
    }

    if (!userProfile.isActive) {
      await supabase.auth.signOut();
      return { success: false, error: "Your account is inactive." };
    }

    return {
      success: true,
      session: authData.session,
      user: userProfile,
    };

  } catch (err) {
    console.error("Login Server Action Error:", err);
    return { success: false, error: "An unexpected server error occurred." };
  }
}