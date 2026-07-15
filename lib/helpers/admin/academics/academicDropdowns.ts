import { supabase } from "@/lib/supabaseClient";

/* =========================
   EDUCATION TYPES
========================= */
export async function fetchEducations(collegeId: number) {
  const { data, error } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}

export async function fetchAdminEducationTypes(adminId: number) {
  const { data, error } = await supabase
    .from("admin_education_types")
    .select(`
      collegeEducationId,
      college_education:collegeEducationId (
        collegeEducationType
      )
    `)
    .eq("adminId", adminId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (error) throw error;
  return data?.map((d: any) => {
    const edu = Array.isArray(d.college_education) 
      ? d.college_education[0] 
      : d.college_education;
    
    return {
      collegeEducationId: d.collegeEducationId,
      collegeEducationType: edu?.collegeEducationType || "Unknown"
    };
  }) ?? [];
}

/* =========================
   BRANCHES
========================= */
export async function fetchBranches(
  collegeId: number,
  collegeEducationId: number,
) {
  const { data, error } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchType, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}

/* =========================
   ACADEMIC YEARS
========================= */
export async function fetchAcademicYears(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number | null,
) {
  let query = supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("collegeAcademicYear", { ascending: true });

  if (collegeBranchId != null) {
    query = query.eq("collegeBranchId", collegeBranchId);
  } else {
    query = query.is("collegeBranchId", null);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/* =========================
   SEMESTERS
========================= */
export async function fetchSemesters(
  collegeId: number,
  collegeEducationId: number,
  collegeAcademicYearId: number,
) {
  const { data, error } = await supabase
    .from("college_semester")
    .select("collegeSemesterId, collegeSemester")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}

/* =========================
   SUBJECTS
========================= */
export async function fetchSubjects(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number | null,
  collegeAcademicYearId: number,
  collegeSemesterId?: number | null
) {
  let query = supabase
    .from("college_subjects")
    .select(`
      collegeSubjectId,
      subjectName,
      subjectCode,
      subjectKey,
      credits
    `)
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (collegeBranchId !== null && collegeBranchId !== undefined) {
    query = query.eq("collegeBranchId", collegeBranchId);
  } else {
    query = query.is("collegeBranchId", null);
  }

  if (collegeSemesterId) {
    query = query.eq("collegeSemesterId", collegeSemesterId);
  } else {
    query = query.is("collegeSemesterId", null);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/* =========================
   SECTIONS
========================= */
export async function fetchSections(
  collegeId: number,
  collegeEducationId: number,
  collegeBranchId: number | null,
  collegeAcademicYearId: number,
) {
  let query = supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeAcademicYearId", collegeAcademicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (collegeBranchId !== null && collegeBranchId !== undefined) {
    query = query.eq("collegeBranchId", collegeBranchId);
  } else {
    query = query.is("collegeBranchId", null);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}
