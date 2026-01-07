import { supabase } from "@/lib/supabaseClient";

export const upsertUser = async (payload: {
  auth_id?: string;
  fullName: string;
  email: string;
  mobile: string;
  linkedIn?: string
  collegeId?: number | null;
  currentCity?: string;
  workStatus?: string;
  role?: string;
}) => {
  try {
    const {
      auth_id,
      fullName,
      mobile,
      email,
      linkedIn,
      collegeId,
      currentCity,
      workStatus,
      role,
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          auth_id,
          fullName,
          mobile,
          email,
          linkedIn,
          collegeId: collegeId ?? null,
          currentCity,
          workStatus,
          role: role ?? null,
          updatedAt: now,
          createdAt: now,
        },
        { onConflict: "auth_id" }
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
      .select("fullName, mobile, email, linkedIn, collegeId, role, currentCity, workStatus")
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
