import { supabase } from "@/lib/supabaseClient";

export const upsertUser = async (payload: any) => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const auth_id = authData?.user?.id;

    if (!auth_id) throw new Error("User not authenticated");

    const {
      fullName,
      mobile,
      email,
      linkedIn,
      collegeId,
      role,
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .upsert(
<<<<<<< Updated upstream
        {
          auth_id,
=======
        {       
>>>>>>> Stashed changes
          fullName,
          mobile,
          email,
          linkedIn,
          collegeId,
          role: role ?? null,
          updatedAt: now,
          createdAt: now,
        },
        { onConflict: "auth_id" }   // 👈 IMPORTANT
      )
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "User saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT PERSONAL DETAILS ERROR:", err.message);
    return { success: false, error: err.message };
  }
};



export const fetchUserDetails = async (auth_id: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("fullName, mobile, email, linkedIn, collegeId, role")
      .eq("auth_id", auth_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      user: data ?? null,
    };
  } catch (err: any) {
    console.error("FETCH USER DETAILS ERROR:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};
