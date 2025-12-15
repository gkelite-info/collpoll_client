import { supabase } from "@/lib/supabaseClient";

export const upsertUser = async (payload: any) => {
  try {
    const { email, password, ...profileData } = payload;

    console.log("Signup Payload:", { email, password, profileData });

    // -------------------------------
    // 1️⃣ Create user in Supabase Auth
    // -------------------------------
    // 1️⃣ Create user in Supabase Auth + SEND EMAIL VERIFICATION
   const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
    emailRedirectTo: "http://localhost:3000/verify-email",
     },
   });

   console.log("Auth Response:", authData, authError);

    if (authError) throw authError;

    const auth_id = authData.user?.id;

    if (!auth_id) {
      throw new Error("Auth ID not generated. Maybe email confirmation is ON?");
    }

    const now = new Date().toISOString();

    // --------------------------------
    // 2️⃣ Insert user profile in table
    //    (SAFE: No .select() or .single())
    // --------------------------------
    const { error: insertError } = await supabase.from("users").insert({
      ...profileData,
      email,
      auth_id,
      createdAt: now,
      updatedAt: now,
    });

    if (insertError) throw insertError;

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error: any) {
    console.error("Upsert User Error:", error.message);

    return {
      success: false,
      error: error.message || "Something went wrong",
    };
  }
};
