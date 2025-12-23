import { supabase } from "@/lib/supabaseClient";

export const upsertUser = async (payload: any) => {
  try {
    const {
      fullName,
      mobile,
      email,
      linkedIn,
      collegeId,
      role,
    } = payload;

    // Inject timestamps
    const now = new Date().toISOString();

    // ----------------------------
    // 🔥 UPSERT into users table
    // ----------------------------
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {        // if row exists → update, else create
          fullName,
          mobile,
          email,
          linkedIn,
          collegeId,
          role: role ?? null,
          updatedAt: now,
          createdAt: now,   
        },
        {
          onConflict: "userId", 
        }
      )
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Personal details saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT PERSONAL DETAILS ERROR:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};
