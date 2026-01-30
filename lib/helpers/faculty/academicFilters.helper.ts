// lib/helpers/faculty/academicFilters.helper.ts
import { supabase } from "@/lib/supabaseClient";

type Semester = {
  collegeSemesterId: number;
  collegeSemester: number;
};


export async function fetchAcademicFilters(params: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId?: number;
}) {
  const { collegeId, collegeEducationId, collegeBranchId, collegeAcademicYearId } = params;

  // 1️⃣ Years
  const { data: years } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", collegeBranchId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("collegeAcademicYearId");

  // 2️⃣ Semesters (optional until year selected)
 let semesters: Semester[] = [];
  if (collegeAcademicYearId) {
    const { data } = await supabase
      .from("college_semester")
      .select("collegeSemesterId, collegeSemester")
      .eq("collegeId", collegeId)
      .eq("collegeAcademicYearId", collegeAcademicYearId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .order("collegeSemester");

    semesters = data ?? [];
  }

  return { years, semesters };
}
