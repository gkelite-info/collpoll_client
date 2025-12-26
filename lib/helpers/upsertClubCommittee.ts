import { supabase } from "@/lib/supabaseClient";

export const upsertClubCommittee = async (payload: any) => {
  try {
    const {
      clubcommitteeId,
      studentId,
      clubName,
      role,
      fromDate,
      toDate,
      description
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("clubcommittee")
      .upsert(
        {
          clubcommitteeId: clubcommitteeId ?? undefined,
          studentId,
          clubName,
          role,
          fromDate: convertToISO(fromDate),
          toDate: convertToISO(toDate),
          description,
          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "clubcommitteeId" }
      )
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Club/Committee details saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT CLUB COMMITTEE ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};

function convertToISO(dateStr: string) {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}
