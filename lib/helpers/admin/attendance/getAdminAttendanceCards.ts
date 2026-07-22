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

// export async function getAdminAcademicsCards(
//   collegeId: number,
//   page: number,
//   limit: number,
//   search?: string,
//   filters?: {
//     educationId?: number | null;
//     branchId?: number | null;
//     academicYearId?: number | null;
//     sectionId?: number | null;
//     subjectId?: number | null;
//   },
// ) {
//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   let query = supabase
//     .from("college_sections")
//     .select(
//       `
//       collegeSectionsId,
//       collegeSections,
//       collegeAcademicYearId,
//       collegeEducationId,
//       collegeAcademicYear:collegeAcademicYearId (
//         collegeAcademicYear,
//         collegeAcademicYearId
//       ),
//       collegeBranch:collegeBranchId (
//         collegeBranchId,
//         collegeBranchType,
//         collegeBranchCode
//       ),
//       faculty_sections (
//         facultyId,
//         collegeAcademicYearId,
//         faculty (
//           facultyId,
//           fullName,
//           email,
//           collegeBranchId,
//           collegeEducationId
//         )
//       )
//     `,
//       { count: "exact" },
//     )
//     .eq("collegeId", collegeId)
//     .eq("isActive", true)
//     .is("deletedAt", null);

//   const searchText = search?.trim().toLowerCase();
//   let branchSearch: string | null = null;
//   let sectionSearch: string | null = null;

//   if (searchText) {
//     searchText.split(/[-\s]+/).forEach((part) => {
//       if (part.length === 1) sectionSearch = part.toUpperCase();
//       else branchSearch = part;
//     });
//   }

//   if (branchSearch) {
//     query = query.or(
//       `collegeBranchCode.ilike.%${branchSearch}%,collegeBranchType.ilike.%${branchSearch}%`,
//       { foreignTable: "collegeBranch" },
//     );
//   }

//   if (sectionSearch) {
//     query = query.eq("collegeSections", sectionSearch);
//   }

//   if (filters?.educationId) {
//     query = query.eq("collegeEducationId", filters.educationId);
//   }

//   if (filters?.branchId) {
//     query = query.eq("collegeBranchId", filters.branchId);
//   }

//   if (filters?.academicYearId) {
//     query = query.eq("collegeAcademicYearId", filters.academicYearId);
//   }

//   if (filters?.sectionId) {
//     query = query.eq("collegeSectionsId", filters.sectionId);
//   }

//   if (filters?.subjectId) {
//     query = query.eq("faculty_sections.collegeSubjectId", filters.subjectId);
//   }

//   const { data, count, error } = await query.range(from, to);

//   if (error) {
//     console.error("getAdminAcademicsCards error", error);
//     throw new Error("Failed to load academic records");
//   }

//   // ✅ OPTIMIZED: Prepare sections for batch fetching
//   const sections = (data ?? []).map(row => {
//     const branch = getBranch(row);
//     return {
//       collegeAcademicYearId: row.collegeAcademicYearId,
//       collegeSectionsId: row.collegeSectionsId,
//       collegeBranchId: branch?.collegeBranchId ?? 0,
//       collegeEducationId: row.collegeEducationId ?? 0,
//     };
//   });

//   // ✅ OPTIMIZED: Batch fetch all counts in parallel (3 queries instead of 45+)
//   const [studentCountMap, subjectCountMap, facultyCountMap] = await Promise.all([
//     getBatchStudentCounts(sections),
//     getBatchSubjectCounts(sections),
//     getBatchFacultyCounts(sections),
//   ]);

//   // ✅ OPTIMIZED: Map counts using lookups instead of queries
//   const enrichedData = (data ?? []).map((row) => {
//     const key = `${row.collegeAcademicYearId}-${row.collegeSectionsId}`;

//     return {
//       ...row,
//       studentCount: studentCountMap.get(key) || 0,
//       subjectCount: subjectCountMap.get(key) || 0,
//       facultyCount: facultyCountMap.get(key) || 0,
//     };
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

  if (sectionSearch) query = query.eq("collegeSections", sectionSearch);

  const eduId = parseIntegerId(filters?.educationId);
  const brId = parseIntegerId(filters?.branchId);
  const yrId = parseIntegerId(filters?.academicYearId);
  const secId = parseIntegerId(filters?.sectionId);
  const subId = parseIntegerId(filters?.subjectId);

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

  const sectionIds = [...new Set((data ?? []).map(s => s.collegeSectionsId))].filter(Boolean);

  const [studentCountMap, subjectCountMap, facultyCountMap, profilesRes, sectionStatsMap] = await Promise.all([
    getBatchStudentCounts(sections),
    getBatchSubjectCounts(sections),
    getBatchFacultyCounts(sections),
    facultyUserIds.size > 0 
      ? supabase.from("user_profile").select("userId, profileUrl").in("userId", Array.from(facultyUserIds)).eq("is_deleted", false)
      : Promise.resolve({ data: [] }),
    getBatchSectionStatsClient(sectionIds),
  ]);

  const profileMap = new Map<number, string>();
  (profilesRes.data ?? []).forEach((p: any) => {
    if (p.profileUrl) profileMap.set(p.userId, p.profileUrl);
  });

  const enrichedData = (data ?? []).map((row) => {
    const key = `${row.collegeAcademicYearId}-${row.collegeSectionsId}`;
    const stats = sectionStatsMap.get(row.collegeSectionsId);

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
      studentCount: studentCountMap.get(key) || 0,
      subjectCount: subjectCountMap.get(key) || 0,
      facultyCount: facultyCountMap.get(key) || 0,
      avgAttendance: stats?.avgAttendance || 0,
      belowThresholdCount: stats?.belowThresholdCount || 0,
    };
  });

  return {
    data: enrichedData,
    totalCount: count ?? 0,
  };
}

async function getBatchSectionStatsClient(sectionIds: number[]) {
  if (sectionIds.length === 0) return new Map<number, { avgAttendance: number; belowThresholdCount: number }>();

  const { data: histories } = await supabase
    .from("student_academic_history")
    .select("studentId, collegeSectionsId")
    .in("collegeSectionsId", sectionIds)
    .eq("isCurrent", true)
    .is("deletedAt", null);

  if (!histories || histories.length === 0) return new Map();

  const sectionStudentMap = new Map<number, number[]>();
  const allStudentIds: number[] = [];

  histories.forEach((h) => {
    if (!sectionStudentMap.has(h.collegeSectionsId)) {
      sectionStudentMap.set(h.collegeSectionsId, []);
    }
    sectionStudentMap.get(h.collegeSectionsId)?.push(h.studentId);
    allStudentIds.push(h.studentId);
  });

  if (allStudentIds.length === 0) return new Map();

  const { data: records } = await supabase
    .from("attendance_record")
    .select("studentId, status")
    .in("studentId", allStudentIds);

  if (!records || records.length === 0) return new Map();

  const studentStats = new Map<number, { present: number; total: number }>();

  records.forEach((r) => {
    if (["CLASS_CANCEL", "CANCELLED", "CANCEL_CLASS"].includes(r.status)) return;

    if (!studentStats.has(r.studentId)) {
      studentStats.set(r.studentId, { present: 0, total: 0 });
    }

    const s = studentStats.get(r.studentId)!;
    s.total++;

    if (r.status === "PRESENT" || r.status === "LATE") {
      s.present++;
    }
  });

  const statsMap = new Map<number, { avgAttendance: number; belowThresholdCount: number }>();

  sectionIds.forEach((secId) => {
    const students = sectionStudentMap.get(secId) || [];
    let sectionTotalPct = 0;
    let studentCountWithData = 0;
    let below75 = 0;

    students.forEach((sId) => {
      const stats = studentStats.get(sId);
      if (stats && stats.total > 0) {
        const pct = (stats.present / stats.total) * 100;
        sectionTotalPct += pct;
        studentCountWithData++;
        if (pct < 75) below75++;
      }
    });

    const avg = studentCountWithData > 0 ? Math.round(sectionTotalPct / studentCountWithData) : 0;
    statsMap.set(secId, { avgAttendance: avg, belowThresholdCount: below75 });
  });

  return statsMap;
}

export function mapAcademicCards(data: any[]) {
  return data.map((row) => {
    const branch = Array.isArray(row.collegeBranch)
      ? row.collegeBranch[0]
      : row.collegeBranch;

    const uniqueFacultiesMap = new Map<number, any>();
    row.faculty_sections?.forEach((fs: any) => {
      const f = Array.isArray(fs.faculty) ? fs.faculty[0] : fs.faculty;
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
      avgAttendance: row.avgAttendance ?? 0,
      belowThresholdCount: row.belowThresholdCount ?? 0,
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