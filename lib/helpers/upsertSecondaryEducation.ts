import { supabase } from "@/lib/supabaseClient";

export const upsertSecondaryEducation = async (payload: any) => {
  try {
    const {
      secondaryEducationId,
      studentId,
      institutionName,
      board,
      mediumOfStudy,
      yearOfPassing,
      percentage,
      location,
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("secondary_education")
      .upsert(
        {
          secondaryEducationId: secondaryEducationId ?? undefined,
          studentId,
          institutionName,
          board,
          mediumOfStudy,
          yearOfPassing: Number(yearOfPassing),
          percentage: Number(percentage),
          location,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "secondaryEducationId" }
      )
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Secondary education saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT SECONDARY EDUCATION ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};
