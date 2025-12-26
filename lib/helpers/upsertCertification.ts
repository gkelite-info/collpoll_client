import { supabase } from "@/lib/supabaseClient";

export const upsertCertification = async (payload: any) => {
  try {
    const {
      certificateId,
      studentId,
      certificationName,
      certification_completionId,
      certificateLink,
      uploadCertificate,
      startDate,
      endDate
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("certifications")
      .upsert(
        {
          certificateId: certificateId ?? undefined,
          studentId,
          certificationName,
          certification_completionId,
          certificateLink,
          uploadCertificate: uploadCertificate ?? null,

          startDate: convertToIntDate(startDate),
          endDate: convertToIntDate(endDate),

          createdAt: now,
          updatedAt: now,
        },
        { onConflict: "certificateId" }
      )
      .select();

    if (error) throw error;

    return { success: true, message: "Certification saved", data };
  } catch (err: any) {
    console.error("UPSERT CERTIFICATION ERROR:", err);
    return { success: false, error: err.message };
  }
};

function convertToIntDate(dateStr: string) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const cleaned = dateStr.replace(/-/g, "/");
  const [day, month, year] = cleaned.split("/");

  return Number(`${year}${month}${day}`); // 20230612
}
