"use server";

import { supabase } from "@/lib/supabaseClient";

export async function getFacultyAssignedSubjects(params: {
  facultyId: number;
}) {
  const { facultyId } = params;

  console.log("🟡 Fetching faculty assigned subjects", { facultyId });

  const { data, error } = await supabase
    .from("faculty_sections")
    .select(`
      facultySectionId,
      facultyId,
      collegeSubjectId,
      collegeSectionsId,
      collegeAcademicYearId,

      college_subjects (
        collegeSubjectId,
        subjectName
      ),

      college_sections (
        collegeSectionsId,
        collegeSections
      )
    `)
    .eq("facultyId", facultyId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("❌ Failed to fetch faculty sections", error);
    throw error;
  }

  console.log("✅ Faculty subject-section mapping:", data);

  return data ?? [];
}
