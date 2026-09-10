import { supabase } from "@/lib/supabaseClient";

export async function getEquivalentSectionIds(
  collegeId: number,
  academicYearId: number,
  sectionId: number,
): Promise<number[]> {
  const { data: sectionRows, error } = await supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections, collegeEducationId, collegeBranchId")
    .eq("collegeId", collegeId)
    .eq("collegeAcademicYearId", academicYearId);

  if (error) throw error;

  const selectedSection = (sectionRows ?? []).find(
    (section) => section.collegeSectionsId === sectionId,
  );
  if (!selectedSection) return [sectionId];

  const selectedName = selectedSection.collegeSections.trim().toLowerCase();
  const matchingIds = (sectionRows ?? [])
    .filter(
      (section) =>
        section.collegeSections.trim().toLowerCase() === selectedName &&
        section.collegeEducationId === selectedSection.collegeEducationId &&
        section.collegeBranchId === selectedSection.collegeBranchId,
    )
    .map((section) => section.collegeSectionsId);

  return matchingIds.length ? matchingIds : [sectionId];
}
