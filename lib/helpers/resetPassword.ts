// import { supabase } from "@/lib/supabaseClient";

// export const resetPassword = async (email: string) => {
//   try {
//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select("email")
//       .eq("email", email)
//       .eq("is_deleted", false)
//       .maybeSingle();

//     if (userError) {
//       console.error("Database lookup error:", userError.message);
//       return { success: false, error: "Unable to verify email at this time." };
//     }

//     if (!user) {
//       return {
//         success: false,
//         error: "No account found with this email address.",
//       };
//     }

//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: "http://localhost:3000/reset-password",
//     });

//     if (error) throw error;

//     return {
//       success: true,
//       message: "Password reset email sent successfully",
//     };
//   } catch (error: any) {
//     console.error("Reset Password Error:", error.message);

//     return {
//       success: false,
//       error: error.message || "Failed to send reset email",
//     };
//   }
// };

import { supabase } from "@/lib/supabaseClient";

export const resetPassword = async (email: string, redirectTo?: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to send reset link",
    };
  }
};
