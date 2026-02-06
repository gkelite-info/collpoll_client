import { supabase } from "@/lib/supabaseClient";

function getBranch(row: any) {
  return Array.isArray(row.collegeBranch)
    ? row.collegeBranch[0]
    : row.collegeBranch;
}

async function getStudentCountBySection(params: {
  collegeAcademicYearId: number;
  collegeSectionsId: number;
}) {
  const { count, error } = await supabase
    .from("student_academic_history")
    .select("studentAcademicHistoryId", {
      count: "exact",
      head: true,
    })
    .eq("collegeAcademicYearId", params.collegeAcademicYearId)
    .eq("collegeSectionsId", params.collegeSectionsId)
    .eq("isCurrent", true)
    .is("deletedAt", null);

  if (error) {
    console.error("getStudentCountBySection error", error);
    return 0;
  }

  return count ?? 0;
}

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

  const enrichedData = await Promise.all(
    (data ?? []).map(async (row) => {
      const studentCount = await getStudentCountBySection({
        collegeAcademicYearId: row.collegeAcademicYearId,
        collegeSectionsId: row.collegeSectionsId,
      });

      const subjectCount = await getSubjectCountBySection({
        collegeSectionsId: row.collegeSectionsId,
        collegeAcademicYearId: row.collegeAcademicYearId,
      });

      const branch = getBranch(row);

      const facultyCount = await getFacultyCountBySection({
        collegeSectionsId: row.collegeSectionsId,
        collegeAcademicYearId: row.collegeAcademicYearId,
        //collegeBranchId: row.collegeBranch[0]?.collegeBranchId,
        collegeBranchId: branch?.collegeBranchId,
        collegeEducationId: row.collegeEducationId,
      });
      return {
        ...row,
        studentCount,
        subjectCount,
        facultyCount,
      };
    }),
  );

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
      // branchName: row.collegeBranch?.collegeBranchType ?? "-",
      // branchCode: row.collegeBranch?.collegeBranchCode ?? "-",
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
    }
  });
}

// ✅ FIXED — branch + education safe faculty count
async function getFacultyCountBySection(params: {
  collegeSectionsId: number;
  collegeAcademicYearId: number;
  collegeBranchId: number;
  collegeEducationId: number;
}) {
  const { data, error } = await supabase
    .from("faculty_sections")
    .select(
      `
      facultyId,
      faculty (
        collegeBranchId,
        collegeEducationId
      )
    `,
    )
    .eq("collegeSectionsId", params.collegeSectionsId)
    .eq("collegeAcademicYearId", params.collegeAcademicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("getFacultyCountBySection error", error);
    return 0;
  }

  const validFacultyIds = new Set(
    data
      ?.filter(
        (r: any) =>
          r.faculty?.collegeBranchId === params.collegeBranchId &&
          r.faculty?.collegeEducationId === params.collegeEducationId,
      )
      .map((r: any) => r.facultyId),
  );

  return validFacultyIds.size;
}



// ✅ FIXED — DISTINCT subject count
async function getSubjectCountBySection(params: {
  collegeSectionsId: number;
  collegeAcademicYearId: number;
}) {
  const { data, error } = await supabase
    .from("faculty_sections")
    .select("collegeSubjectId")
    .eq("collegeSectionsId", params.collegeSectionsId)
    .eq("collegeAcademicYearId", params.collegeAcademicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("getSubjectCountBySection error", error);
    return 0;
  }

  // ✅ DISTINCT subject count
  return new Set(data?.map((r) => r.collegeSubjectId)).size;
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
