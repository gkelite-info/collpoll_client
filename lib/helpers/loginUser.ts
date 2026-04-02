"use server";

import { headers } from "next/headers";
import { createClient } from "../supabaseServer";

export async function loginUser(email: string, password: string) {
  console.log("🚀 SERVER ACTION STARTED");
  console.log("Is it failing here?");

  try {

    const supabase = await createClient();

    const host = (await headers()).get("host") || "";
    const parts = host.replace(':3000', '').split(".");

    console.log("what is host", host);
    console.log("what is parts", parts);


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

    console.log("what is currentPortal", currentPortal);
    console.log("what is Currentportal error", portalError);


    if (portalError || !currentPortal) {
      return { success: false, error: `Portal for "${subdomain}" is not registered.` };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("what is authData", authData);
    console.log("what is authData error", authError);


    if (authError || !authData.user) {
      return { success: false, error: "Invalid email or password." };
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("userId, fullName, role, collegeId, isActive")
      .eq("auth_id", authData.user.id)
      .maybeSingle();

    console.log("what is userProfile data", userProfile);
    console.log("what is userProfile data error", profileError);


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

    console.log("Do this line runs?");

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