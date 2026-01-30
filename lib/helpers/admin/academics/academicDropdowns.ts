import { supabase } from "@/lib/supabaseClient";

/* =========================
   EDUCATION TYPES
========================= */
export async function fetchEducations(collegeId: number) {
  const { data, error } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .eq("isActive", true);

  if (error) throw error;
  return data ?? [];
}

/* =========================
   BRANCHES
========================= */
export async function fetchBranches(
  collegeId: number,
  collegeEducationId: number
) {
  const { data, error } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchType, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true);

  if (error) throw error;
  return data ?? [];
}

/* =========================
   ACADEMIC YEARS
========================= */
export async function fetchAcademicYears(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number
) {
  const { data, error } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId);

  if (error) throw error;
  return data ?? [];
}

/* =========================
   SEMESTERS
========================= */
export async function fetchSemesters(
  collegeId: number,
  collegeEducationId: number,
  collegeAcademicYearId: number
) {
  const { data, error } = await supabase
    .from("college_semester")
    .select("collegeSemesterId, collegeSemester")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("isActive", true);

  if (error) throw error;
  return data ?? [];
}

/* =========================
   SECTIONS
========================= */
export async function fetchSections(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number,
  collegeAcademicYearId: number
) {
  const { data, error } = await supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("isActive", true);

  if (error) throw error;
  return data ?? [];
}
