import { supabase } from "@/lib/supabaseClient";


export async function debugTokens() {
  const { data } = await supabase.auth.getSession();

  if (!data || !data.session) {
    return;
  }

}

export async function checkAccessTokenValidity() {
  const { data } = await supabase.auth.getSession();

  if (!data || !data.session) {
    return;
  }

  const expiresAt = (data.session.expires_at || 0) * 1000;
  const now = Date.now();
}

export async function testRefreshToken() {
  await supabase.auth.refreshSession();
}

export async function testProtectedQuery() {
  await supabase.from("users").select("*");
}
