import { supabase } from "@/lib/supabaseClient";

function getBranch(row: any) {
  return Array.isArray(row.collegeBranch)
    ? row.collegeBranch[0]
    : row.collegeBranch;
}

async function getBatchStudentCounts(sections: Array<{
  collegeAcademicYearId: number;
  collegeSectionsId: number;
}>) {
  if (sections.length === 0) return new Map();

  const { data, error } = await supabase
    .from("student_academic_history")
    .select("collegeAcademicYearId, collegeSectionsId")
    .eq("isCurrent", true)
    .is("deletedAt", null)
    .in(
      "collegeAcademicYearId",
      [...new Set(sections.map(s => s.collegeAcademicYearId))]
    )
    .in(
      "collegeSectionsId",
      [...new Set(sections.map(s => s.collegeSectionsId))]
    );

  if (error) {
    console.error("getBatchStudentCounts error", error);
    return new Map();
  }

  const countMap = new Map<string, number>();
  data?.forEach((row) => {
    const key = `${row.collegeAcademicYearId}-${row.collegeSectionsId}`;
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });

  return countMap;
}

async function getBatchSubjectCounts(sections: Array<{
  collegeAcademicYearId: number;
  collegeSectionsId: number;
}>) {
  if (sections.length === 0) return new Map();

  const { data, error } = await supabase
    .from("faculty_sections")
    .select("collegeAcademicYearId, collegeSectionsId, collegeSubjectId")
    .eq("isActive", true)
    .is("deletedAt", null)
    .in(
      "collegeAcademicYearId",
      [...new Set(sections.map(s => s.collegeAcademicYearId))]
    )
    .in(
      "collegeSectionsId",
      [...new Set(sections.map(s => s.collegeSectionsId))]
    );

  if (error) {
    console.error("getBatchSubjectCounts error", error);
    return new Map();
  }

  const countMap = new Map<string, Set<number>>();
  data?.forEach((row) => {
    const key = `${row.collegeAcademicYearId}-${row.collegeSectionsId}`;
    if (!countMap.has(key)) {
      countMap.set(key, new Set());
    }
    countMap.get(key)!.add(row.collegeSubjectId);
  });

  const finalMap = new Map<string, number>();
  countMap.forEach((subjectSet, key) => {
    finalMap.set(key, subjectSet.size);
  });

  return finalMap;
}

async function getBatchFacultyCounts(sections: Array<{
  collegeAcademicYearId: number;
  collegeSectionsId: number;
  collegeBranchId: number;
  collegeEducationId: number;
}>) {
  if (sections.length === 0) return new Map();

  const validSections = sections.filter(s => s.collegeBranchId && s.collegeEducationId);
  if (validSections.length === 0) return new Map();

  const { data, error } = await supabase
    .from("faculty_sections")
    .select(
      `
      collegeAcademicYearId,
      collegeSectionsId,
      facultyId,
      faculty (
        collegeBranchId,
        collegeEducationId
      )
    `
    )
    .eq("isActive", true)
    .is("deletedAt", null)
    .in(
      "collegeAcademicYearId",
      [...new Set(validSections.map(s => s.collegeAcademicYearId))]
    )
    .in(
      "collegeSectionsId",
      [...new Set(validSections.map(s => s.collegeSectionsId))]
    );

  if (error) {
    console.error("getBatchFacultyCounts error", error);
    return new Map();
  }

  const sectionFilters = new Map<string, { branchId: number; educationId: number }>();
  validSections.forEach(s => {
    const key = `${s.collegeAcademicYearId}-${s.collegeSectionsId}`;
    sectionFilters.set(key, {
      branchId: s.collegeBranchId,
      educationId: s.collegeEducationId
    });
  });

  const countMap = new Map<string, Set<number>>();
  data?.forEach((row) => {
    const key = `${row.collegeAcademicYearId}-${row.collegeSectionsId}`;
    const filter = sectionFilters.get(key);

    const faculty = Array.isArray(row.faculty) ? row.faculty[0] : row.faculty;

    if (filter &&
      faculty?.collegeBranchId === filter.branchId &&
      faculty?.collegeEducationId === filter.educationId) {

      if (!countMap.has(key)) {
        countMap.set(key, new Set());
      }
      countMap.get(key)!.add(row.facultyId);
    }
  });

  const finalMap = new Map<string, number>();
  countMap.forEach((facultySet, key) => {
    finalMap.set(key, facultySet.size);
  });

  return finalMap;
}

// ========================================================================
// ✅ MAIN OPTIMIZED FUNCTION
// ========================================================================

export async function getAdminAcademicsCards(
  collegeId: number,
  page: number,
  limit: number,
  search?: string,
  filters?: {
    educationId?: number | null;
    branchId?: number | null;
    academicYearId?: number | null;
    sectionId?: number | null;
    subjectId?: number | null;
  },
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("college_sections")
    .select(
      `
      collegeSectionsId,
      collegeSections,
      collegeAcademicYearId,
      collegeEducationId,
      collegeAcademicYear:collegeAcademicYearId (
        collegeAcademicYear,
        collegeAcademicYearId
      ),
      collegeBranch:collegeBranchId (
        collegeBranchId,
        collegeBranchType,
        collegeBranchCode
      ),
      faculty_sections (
        facultyId,
        collegeAcademicYearId,
        faculty (
          facultyId,
          fullName,
          email,
          collegeBranchId,
          collegeEducationId
        )
      )
    `,
      { count: "exact" },
    )
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

  const searchText = search?.trim().toLowerCase();
  let branchSearch: string | null = null;
  let sectionSearch: string | null = null;

  if (searchText) {
    searchText.split(/[-\s]+/).forEach((part) => {
      if (part.length === 1) sectionSearch = part.toUpperCase();
      else branchSearch = part;
    });
  }

  if (branchSearch) {
    query = query.or(
      `collegeBranchCode.ilike.%${branchSearch}%,collegeBranchType.ilike.%${branchSearch}%`,
      { foreignTable: "collegeBranch" },
    );
  }

  if (sectionSearch) {
    query = query.eq("collegeSections", sectionSearch);
  }

  if (filters?.educationId) {
    query = query.eq("collegeEducationId", filters.educationId);
  }

  if (filters?.branchId) {
    query = query.eq("collegeBranchId", filters.branchId);
  }

  if (filters?.academicYearId) {
    query = query.eq("collegeAcademicYearId", filters.academicYearId);
  }

  if (filters?.sectionId) {
    query = query.eq("collegeSectionsId", filters.sectionId);
  }

  if (filters?.subjectId) {
    query = query.eq("faculty_sections.collegeSubjectId", filters.subjectId);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getAdminAcademicsCards error", error);
    throw new Error("Failed to load academic records");
  }

  // ✅ OPTIMIZED: Prepare sections for batch fetching
  const sections = (data ?? []).map(row => {
    const branch = getBranch(row);
    return {
      collegeAcademicYearId: row.collegeAcademicYearId,
      collegeSectionsId: row.collegeSectionsId,
      collegeBranchId: branch?.collegeBranchId ?? 0,
      collegeEducationId: row.collegeEducationId ?? 0,
    };
  });

  // ✅ OPTIMIZED: Batch fetch all counts in parallel (3 queries instead of 45+)
  const [studentCountMap, subjectCountMap, facultyCountMap] = await Promise.all([
    getBatchStudentCounts(sections),
    getBatchSubjectCounts(sections),
    getBatchFacultyCounts(sections),
  ]);

  // ✅ OPTIMIZED: Map counts using lookups instead of queries
  const enrichedData = (data ?? []).map((row) => {
    const key = `${row.collegeAcademicYearId}-${row.collegeSectionsId}`;

    return {
      ...row,
      studentCount: studentCountMap.get(key) || 0,
      subjectCount: subjectCountMap.get(key) || 0,
      facultyCount: facultyCountMap.get(key) || 0,
    };
  });

  return {
    data: enrichedData,
    totalCount: count ?? 0,
  };
}

export function mapAcademicCards(data: any[]) {
  return data.map((row) => {
    const branch = Array.isArray(row.collegeBranch)
      ? row.collegeBranch[0]
      : row.collegeBranch;
    return {
      id: row.collegeSectionsId.toString(),
      collegeBranchId: branch?.collegeBranchId,
      collegeAcademicYearId: row.collegeAcademicYearId,
      collegeSectionsId: row.collegeSectionsId,
      branchName: branch?.collegeBranchType ?? "-",
      branchCode: branch?.collegeBranchCode ?? "-",
      section: row.collegeSections ?? "-",
      year: row.collegeAcademicYear?.collegeAcademicYear?.toString() ?? "-",
      totalStudents: row.studentCount ?? 0,
      totalFaculties: row.facultyCount ?? 0,
      totalSubjects: row.subjectCount ?? 0,
      faculties:
        row.faculty_sections
          ?.filter(
            (fs: any) =>
              fs.collegeAcademicYearId === row.collegeAcademicYearId &&
              fs.faculty?.collegeBranchId === branch?.collegeBranchId &&
              fs.faculty?.collegeEducationId === row.collegeEducationId,
          )
          .map((fs: any) => ({
            facultyId: fs.faculty.facultyId,
            fullName: fs.faculty.fullName,
            email: fs.faculty.email,
          })) ?? [],
    };
  });
}

export async function getEducationTypes(collegeId: number) {
  const { data, error } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}

export async function getBranchesByEducation(
  collegeId: number,
  educationId: number,
) {
  const { data, error } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchType, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", educationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}

export async function getAcademicYears(
  collegeId: number,
  educationId: number,
  branchId: number,
) {
  const { data, error } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", educationId)
    .eq("collegeBranchId", branchId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}

export async function getSections(
  collegeId: number,
  branchId: number,
  academicYearId: number,
) {
  const { data, error } = await supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections")
    .eq("collegeId", collegeId)
    .eq("collegeBranchId", branchId)
    .eq("collegeAcademicYearId", academicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}

export async function getSubjects(
  collegeId: number,
  branchId: number,
  academicYearId: number,
) {
  const { data, error } = await supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .eq("collegeId", collegeId)
    .eq("collegeBranchId", branchId)
    .eq("collegeAcademicYearId", academicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) throw error;
  return data ?? [];
}