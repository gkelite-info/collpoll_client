import { supabase } from "@/lib/supabaseClient";

export const upsertLanguages = async (payload: any) => {
  try {
    const {
      languageId,
      studentId,
      languageName,   
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("language")
      .upsert(
        {
          languageId: languageId ?? undefined,   
          studentId,
          languageName,                          
          is_deleted: false,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "studentId"
 }          
      )
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Languages saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT LANGUAGES ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};


export const fetchLanguages = async (studentId: number) => {
  try {
    const { data, error } = await supabase
      .from("language")
      .select("languageName")
      .eq("studentId", studentId)
      .eq("is_deleted", false)
      .single();

    if (error) throw error;

    return {
      success: true,
      languages: data?.languageName ?? []
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
