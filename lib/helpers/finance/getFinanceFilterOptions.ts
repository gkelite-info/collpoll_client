import { supabase } from "@/lib/supabaseClient";

export async function getFinanceFilterOptions(
  collegeId: number,
  collegeEducationId: number
) {
  /* -----------------------------------
     1️⃣ Fetch Branches
  ------------------------------------ */
  const { data: branches, error: branchError } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (branchError) throw branchError;

  if (!branches || branches.length === 0) {
    return { branches: [] };
  }

  /* -----------------------------------
     2️⃣ Fetch Academic Years
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
     3️⃣ Fetch Semesters
  ------------------------------------ */
  const { data: semesters, error: semError } = await supabase
    .from("college_semester")
    .select("collegeSemesterId, collegeSemester, collegeAcademicYearId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (semError) throw semError;

  /* -----------------------------------
     4️⃣ Structure Data Branch → Year → Semester
  ------------------------------------ */

  const structuredBranches = branches.map((branch) => {
    const branchYears =
      years
        ?.filter((y) => y.collegeBranchId === branch.collegeBranchId)
        ?.map((year) => ({
          ...year,
          semesters: semesters?.filter(
            (s) => s.collegeAcademicYearId === year.collegeAcademicYearId
          ) || [],
        })) || [];

    return {
      ...branch,
      years: branchYears,
    };
  });

  return {
    branches: structuredBranches,
  };
}