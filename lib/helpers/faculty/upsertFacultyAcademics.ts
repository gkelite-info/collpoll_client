import { supabase } from "@/lib/supabaseClient";

export type FacultyAcademicsUpsertPayload = {
  facultyAcademicsId?: number;
  facultyId: number;

  subjectName: string;
  department: string;
  academicYear: string;
  section: string;
  semester: string;

  unitName: string;
  unitNumber: number;
  topics: string[];
};

export async function upsertFacultyAcademics(
  payload: FacultyAcademicsUpsertPayload
) {
  const {
    facultyAcademicsId,
    facultyId,
    subjectName,
    department,
    academicYear,
    section,
    semester,
    unitName,
    unitNumber,
    topics,
  } = payload;

  const upsertData: any = {
    facultyId,
    subjectName,
    department,
    academicYear,
    section,
    semester,
    unitName,
    unitNumber,
    topics,
    is_active: true,
    updatedAt: new Date().toISOString(),
  };

 
  if (facultyAcademicsId) {
    upsertData.facultyAcademicsId = facultyAcademicsId;
  }

  const { data, error } = await supabase
    .from("facultyAcademics")
    .upsert(upsertData, {
      onConflict: "facultyAcademicsId",
    })
    .select()
    .single();

  if (error) {
    console.error("Upsert facultyAcademics failed:", error);
    throw error;
  }

  return data;
}
