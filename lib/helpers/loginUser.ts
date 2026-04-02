"use server";

import { headers } from "next/headers";
import { createClient } from "../supabaseServer";

export async function loginUser(email: string, password: string) {
  try {

    const supabase = await createClient();

    const host = (await headers()).get("host") || "";
    const parts = host.replace(':3000', '').split(".");

    let subdomain = "GK";

    const isLocalhost = host.includes('localhost');

    if (isLocalhost) {
      if (parts.length >= 2 && parts[0] !== 'localhost') {
        subdomain = parts[0];
      }
    } else {
      if (parts.length >= 3 && parts[0] !== 'www') {
        subdomain = parts[0];
      }
    }

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