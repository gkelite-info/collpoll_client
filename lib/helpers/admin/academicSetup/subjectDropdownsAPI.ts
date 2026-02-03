import { supabase } from "@/lib/supabaseClient";

export const fetchSubjectOptions = async (
  collegeId: number,
  ui: { education: string; branch: string; year: string },
) => {
  const { data: eduData } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .is("isActive", true);

  const selectedEdu = eduData?.find(
    (e) => e.collegeEducationType === ui.education,
  );

  const { data: branchData } = selectedEdu
    ? await supabase
        .from("college_branch")
        .select("collegeBranchId, collegeBranchCode")
        .eq("collegeEducationId", selectedEdu.collegeEducationId)
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
    : { data: [] };

  const selectedBranch = branchData?.find(
    (b) => b.collegeBranchCode === ui.branch,
  );

  const { data: yearData } = selectedBranch
    ? await supabase
        .from("college_academic_year")
        .select("collegeAcademicYearId, collegeAcademicYear")
        .eq("collegeBranchId", selectedBranch.collegeBranchId)
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
    : { data: [] };

  const selectedYear = yearData?.find((y) => y.collegeAcademicYear === ui.year);

  const { data: semData } = selectedYear
    ? await supabase
        .from("college_semester")
        .select("collegeSemesterId, collegeSemester")
        .eq("collegeAcademicYearId", selectedYear.collegeAcademicYearId)
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
    : { data: [] };

  return {
    educations:
      eduData?.map((e) => ({
        id: e.collegeEducationId,
        label: e.collegeEducationType,
      })) ?? [],
    branches:
      branchData?.map((b) => ({
        id: b.collegeBranchId,
        label: b.collegeBranchCode,
      })) ?? [],
    years:
      yearData?.map((y) => ({
        id: y.collegeAcademicYearId,
        label: y.collegeAcademicYear,
      })) ?? [],
    semesters:
      semData?.map((s) => ({
        id: s.collegeSemesterId,
        label: String(s.collegeSemester),
      })) ?? [],
  };
};
