import { supabase } from "@/lib/supabaseClient";

export const fetchAdminEducationTypes = async (adminId: number) => {
  try {
    const { data, error } = await supabase
      .from("admin_education_types")
      .select(`
        adminEducationTypeId,
        adminId,
        collegeEducationId,
        college_education (
          collegeEducationId,
          collegeEducationType,
          collegeId
        )
      `)
      .eq("adminId", adminId)
      .eq("isActive", true)
      .eq("is_deleted", false);

    if (error) {
      console.error("Error fetching admin education types:", error);
      return [];
    }

    const educations = data
      ?.map((item: any) => item.college_education)
      .filter(Boolean) || [];

    return educations;
  } catch (error) {
    console.error("Error in fetchAdminEducationTypes:", error);
    return [];
  }
};
