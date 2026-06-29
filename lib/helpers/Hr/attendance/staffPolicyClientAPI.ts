import { supabase } from "@/lib/supabaseClient";

export const getStaffPolicyClient = async (collegeId: number) => {
  try {
    const { data, error } = await supabase
      .from("staff_attendance_policies")
      .select("*")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching staff policy:", error);
    return { success: false, error: error.message };
  }
};
