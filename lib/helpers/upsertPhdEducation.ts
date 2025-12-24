import { supabase } from "@/lib/supabaseClient";

export const upsertPhdEducation = async (payload: any) => {
  try {
    const {
      phdEducationId,
      studentId,
      universityName,
      researchArea,
      supervisorName,
      startYear,
      endYear,
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("phd_education")
      .upsert(
        {
          phdeducationId: phdEducationId ?? undefined, // exact column name in DB
          studentId,
          universityName,
          researchArea,
          supervisorName,
          startYear: Number(startYear),
          endYear: Number(endYear),
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "phdeducationId" }
      )
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "PhD education saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT PHD EDUCATION ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};
