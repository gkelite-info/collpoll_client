"use server";

import { headers } from "next/headers";
import { createClient } from "../supabaseServer";

export async function loginUser(email: string, password: string) {
  try {
    const supabase = await createClient();

    // ─────────────────────────────────────────────────────────────
    // Domain / Subdomain Detection
    // ─────────────────────────────────────────────────────────────

    const host = (await headers()).get("host") || "";

    // Remove localhost port if present
    const cleanHost = host.replace(":3000", "");

    // Split hostname
    const parts = cleanHost.split(".");

    // Default college portal
    let subdomain = "GKELITE";

    const isLocalhost = cleanHost.includes("localhost");

    // Detect root domain
    const isRootDomain =
      cleanHost === "tektoncampus.com" ||
      cleanHost === "www.tektoncampus.com" ||
      cleanHost === "localhost";

    // Only extract subdomain if NOT root domain
    if (!isRootDomain) {
      if (isLocalhost) {
        // Example:
        // abc.localhost => abc
        if (parts.length >= 2 && parts[0] !== "localhost") {
          subdomain = parts[0];
        }
      } else {
        // Example:
        // abc.tektoncampus.com => abc
        if (parts.length >= 3 && parts[0] !== "www") {
          subdomain = parts[0];
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Fetch Current Portal
    // ─────────────────────────────────────────────────────────────

    const {
      data: currentPortal,
      error: portalError,
    } = await supabase
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

    // ─────────────────────────────────────────────────────────────
    // Authenticate User
    // ─────────────────────────────────────────────────────────────

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Fetch User Profile
    // ─────────────────────────────────────────────────────────────

    const {
      data: userProfile,
      error: profileError,
    } = await supabase
      .from("users")
      .select("userId, fullName, role, collegeId, isActive")
      .eq("auth_id", authData.user.id)
      .maybeSingle();

    if (!userProfile || profileError) {
      await supabase.auth.signOut();

      return {
        success: false,
        error: "User profile not found.",
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Validate College Access
    // ─────────────────────────────────────────────────────────────

    if (
      Number(userProfile.collegeId) !==
      Number(currentPortal.collegeId)
    ) {
      await supabase.auth.signOut();

      return {
        success: false,
        error:
          "Access Denied: You are not authorized for this specific college portal.",
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Validate Active Status
    // ─────────────────────────────────────────────────────────────

    if (!userProfile.isActive) {
      await supabase.auth.signOut();

      return {
        success: false,
        error: "Your account is inactive.",
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Wellbeing Validation
    // ─────────────────────────────────────────────────────────────

    if (
      userProfile.role === "WellbeingExecutive" ||
      userProfile.role === "WellbeingManager"
    ) {
      const wellbeingRoleType =
        userProfile.role === "WellbeingManager"
          ? "wellbeingManager"
          : "wellbeingExecutive";

      const {
        data: wellbeingAccess,
        error: wellbeingError,
      } = await supabase
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
        await supabase.auth.signOut();

        return {
          success: false,
          error:
            "Access denied: your wellbeing assignment is inactive.",
        };
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Success
    // ─────────────────────────────────────────────────────────────

    return {
      success: true,
      session: authData.session,
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
