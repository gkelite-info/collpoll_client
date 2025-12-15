import { supabase } from "@/lib/supabaseClient";

export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update password",
    };
  }
};
