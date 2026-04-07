import { supabase } from "@/lib/supabaseClient";

export async function verifyCurrentPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return true;
}

export async function updateUserPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return true;
}

export async function sendPasswordResetEmail(email: string) {
  // Password reset redirects to /settings
  // Middleware will handle role-based redirects based on user's role
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/settings?reset`,
  });

  if (error) throw error;
  return true;
}
