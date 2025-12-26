import { supabase } from "@/lib/supabaseClient";

export const upsertAward = async (payload: any) => {
  try {
    const {
      awardId,
      studentId,
      awardName,
      issuedBy,
      dateReceived,
      category,
      description,
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("awards")
      .upsert(
        {
          awardId: awardId ?? undefined, 
          studentId,
          awardName,
          issuedBy,
          dateReceived: convertToISO(dateReceived),
          category: category || null,
          description: description || null,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "awardId" }
      )
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Award saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT AWARD ERROR:", err);
    return { success: false, error: err.message };
  }
};


function convertToISO(dateStr: string) {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.replace(/-/g, "/").split("/");

  return `${year}-${month}-${day}`; 
}
