import { supabase } from "@/lib/supabaseClient";

function getBranch(row: any) {
  return Array.isArray(row.collegeBranch)
    ? row.collegeBranch[0]
    : row.collegeBranch;
}

async function getBatchStudentCounts(
  sections: Array<{
    collegeSectionsId: number;
  }>,
) {
  if (sections.length === 0) return new Map();

  const sectionIds = [...new Set(sections.map((s) => s.collegeSectionsId))];

  const { data, error } = await supabase
    .from("student_academic_history")
    .select("collegeSectionsId, studentId, students(isActive, status)")
    .eq("isCurrent", true)
    .is("deletedAt", null)
    .in("collegeSectionsId", sectionIds);

  if (error) {
    console.error("getBatchStudentCounts error", error);
    return new Map();
  }

  const countMap = new Map<number, Set<number>>();
  data?.forEach((row: any) => {
    const student = Array.isArray(row.students) ? row.students[0] : row.students;
    if (student && student.isActive !== false) {
      if (!countMap.has(row.collegeSectionsId)) {
        countMap.set(row.collegeSectionsId, new Set());
      }
      countMap.get(row.collegeSectionsId)!.add(row.studentId);
    }
  });

  const finalMap = new Map<number, number>();
  countMap.forEach((studentSet, key) => {
    finalMap.set(key, studentSet.size);
  });

  return finalMap;
}

async function getBatchSubjectCounts(
  sections: Array<{
    collegeSectionsId: number;
  }>,
) {
  if (sections.length === 0) return new Map();

  const { data, error } = await supabase
    .from("faculty_sections")
    .select("collegeSectionsId, collegeSubjectId")
    .is("deletedAt", null)
    .in("collegeSectionsId", [
      ...new Set(sections.map((s) => s.collegeSectionsId)),
    ]);

  if (error) {
    console.error("getBatchSubjectCounts error", error);
    return new Map();
  }

  const countMap = new Map<number, Set<number>>();
  data?.forEach((row) => {
    if (!countMap.has(row.collegeSectionsId)) {
      countMap.set(row.collegeSectionsId, new Set());
    }
    countMap.get(row.collegeSectionsId)!.add(row.collegeSubjectId);
  });

  const finalMap = new Map<number, number>();
  countMap.forEach((subjectSet, key) => {
    finalMap.set(key, subjectSet.size);
  });

  return finalMap;
}

async function getBatchFacultyCounts(
  sections: Array<{
    collegeSectionsId: number;
  }>,
) {
  if (sections.length === 0) return new Map();

  const sectionIds = [...new Set(sections.map((s) => s.collegeSectionsId))];

  const { data, error } = await supabase
    .from("faculty_sections")
    .select("collegeSectionsId, facultyId, collegeEducationId, collegeBranchId, faculty(deletedAt)")
    .is("deletedAt", null)
    .in("collegeSectionsId", sectionIds);

  if (error) {
    console.error("getBatchFacultyCounts error", error);
    return new Map();
  }

  const countMap = new Map<number, Set<number>>();
  data?.forEach((row: any) => {
    const fac = Array.isArray(row.faculty) ? row.faculty[0] : row.faculty;
    if (fac && fac.deletedAt !== null) return;
    
    if (!countMap.has(row.collegeSectionsId)) {
      countMap.set(row.collegeSectionsId, new Set());
    }
    countMap.get(row.collegeSectionsId)!.add(row.facultyId);
  });

  const finalMap = new Map<number, number>();
  countMap.forEach((facultySet, key) => {
    finalMap.set(key, facultySet.size);
  });

  return finalMap;
}

function parseIntegerId(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed || trimmed === "All" || trimmed === "null" || trimmed === "undefined") {
      return null;
    }
  }
  const num = Number(val);
  return !isNaN(num) && num > 0 ? num : null;
}

export async function getAdminAcademicsCards(
  collegeId: number,
  page: number,
  limit: number,
  search?: string,
  filters?: {
    educationId?: number | string | null;
    branchId?: number | string | null;
    academicYearId?: number | string | null;
    sectionId?: number | string | null;
    subjectId?: number | string | null;
  },
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const eduId = parseIntegerId(filters?.educationId);
  const brId = parseIntegerId(filters?.branchId);
  const yrId = parseIntegerId(filters?.academicYearId);
  const secId = parseIntegerId(filters?.sectionId);
  const subId = parseIntegerId(filters?.subjectId);
  const facultySectionsRelation = subId
    ? "faculty_sections!inner"
    : "faculty_sections";

  const searchText = search
    ?.trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ");
  let searchedBranchIds: number[] | null = null;

  if (searchText) {
    let branchSearchQuery = supabase
      .from("college_branch")
      .select("collegeBranchId")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .or(
        `collegeBranchCode.ilike.%${searchText}%,collegeBranchType.ilike.%${searchText}%`,
      );

    if (eduId) branchSearchQuery = branchSearchQuery.eq("collegeEducationId", eduId);
    if (brId) branchSearchQuery = branchSearchQuery.eq("collegeBranchId", brId);

    const { data: matchingBranches, error: branchSearchError } =
      await branchSearchQuery;

    if (branchSearchError) {
      console.error("getAdminAcademicsCards branch search error", branchSearchError);
      throw new Error("Failed to search academic branches");
    }

    searchedBranchIds = (matchingBranches ?? []).map(
      (item) => item.collegeBranchId,
    );

    if (!searchedBranchIds.length) {
      return { data: [], totalCount: 0 };
    }
  }

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
      ${facultySectionsRelation} (
        facultyId,
        collegeAcademicYearId,
        collegeEducationId,
        collegeBranchId,
        faculty (
          facultyId,
          userId,
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

  if (searchedBranchIds) query = query.in("collegeBranchId", searchedBranchIds);

  if (eduId) query = query.eq("collegeEducationId", eduId);
  if (brId) query = query.eq("collegeBranchId", brId);
  if (yrId) query = query.eq("collegeAcademicYearId", yrId);
  if (secId) query = query.eq("collegeSectionsId", secId);
  if (subId) query = query.eq("faculty_sections.collegeSubjectId", subId);

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getAdminAcademicsCards error", error);
    throw new Error("Failed to load academic records");
  }

  const sections = (data ?? []).map(row => {
    const branch = Array.isArray(row.collegeBranch) ? row.collegeBranch[0] : row.collegeBranch;
    return {
      collegeAcademicYearId: row.collegeAcademicYearId,
      collegeSectionsId: row.collegeSectionsId,
      collegeBranchId: branch?.collegeBranchId ?? 0,
      collegeEducationId: row.collegeEducationId ?? 0,
    };
  });

  const facultyUserIds = new Set<number>();
  (data ?? []).forEach(row => {
    row.faculty_sections?.forEach((fs: any) => {
      const f = Array.isArray(fs.faculty) ? fs.faculty[0] : fs.faculty;
      if (f?.userId) facultyUserIds.add(f.userId);
    });
  });

  const [studentCountMap, subjectCountMap, facultyCountMap, profilesRes] = await Promise.all([
    getBatchStudentCounts(sections),
    getBatchSubjectCounts(sections),
    getBatchFacultyCounts(sections),
    facultyUserIds.size > 0 
      ? supabase.from("user_profile").select("userId, profileUrl").in("userId", Array.from(facultyUserIds)).eq("is_deleted", false)
      : Promise.resolve({ data: [] })
  ]);

  const profileMap = new Map<number, string>();
  (profilesRes.data ?? []).forEach((p: any) => {
    if (p.profileUrl) profileMap.set(p.userId, p.profileUrl);
  });

  const enrichedData = (data ?? []).map((row) => {
    if (row.faculty_sections) {
      row.faculty_sections = row.faculty_sections.map((fs: any) => {
        const f = Array.isArray(fs.faculty) ? fs.faculty[0] : fs.faculty;
        if (f) {
          f.profileUrl = profileMap.get(f.userId) || "";
          fs.faculty = f;
        }
        return fs;
      });
    }

    return {
      ...row,
      studentCount: studentCountMap.get(row.collegeSectionsId) || 0,
      subjectCount: subjectCountMap.get(row.collegeSectionsId) || 0,
      facultyCount: facultyCountMap.get(row.collegeSectionsId) || 0,
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

    const uniqueFacultiesMap = new Map<number, any>();
    row.faculty_sections?.forEach((fs: any) => {
      const f = Array.isArray(fs.faculty) ? fs.faculty[0] : fs.faculty;
      
      const eduId = f?.collegeEducationId ?? fs?.collegeEducationId;
      const branchId = f?.collegeBranchId ?? fs?.collegeBranchId;
      
      if (eduId && row.collegeEducationId && eduId !== row.collegeEducationId) return;
      if (branchId && row.collegeBranchId && branchId !== row.collegeBranchId) return;
      
      if (f && f.facultyId && !uniqueFacultiesMap.has(f.facultyId)) {
        uniqueFacultiesMap.set(f.facultyId, {
          facultyId: f.facultyId,
          fullName: f.fullName,
          email: f.email,
          profileUrl: f.profileUrl || "",
        });
      }
    });

    const faculties = Array.from(uniqueFacultiesMap.values());

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
      totalFaculties: row.facultyCount || faculties.length,
      totalSubjects: row.subjectCount ?? 0,
      faculties,
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
  branchId: number | null,
) {
  let query = supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId, collegeAcademicYear")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", educationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (branchId != null) {
    query = query.eq("collegeBranchId", branchId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getSections(
  collegeId: number,
  branchId: number | null,
  academicYearId: number,
) {
  let query = supabase
    .from("college_sections")
    .select("collegeSectionsId, collegeSections")
    .eq("collegeId", collegeId)
    .eq("collegeAcademicYearId", academicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (branchId != null) {
    query = query.eq("collegeBranchId", branchId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getSubjects(
  collegeId: number,
  branchId: number | null,
  academicYearId: number,
  sectionId?: number | null,
) {
  let facultySectionsQuery = supabase
    .from("faculty_sections")
    .select("collegeSubjectId")
    .eq("collegeAcademicYearId", academicYearId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (sectionId) {
    facultySectionsQuery = facultySectionsQuery.eq("collegeSectionsId", sectionId);
  }

  const { data: facultySectionRows, error: facultySectionError } = await facultySectionsQuery;
  
  if (facultySectionError) throw facultySectionError;

  const subjectIds = Array.from(
    new Set(
      (facultySectionRows ?? [])
        .map((row) => row.collegeSubjectId)
        .filter((value): value is number => typeof value === "number"),
    ),
  );

  if (!subjectIds.length) {
    return [];
  }

  let query = supabase
    .from("college_subjects")
    .select("collegeSubjectId, subjectName")
    .eq("collegeId", collegeId)
    .eq("collegeAcademicYearId", academicYearId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .in("collegeSubjectId", subjectIds)
    .order("subjectName", { ascending: true });

  if (branchId != null) {
    query = query.eq("collegeBranchId", branchId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
