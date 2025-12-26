import { supabase } from "@/lib/supabaseClient";


export async function debugTokens() {
  const { data } = await supabase.auth.getSession();

  if (!data || !data.session) {
    console.log("No session found");
    return;
  }

  console.log(" Access Token:", data.session.access_token);
  console.log(" Refresh Token:", data.session.refresh_token);
  console.log(" Expires At:", new Date((data.session.expires_at || 0) * 1000));
}

export async function checkAccessTokenValidity() {
  const { data } = await supabase.auth.getSession();

  if (!data || !data.session) {
    console.log(" No session available");
    return;
  }

  const expiresAt = (data.session.expires_at || 0) * 1000;
  const now = Date.now();

  if (now < expiresAt) {
    console.log(" Access Token is VALID");
  } else {
    console.log(" Access Token is EXPIRED");
  }
}

export async function testRefreshToken() {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    console.log(" Refresh token failed:", error.message);
    return;
  }

  console.log(" Refresh token succeeded → New session:");
  console.log(data.session);
}

export async function testProtectedQuery() {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.log(" Token invalid or RLS blocked:", error.message);
  } else {
    console.log(" Token is working → Query succeeded:", data);
  }
}
