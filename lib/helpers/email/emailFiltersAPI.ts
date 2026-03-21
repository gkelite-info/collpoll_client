import { supabase } from "@/lib/supabaseClient";

// NEW: Fetch and deduplicate roles from the users table
export async function getUniqueRoles(collegeId: number) {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("collegeId", collegeId)
    .not("role", "is", null);

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }

  // Extract roles and remove duplicates
  const uniqueRoles = Array.from(new Set(data.map((u) => u.role)));
  return uniqueRoles as string[];
}

// ... existing helper functions (getEducationTypes, getBranches, getYears, getSemesters, getSections)
export async function getEducationTypes(collegeId: number) {
  const { data, error } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .eq("isActive", true);
  if (error) console.error(error);
  return data || [];
}

export async function getBranches(educationId: string) {
  if (!educationId) return [];
  const { data, error } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchType")
    .eq("collegeEducationId", educationId)
    .eq("isActive", true);
  if (error) console.error(error);
  return data || [];
}

export async function getYears(branchId: string) {
  if (!branchId) return [];
  const { data, error } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeBranchId", branchId)
    .eq("isActive", true);
  if (error) console.error(error);
  return data || [];
}

export async function getSemesters(yearId: string) {
  if (!yearId) return [];
  const { data, error } = await supabase
    .from("college_semester")
    .select("collegeSemesterId, collegeSemester")
    .eq("collegeAcademicYearId", yearId)
    .eq("isActive", true);
  if (error) console.error(error);
  return data || [];
}

export async function getSections(yearId: string) {
  if (!yearId) return [];
  const { data, error } = await supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections")
    .eq("collegeAcademicYearId", yearId)
    .eq("isActive", true);
  if (error) console.error(error);
  return data || [];
}
