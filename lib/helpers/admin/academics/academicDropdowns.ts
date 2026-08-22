import { supabase } from "@/lib/supabaseClient";

/* =========================
   EDUCATION TYPES
========================= */
const inflightEducationCache = new Map<number, Promise<any>>();

export async function fetchEducations(collegeId: number) {
  if (inflightEducationCache.has(collegeId)) {
    return inflightEducationCache.get(collegeId)!;
  }
  const promise = (async () => {
    const { data, error } = await supabase
      .from("college_education")
      .select("collegeEducationId, collegeEducationType")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (error) throw error;
    return data ?? [];
  })().finally(() => {
    setTimeout(() => inflightEducationCache.delete(collegeId), 1000);
  });
  inflightEducationCache.set(collegeId, promise);
  return promise;
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

  if (collegeBranchId != null) {
    query = query.eq("collegeBranchId", collegeBranchId);
  }

  if (collegeSemesterId) {
    query = query.eq("collegeSemesterId", collegeSemesterId);
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

  if (collegeBranchId != null) {
    query = query.eq("collegeBranchId", collegeBranchId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/* =========================
   PLACEMENT OFFICER
========================= */
export async function fetchPlacementOfficerEducations(
  placementEmployeeId: number,
  collegeId: number
) {
  const { data: peData, error: peError } = await supabase
    .from("placement_employee")
    .select("createdBy")
    .eq("placementEmployeeId", placementEmployeeId)
    .single();

  if (peError || !peData?.createdBy) {
    return fetchEducations(collegeId);
  }

  const adminId = peData.createdBy;
  const { data: adminEdu, error: adminEduError } = await supabase
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

  if (adminEduError) throw adminEduError;

  if (adminEdu && adminEdu.length > 0) {
    return adminEdu.map((d: any) => {
      const edu = Array.isArray(d.college_education)
        ? d.college_education[0]
        : d.college_education;
      return {
        collegeEducationId: d.collegeEducationId,
        collegeEducationType: edu?.collegeEducationType || "Unknown",
      };
    });
  } else {
    const { data: admin } = await supabase
      .from("admins")
      .select("collegeEducationId, college_education:collegeEducationId (collegeEducationType)")
      .eq("adminId", adminId)
      .maybeSingle();

    if (admin?.collegeEducationId) {
      const edu = Array.isArray(admin.college_education)
        ? admin.college_education[0]
        : admin.college_education;
      return [
        {
          collegeEducationId: admin.collegeEducationId,
          collegeEducationType: edu?.collegeEducationType || "Unknown",
        },
      ];
    }
  }

  return fetchEducations(collegeId);
}

export async function fetchBranchesMulti(
  collegeId: number,
  collegeEducationIds: number[]
) {
  if (!collegeEducationIds.length) return [];
  const { data, error } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchType, collegeBranchCode, collegeEducationId")
    .eq("collegeId", collegeId)
    .in("collegeEducationId", collegeEducationIds)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}

export async function fetchAcademicYearsMulti(
  collegeId: number,
  collegeEducationIds: number[],
  collegeBranchIds: number[]
) {
  if (!collegeEducationIds.length) return [];
  
  let query = supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeId", collegeId)
    .in("collegeEducationId", collegeEducationIds)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("collegeAcademicYear", { ascending: true });

  if (collegeBranchIds.length > 0) {
    query = query.in("collegeBranchId", collegeBranchIds);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}
