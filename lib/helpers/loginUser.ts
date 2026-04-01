"use server";

import { supabase } from "@/lib/supabaseClient";
import { headers } from "next/headers";

export async function loginUser(email: string, password: string) {
  const host = (await headers()).get("host") || "";
  const subdomain = host.split(".")[0];

  const { data: currentPortal } = await supabase
    .from("colleges")
    .select("collegeId")
    .ilike("collegeCode", subdomain)
    .single();

  if (!currentPortal) {
    return { success: false, error: "This college portal is not registered." };
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { success: false, error: "Invalid email or password." };
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("userId, fullName, role, collegeId, isActive")
    .eq("auth_id", authData.user.id)
    .single();

  if (!userProfile) {
    await supabase.auth.signOut();
    return { success: false, error: "User profile not found." };
  }

  if (Number(userProfile.collegeId) !== Number(currentPortal.collegeId)) {
    await supabase.auth.signOut();

    return {
      success: false,
      error: "Access Denied: You are not authorized to access this specific college portal."
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
}