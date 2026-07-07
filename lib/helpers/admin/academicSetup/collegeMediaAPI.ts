import { supabase } from "@/lib/supabaseClient";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export interface CollegeMediaDBPayload {
  collegeMediaId?: number;
  collegeId: number;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  createdBy: number;
}

export const getCollegeMedia = async (collegeId: number) => {
  try {
    const { data, error } = await supabase
      .from("college_media")
      .select("*")
      .eq("collegeId", collegeId)
      .is("deletedAt", null)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is fine initially
      throw error;
    }

    return { success: true, data: data || null };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to fetch college media",
    };
  }
};

export const upsertCollegeMedia = async (payload: CollegeMediaDBPayload) => {
  try {
    const now = new Date().toISOString();

    if (payload.collegeMediaId) {
      const { data, error } = await supabase
        .from("college_media")
        .update({
          logoUrl: payload.logoUrl,
          bannerUrl: payload.bannerUrl,
          updatedAt: now,
        })
        .eq("collegeMediaId", payload.collegeMediaId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from("college_media")
        .insert({
          collegeId: payload.collegeId,
          logoUrl: payload.logoUrl,
          bannerUrl: payload.bannerUrl,
          createdBy: payload.createdBy,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }
  } catch (error: unknown) {
    console.error("upsertCollegeMedia error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to save college media",
    };
  }
};
