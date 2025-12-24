import { supabase } from "@/lib/supabaseClient";

export const upsertPrimaryEducation = async (payload: any) => {
  try {
    const {
      primaryEducationId,
      studentId,
      schoolName,
      board,
      mediumOfStudy,
      yearOfPassing,
      location,
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("primary_education")
      .upsert(
        {
          primaryEducationId: primaryEducationId ?? undefined,
          studentId,
          schoolName,
          board,
          mediumOfStudy,
          yearOfPassing: Number(yearOfPassing),
          location,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "primaryEducationId" }
      )
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Primary education saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT PRIMARY EDUCATION ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};
