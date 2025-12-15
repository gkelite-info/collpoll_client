import { supabase } from "@/lib/supabaseClient";

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    });

    if (error) throw error;

    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  } catch (error: any) {
    console.error("Reset Password Error:", error.message);

    return {
      success: false,
      error: error.message || "Failed to send reset email",
    };
  }
};
