import type { SupabaseClient } from "@supabase/supabase-js";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

/** Match school enrolments that still reference a replaced section in the same year. */
export async function resolveSchoolAttendanceSections(
  supabase: SupabaseClient,
  sectionIds: number[],
): Promise<number[]> {
  const { data: sections, error } = await supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections, collegeId, collegeEducationId, collegeAcademicYearId, college_education(collegeEducationType)")
    .in("collegeSectionsId", sectionIds);

  if (error) throw error;

  const resolvedIds = new Set(sectionIds);
  for (const section of sections ?? []) {
    const education = Array.isArray(section.college_education)
      ? section.college_education[0]
      : section.college_education;
    if (!isSchoolEducation(education?.collegeEducationType)) continue;

    // Schools have no branch/semester. Keep the school, education, year and
    // section name exact so students from other classes or Section B cannot mix.
    const { data: retiredSections, error: retiredError } = await supabase
      .from("college_sections")
      .select("collegeSectionsId")
      .eq("collegeId", section.collegeId)
      .eq("collegeEducationId", section.collegeEducationId)
      .eq("collegeAcademicYearId", section.collegeAcademicYearId)
      .eq("collegeSections", section.collegeSections)
      .eq("isActive", false)
      .not("deletedAt", "is", null);

    if (retiredError) throw retiredError;
    for (const retired of retiredSections ?? []) {
      resolvedIds.add(retired.collegeSectionsId);
    }
  }

  return [...resolvedIds];
}
