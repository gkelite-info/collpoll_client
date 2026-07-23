import { supabase } from "@/lib/supabaseClient";

type FacultyFilterParams = {
  collegeId: number;
  collegeEducationId?: number;
  collegeBranchId?: number;
  collegeAcademicYearId?: number;
  collegeSubjectId?: number;
  facultyId?: number;
  page?: number;
  limit?: number;
  searchQuery?: string;
};

export async function fetchFilteredFaculties(filters: FacultyFilterParams) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 15;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let allowedFacultyIds: number[] | null = null;

  if (filters.collegeAcademicYearId || filters.collegeSubjectId) {
    let sectionFilterQuery = supabase
      .from("faculty_sections")
      .select("facultyId")
      .eq("isActive", true);

    if (filters.collegeAcademicYearId) {
      sectionFilterQuery = sectionFilterQuery.eq("collegeAcademicYearId", filters.collegeAcademicYearId);
    }
    if (filters.collegeSubjectId) {
      sectionFilterQuery = sectionFilterQuery.eq("collegeSubjectId", filters.collegeSubjectId);
    }

    const { data: sectionRows, error: sectionFilterError } = await sectionFilterQuery;

    if (sectionFilterError) {
      console.error("Section pre-filter error:", sectionFilterError);
      return { data: [], total: 0 };
    }

    allowedFacultyIds = Array.from(new Set((sectionRows ?? []).map((r: any) => r.facultyId)));

    if (allowedFacultyIds.length === 0) {
      return { data: [], total: 0 };
    }
  }

  let facultyQuery = supabase
    .from("faculty")
    .select(
      `
      facultyId,
      userId, 
      fullName,
      gender,
      updatedAt,
      collegeBranchId,
      branch:collegeBranchId (
        collegeBranchCode
      )
      `,
      { count: "exact" }
    )
    .eq("isActive", true)
    .eq("collegeId", filters.collegeId);

  if (filters.collegeEducationId) {
    facultyQuery = facultyQuery.eq("collegeEducationId", filters.collegeEducationId);
  }
  if (filters.collegeBranchId) {
    facultyQuery = facultyQuery.eq("collegeBranchId", filters.collegeBranchId);
  }
  if (filters.facultyId) {
    facultyQuery = facultyQuery.eq("facultyId", filters.facultyId);
  }
  if (allowedFacultyIds !== null) {
    facultyQuery = facultyQuery.in("facultyId", allowedFacultyIds);
  }
  if (filters.searchQuery) {
    facultyQuery = facultyQuery.ilike("fullName", `%${filters.searchQuery}%`);
  }

  facultyQuery = facultyQuery.range(from, to);

  const { data: facultyData, error: facultyError, count } = await facultyQuery;

  if (facultyError || !facultyData || facultyData.length === 0) {
    if (facultyError) console.error("Faculty fetch error:", facultyError);
    return { data: [], total: 0 };
  }

  const facultyIds = facultyData.map((f: any) => f.facultyId);
  const userIds = facultyData.map((f: any) => f.userId);

  const [sectionsRes, employeeIdsRes, profilesRes] = await Promise.all([
    supabase
      .from("faculty_sections")
      .select(`
        facultyId,
        subject:collegeSubjectId (subjectName),
        section:collegeSectionsId (collegeBranchId, collegeAcademicYearId)
      `)
      .eq("isActive", true)
      .in("facultyId", facultyIds),

    supabase
      .from("employee_ids")
      .select("userId, employeeId")
      .eq("isActive", true)
      .eq("collegeId", filters.collegeId)
      .in("userId", userIds),

    supabase
      .from("user_profile")
      .select("userId, profileUrl")
      .eq("is_deleted", false)
      .in("userId", userIds)
  ]);

  if (sectionsRes.error) console.error("Sections fetch error:", sectionsRes.error);
  if (employeeIdsRes.error) console.error("Employee IDs fetch error:", employeeIdsRes.error);
  if (profilesRes.error) console.error("Profiles fetch error:", profilesRes.error);

  const subjectsByFaculty = new Map<number, Set<string>>();
  const academicYearIdsByFaculty = new Map<number, Set<number>>();
  
  (sectionsRes.data ?? []).forEach((row: any) => {
    if (filters.collegeBranchId && row.section?.collegeBranchId !== filters.collegeBranchId) return;

    if (row.subject?.subjectName) {
      if (!subjectsByFaculty.has(row.facultyId)) {
        subjectsByFaculty.set(row.facultyId, new Set());
      }
      subjectsByFaculty.get(row.facultyId)!.add(row.subject.subjectName);
    }
    
    if (row.section?.collegeAcademicYearId) {
      if (!academicYearIdsByFaculty.has(row.facultyId)) {
        academicYearIdsByFaculty.set(row.facultyId, new Set());
      }
      academicYearIdsByFaculty.get(row.facultyId)!.add(row.section.collegeAcademicYearId);
    }
  });

  const allAcademicYearIds = Array.from(new Set(Array.from(academicYearIdsByFaculty.values()).flatMap(set => Array.from(set))));
  
  const { data: yearsData } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .in("collegeAcademicYearId", allAcademicYearIds);

  const yearMap = new Map<number, string>();
  (yearsData ?? []).forEach((y: any) => {
    yearMap.set(y.collegeAcademicYearId, y.collegeAcademicYear);
  });

  const empMap = new Map<number, string>();
  (employeeIdsRes.data ?? []).forEach((emp: any) => {
    if (emp.employeeId) empMap.set(emp.userId, emp.employeeId);
  });

  const profileMap = new Map<number, string>();
  (profilesRes.data ?? []).forEach((p: any) => {
    if (p.profileUrl) profileMap.set(p.userId, p.profileUrl);
  });

  const result = facultyData.map((f: any) => {
    const facultyYears = Array.from(academicYearIdsByFaculty.get(f.facultyId) ?? [])
      .map(id => yearMap.get(id))
      .filter(Boolean)
      .join(", ");

    return {
      id: String(f.facultyId),
      employeeId: empMap.get(f.userId) || "N/A", // Correctly retrieves the mapped ID
      name: f.fullName,
      gender: f.gender,
      branch: f.branch?.collegeBranchCode ?? "—",
      year: facultyYears || "—",
      subjects: Array.from(subjectsByFaculty.get(f.facultyId) ?? []).join(", ") || "—",
      lastUpdate: new Date(f.updatedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      image: profileMap.get(f.userId) || "",
    };
  });

  return {
    data: result,
    total: count || 0,
    hasMore: facultyData.length === limit,
  };
}
