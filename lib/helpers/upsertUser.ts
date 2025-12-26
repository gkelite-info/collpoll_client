import { supabase } from "@/lib/supabaseClient";

export const upsertUser = async (payload: any) => {
  try {
    const {
      auth_id,
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
      .insert(
        {
          auth_id,
          fullName,
          mobile,
          email,
          linkedIn,
          collegeId,
          role: role ?? null,
          updatedAt: now,
          createdAt: now,
        },
      )
      .select()
      .single();  


    if (error) throw error;
    return {
      success: true,
      message: "User created successfully",
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
