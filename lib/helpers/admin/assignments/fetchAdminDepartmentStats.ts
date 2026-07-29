import { supabase } from "@/lib/supabaseClient";

// export async function fetchAdminDepartmentStats(collegeId: number, collegeEducationId: number) {
//   try {
//     const { data: sections, error } = await supabase
//       .from("faculty_sections")
//       .select(
//         `
//         facultyId,
//         collegeSubjectId,
//         collegeAcademicYearId,
//         college_academic_year (collegeAcademicYear),
//         college_sections (
//           collegeBranchId,
//           college_branch (collegeBranchCode, collegeBranchType)
//         ),
//         faculty (fullName, userId, email)
//       `,
//       )
//       .eq("isActive", true)
//       .eq("college_sections.collegeEducationId", collegeEducationId);

//     if (error) throw error;

//     const { data: students } = await supabase
//       .from("students")
//       .select("collegeBranchId")
//       .eq("collegeId", collegeId)
//       .eq("isActive", true);

//     const studentCounts = new Map<number, number>();
//     students?.forEach((s) => {
//       studentCounts.set(
//         s.collegeBranchId,
//         (studentCounts.get(s.collegeBranchId) || 0) + 1,
//       );
//     });

//     const grouped = new Map();

//     sections.forEach((item: any) => {
//       const sectionObj = Array.isArray(item.college_sections)
//         ? item.college_sections[0]
//         : item.college_sections;
//       const branchObj = sectionObj?.college_branch;
//       const branchCode = branchObj?.collegeBranchCode;
//       const branchId = sectionObj?.collegeBranchId;
//       const year = item.college_academic_year?.collegeAcademicYear;

//       if (!branchCode || !year) return;

//       const key = `${branchCode}-${year}`;

//       if (!grouped.has(key)) {
//         grouped.set(key, {
//           id: key,
//           name: branchCode,
//           deptCode: branchCode,
//           year: year,
//           facultySet: new Set(),
//           subjectIds: new Set<number>(),
//           studentCount: studentCounts.get(branchId) || 0,
//         });
//       }

//       const group = grouped.get(key);
//       group.subjectIds.add(item.collegeSubjectId);
//       if (item.faculty) group.facultySet.add(JSON.stringify(item.faculty));
//     });

//     const result = await Promise.all(
//       Array.from(grouped.values()).map(async (g) => {
//         const uniqueFaculty = Array.from(g.facultySet).map((f: any) =>
//           JSON.parse(f),
//         );
//         const subIds = Array.from(g.subjectIds) as number[];

//         let activeSubjectsCount = 0;
//         if (subIds.length > 0) {
//           const { data: assignments } = await supabase
//             .from("assignments")
//             .select("subjectId")
//             .in("subjectId", subIds)
//             .eq("status", "Active")
//             .eq("is_deleted", false);

//           activeSubjectsCount = new Set(assignments?.map((a) => a.subjectId))
//             .size;
//         }

//         return {
//           id: g.id,
//           name: g.name,
//           deptCode: g.deptCode,
//           year: g.year,
//           ...getDeptColor(g.name),
//           totalStudents: g.studentCount,
//           activeSubjects: activeSubjectsCount,
//           issuesRaised: 0,
//           facultyCount: uniqueFaculty.length,
//           facultyList: uniqueFaculty,
//         };
//       }),
//     );

//     return { data: result, error: null };
//   } catch (err: any) {
//     console.error("Admin Dept Fetch Error:", err);
//     return { data: [], error: err.message };
//   }
// }

const inflightStatsCache = new Map<string, Promise<any>>();

export async function fetchAdminDepartmentStats(
  collegeId: number,
  collegeEducationId: number,
  page: number = 1,
  limit: number = 10,
  search: string = "",
  deptFilter: string = "All",
  yearFilter: string = "All"
) {
  if (!collegeEducationId || !collegeId) {
    return { data: [], totalCount: 0, uniqueDepts: ["All"], uniqueYears: ["All"], error: null };
  }
  const cacheKey = `${collegeId}_${collegeEducationId}_${page}_${limit}_${search}_${deptFilter}_${yearFilter}`;
  if (inflightStatsCache.has(cacheKey)) {
    return inflightStatsCache.get(cacheKey)!;
  }
  const promise = executeFetch(collegeId, collegeEducationId, page, limit, search, deptFilter, yearFilter)
    .finally(() => {
      setTimeout(() => inflightStatsCache.delete(cacheKey), 500);
    });
  inflightStatsCache.set(cacheKey, promise);
  return promise;
}

export async function fetchAdminAllEducationStats(
  collegeId: number,
  collegeEducationIds: number[],
  page: number = 1,
  limit: number = 10,
  search: string = "",
  deptFilter: string = "All",
  yearFilter: string = "All",
) {
  if (!collegeId || collegeEducationIds.length === 0) {
    return {
      data: [],
      totalCount: 0,
      uniqueDepts: ["All"],
      uniqueYears: ["All"],
      error: null,
    };
  }

  const results = await Promise.all(
    collegeEducationIds.map(async (educationId) => {
      const result = await fetchAdminDepartmentStats(
        collegeId,
        educationId,
        1,
        10000,
        search,
        deptFilter,
        yearFilter,
      );

      return {
        ...result,
        data: (result.data || []).map(
          (item: { id: string | number; [key: string]: unknown }) => ({
          ...item,
          id: `${educationId}-${item.id}`,
          }),
        ),
      };
    }),
  );

  const allData = results.flatMap((result) => result.data || []);
  const from = (page - 1) * limit;

  return {
    data: allData.slice(from, from + limit),
    totalCount: allData.length,
    uniqueDepts: [
      "All",
      ...Array.from(
        new Set(
          results.flatMap((result) =>
            (result.uniqueDepts || []).filter((value: string) => value !== "All"),
          ),
        ),
      ),
    ],
    uniqueYears: [
      "All",
      ...Array.from(
        new Set(
          results.flatMap((result) =>
            (result.uniqueYears || []).filter((value: string) => value !== "All"),
          ),
        ),
      ),
    ],
    error: results.find((result) => result.error)?.error || null,
  };
}

async function executeFetch(
  collegeId: number,
  collegeEducationId: number,
  page: number,
  limit: number,
  search: string,
  deptFilter: string,
  yearFilter: string
) {
  try {

    // 1. Fetch base structure (exact original queries to prevent missing data)
    const [{ data: branchData }, { data: yearData }] = await Promise.all([
      supabase.from("college_branch").select("collegeBranchId, collegeBranchCode").eq("collegeId", collegeId).eq("collegeEducationId", collegeEducationId).eq("isActive", true),
      supabase.from("college_academic_year").select("collegeAcademicYearId, collegeAcademicYear").eq("collegeId", collegeId).eq("collegeEducationId", collegeEducationId)
    ]);

    const isSchool = !branchData || branchData.length === 0;
    const validYearNames = new Set((yearData || []).map((y) => y.collegeAcademicYear));
    const validYearIds = new Set((yearData || []).map((y) => y.collegeAcademicYearId));

    // 2. Fetch student history and faculty_sections concurrently in a single Promise.all to eliminate sequential roundtrips
    const [{ data: studentHistory }, { data: sections, error }] = await Promise.all([
      supabase
        .from("student_academic_history")
        .select("collegeAcademicYearId, students!inner(collegeBranchId, collegeId, collegeEducationId, isActive, status, deletedAt)")
        .eq("isCurrent", true)
        .is("deletedAt", null)
        .eq("students.collegeId", collegeId)
        .eq("students.collegeEducationId", collegeEducationId)
        .eq("students.isActive", true)
        .eq("students.status", "Active")
        .is("students.deletedAt", null),
      supabase
        .from("faculty_sections")
        .select(`
          facultyId,
          collegeSubjectId,
          collegeAcademicYearId,
          college_academic_year (collegeAcademicYear),
          college_sections (
            collegeBranchId,
            collegeEducationId,
            college_branch (collegeBranchCode, collegeBranchType)
          ),
          faculty (facultyId, fullName, userId, email, isActive, deletedAt, collegeEducationId, collegeBranchId)
        `)
        .eq("isActive", true)
        .is("deletedAt", null)
        .eq("college_sections.collegeEducationId", collegeEducationId)
    ]);

    if (error) throw error;

    const studentCountsByYear = new Map<number, number>();
    const studentCountsByBranchYear = new Map<string, number>();
    const studentCountsByBranch = new Map<number, number>();

    studentHistory?.forEach((row: any) => {
      const yearId = row.collegeAcademicYearId;
      const branchId = row.students?.collegeBranchId;
      if (yearId) {
        studentCountsByYear.set(yearId, (studentCountsByYear.get(yearId) || 0) + 1);
        if (branchId) {
          studentCountsByBranchYear.set(`${branchId}-${yearId}`, (studentCountsByBranchYear.get(`${branchId}-${yearId}`) || 0) + 1);
        }
      }
      if (branchId) {
        studentCountsByBranch.set(branchId, (studentCountsByBranch.get(branchId) || 0) + 1);
      }
    });

    // 4. Group sections into branch+year (or school class) cards
    const grouped = new Map();

    if (isSchool) {
      yearData?.forEach((y) => {
        const key = `School-${y.collegeAcademicYear}`;
        grouped.set(key, {
          id: key,
          name: y.collegeAcademicYear,
          deptCode: "School",
          year: y.collegeAcademicYear,
          branchId: null,
          facultyMap: new Map(),
          subjectIds: new Set<number>(),
          studentCount: studentCountsByYear.get(y.collegeAcademicYearId) || 0,
        });
      });
    } else {
      branchData?.forEach((b) => {
        yearData?.forEach((y) => {
          const key = `${b.collegeBranchCode}-${y.collegeAcademicYear}`;
          const count = studentCountsByBranchYear.get(`${b.collegeBranchId}-${y.collegeAcademicYearId}`) || 0;
          grouped.set(key, {
            id: key,
            name: b.collegeBranchCode,
            deptCode: b.collegeBranchCode,
            year: y.collegeAcademicYear,
            branchId: b.collegeBranchId,
            facultyMap: new Map(),
            subjectIds: new Set<number>(),
            studentCount: count,
          });
        });
      });
    }

    // Then, populate with active assignments/faculty data exclusively for valid academic years of this education type
    sections?.forEach((item: any) => {
      const sectionObj = Array.isArray(item.college_sections)
        ? item.college_sections[0]
        : item.college_sections;
      const branchObj = Array.isArray(sectionObj?.college_branch)
        ? sectionObj?.college_branch[0]
        : sectionObj?.college_branch;
      const branchCode = branchObj?.collegeBranchCode;
      const yearObj = Array.isArray(item.college_academic_year)
        ? item.college_academic_year[0]
        : item.college_academic_year;
      const year = yearObj?.collegeAcademicYear;

      // Ensure the section belongs strictly to one of the academic years for the current education type (prevents "1st Year" from leaking into School)
      if (!year || !validYearNames.has(year)) return;
      if (!isSchool && !branchCode) return;

      const key = isSchool ? `School-${year}` : `${branchCode}-${year}`;

      // Only add to existing groups belonging to this education type
      const group = grouped.get(key);
      if (!group) return;

      if (item.collegeSubjectId) group.subjectIds.add(item.collegeSubjectId);
      if (item.faculty) {
        const facObj = Array.isArray(item.faculty) ? item.faculty[0] : item.faculty;
        if (
          facObj && 
          facObj.isActive !== false && 
          !facObj.deletedAt && 
          (facObj.collegeEducationId === undefined || facObj.collegeEducationId === null || facObj.collegeEducationId === collegeEducationId)
        ) {
          const facId = facObj.facultyId || facObj.userId || item.facultyId;
          group.facultyMap.set(facId, {
            facultyId: facId,
            fullName: facObj.fullName,
            userId: facObj.userId,
            email: facObj.email
          });
        }
      }
    });

    let allGroups = Array.from(grouped.values());

    // 5. Extract unique dropdown options directly from base tables to ensure filter completeness
    const uniqueDepts = ["All", ...Array.from(new Set((branchData || []).map((b) => b.collegeBranchCode || "")))].filter(Boolean);
    const uniqueYears = ["All", ...Array.from(new Set((yearData || []).map((y) => y.collegeAcademicYear || "")))].filter(Boolean).sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return String(a).localeCompare(String(b));
    });

    // 6. Apply Filters
    const searchText = search.toLowerCase().trim();
    allGroups = allGroups.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchText);
      const matchesDept = deptFilter === "All" || item.deptCode === deptFilter;
      const matchesYear = yearFilter === "All" || item.year === yearFilter;
      return matchesSearch && matchesDept && matchesYear;
    });

    const totalCount = allGroups.length;

    // 7. Apply Pagination
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedGroups = allGroups.slice(from, to);

    // 8. Fetch heavy data for current page only: active assignments + profile images
    const subjectIdsToFetch = [...new Set(paginatedGroups.flatMap((g) => Array.from(g.subjectIds)))];
    const facultyUserIds = new Set<number>();
    paginatedGroups.forEach((g) => {
      Array.from(g.facultyMap.values()).forEach((f: any) => {
        if (f.userId) facultyUserIds.add(f.userId);
      });
    });

    const [assignmentsRes, profilesRes] = await Promise.all([
      subjectIdsToFetch.length > 0
        ? supabase.from("assignments").select("subjectId").eq("status", "Active").eq("is_deleted", false).in("subjectId", subjectIdsToFetch)
        : Promise.resolve({ data: [] }),
      facultyUserIds.size > 0
        ? supabase.from("user_profile").select("userId, profileUrl").in("userId", Array.from(facultyUserIds))
        : Promise.resolve({ data: [] })
    ]);

    const activeAssignments = new Set(assignmentsRes.data?.map((a) => a.subjectId));

    const profileMap = new Map<number, string>();
    profilesRes.data?.forEach((p: any) => {
      if (p.profileUrl) profileMap.set(p.userId, p.profileUrl);
    });

    // 9. Map final results
    const result = paginatedGroups.map((g) => {
      const subIds = Array.from(g.subjectIds) as number[];
      const activeSubjectsCount = subIds.filter(id => activeAssignments.has(id)).length;

      const uniqueFaculty = Array.from(g.facultyMap.values()).map((f: any) => {
        return {
          ...f,
          profileUrl: profileMap.get(f.userId) || "",
        };
      });

      return {
        id: g.id,
        name: g.name,
        deptCode: g.deptCode,
        year: g.year,
        ...getDeptColor(g.name),
        totalStudents: g.studentCount,
        activeSubjects: activeSubjectsCount,
        issuesRaised: 0,
        facultyCount: uniqueFaculty.length,
        facultyList: uniqueFaculty,
      };
    });

    return { data: result, totalCount, uniqueDepts, uniqueYears, error: null };
  } catch (err: any) {
    console.error("Admin Dept Fetch Error:", err?.message || err);
    return { data: [], totalCount: 0, uniqueDepts: ["All"], uniqueYears: ["All"], error: err?.message || "Unknown error" };
  }
}

function getDeptColor(code: string) {
  const map: any = {
    CSE: { text: "#FF767D", color: "#FFB4B8", bgColor: "#FFF5F5" },
    ECE: { text: "#FF9F7E", color: "#F3D3C8", bgColor: "#FFF9DB" },
    EEE: { text: "#F8CF64", color: "#F3E2B6", bgColor: "#FFF9DB" },
    IT: { text: "#66EEFA", color: "#BCECF0", bgColor: "#E7F5FF" },
  };
  return map[code] || { text: "#282828", color: "#E0E0E0", bgColor: "#F9F9F9" };
}
