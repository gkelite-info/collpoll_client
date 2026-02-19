import { supabase } from "@/lib/supabaseClient";

export async function getFinanceFilterOptions(
  collegeId: number,
  collegeEducationId: number
) {
  /* -----------------------------------
     1️⃣ Branches
  ------------------------------------ */

  const { data: branches, error: branchError } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchType, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (branchError) throw branchError;

  /* -----------------------------------
     2️⃣ Academic Years
  ------------------------------------ */

  const { data: years, error: yearError } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear, collegeBranchId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (yearError) throw yearError;

  /* -----------------------------------
     3️⃣ Semesters
  ------------------------------------ */

  const { data: semesters, error: semError } = await supabase
    .from("college_semester")
    .select(
      "collegeSemesterId, collegeSemester, collegeAcademicYearId"
    )
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (semError) throw semError;

  return {
    branches: branches || [],
    years: years || [],
    semesters: semesters || [],
  };
}
