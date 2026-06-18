"use server";

import { headers } from "next/headers";
import { createClient } from "../supabaseServer";

export async function loginUser(email: string, password: string) {
  try {
    const supabase = await createClient();

    const host = (await headers()).get("host") || "";

    const cleanHost = host.replace(":3000", "");

    const parts = cleanHost.split(".");

    let subdomain = "GKELITE";

    const isLocalhost = cleanHost.includes("localhost");

    const isRootDomain =
      cleanHost === "tektoncampus.com" ||
      cleanHost === "www.tektoncampus.com" ||
      cleanHost === "localhost";

    if (!isRootDomain) {
      if (isLocalhost) {
        if (parts.length >= 2 && parts[0] !== "localhost") {
          subdomain = parts[0];
        }
      } else {
        if (parts.length >= 3 && parts[0] !== "www") {
          subdomain = parts[0];
        }
      }
    }

    if (
      cleanHost === "tektoncampus.com" ||
      cleanHost === "www.tektoncampus.com"
    ) {
      subdomain = "GKELITE";
    }

    const { data: currentPortal, error: portalError } = await supabase
      .from("colleges")
      .select("collegeId")
      .ilike("collegeCode", subdomain)
      .maybeSingle();

    if (portalError || !currentPortal) {
      return {
        success: false,
        error: `Portal for "${subdomain}" is not registered.`,
      };
    }

    // --- NEW CUSTOM AUTH ---
    const {
      data: userProfile,
      error: profileError,
    } = await supabase
      .from("users")
      .select("userId, fullName, role, collegeId, isActive, password")
      .eq("email", email)
      .maybeSingle();

    if (!userProfile || profileError) {
      return {
        success: false,
        error: "User profile not found.",
      };
    }

    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.compare(password, userProfile.password || "");

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    // Set the custom session cookie for testing
    const { setTestingSession } = await import("./testingAuth");
    await setTestingSession(email);

    if (
      Number(userProfile.collegeId) !==
      Number(currentPortal.collegeId)
    ) {
      // await supabase.auth.signOut();

      return {
        success: false,
        error:
          "Access Denied: You are not authorized for this specific college portal.",
      };
    }

    if (!userProfile.isActive) {
      // await supabase.auth.signOut();

      return {
        success: false,
        error: "Your account is inactive.",
      };
    }

    if (
      userProfile.role === "WellbeingExecutive" ||
      userProfile.role === "WellbeingManager"
    ) {
      const wellbeingRoleType =
        userProfile.role === "WellbeingManager"
          ? "wellbeingManager"
          : "wellbeingExecutive";

      const { data: wellbeingAccess, error: wellbeingError } = await supabase
        .from("well_beings")
        .select("wellBeingId")
        .eq("userId", userProfile.userId)
        .eq("collegeId", userProfile.collegeId)
        .eq("roleType", wellbeingRoleType)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .limit(1);

      if (wellbeingError || !wellbeingAccess?.length) {
        // await supabase.auth.signOut();

        return {
          success: false,
          error: "Access denied: your wellbeing assignment is inactive.",
        };
      }
    }

    return {
      success: true,
      session: { user: userProfile },
      user: userProfile,
    };
  } catch (err) {
    console.error("Login Server Action Error:", err);

    return {
      success: false,
      error: "An unexpected server error occurred.",
    };
  }
}
