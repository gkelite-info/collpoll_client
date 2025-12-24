import { supabase } from "@/lib/supabaseClient";

export const upsertUndergraduateEducation = async (payload: any) => {
  try {
    const {
      undergraduateEducationId,
      studentId,
      courseName,
      specialization,
      collegeName,
      CGPA,
      startYear,
      endYear,
      courseType,
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("undergraduate_education")
      .upsert(
        {
          undergraduateEducationId: undergraduateEducationId ?? undefined,
          studentId,
          courseName,
          specialization,
          collegeName,
          CGPA: Number(CGPA),
          startYear: Number(startYear),
          endYear: Number(endYear),
          courseType,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "undergraduateEducationId" }
      )
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Undergraduate education saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT UNDERGRADUATE EDUCATION ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};
