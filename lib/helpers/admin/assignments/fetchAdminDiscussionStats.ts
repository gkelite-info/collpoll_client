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

export async function fetchAdminDiscussionStats(
  collegeId: number,
  collegeEducationId: number,
  page: number = 1,
  limit: number = 10,
  search: string = "",
  deptFilter: string = "All",
  yearFilter: string = "All",
  subjectFilter: string = "All",
  sectionFilter: string = "All"
) {
  if (!collegeEducationId || !collegeId) {
    return { data: [], totalCount: 0, uniqueDepts: ["All"], uniqueYears: ["All"], uniqueSubjects: ["All"], uniqueSections: ["All"], error: null };
  }
  const cacheKey = `${collegeId}_${collegeEducationId}_${page}_${limit}_${search}_${deptFilter}_${yearFilter}_${subjectFilter}_${sectionFilter}`;
  if (inflightStatsCache.has(cacheKey)) {
    return inflightStatsCache.get(cacheKey)!;
  }
  const promise = executeFetch(collegeId, collegeEducationId, page, limit, search, deptFilter, yearFilter, subjectFilter, sectionFilter)
    .finally(() => {
      setTimeout(() => inflightStatsCache.delete(cacheKey), 500);
    });
  inflightStatsCache.set(cacheKey, promise);
  return promise;
}

export async function fetchAdminAllDiscussionStats(
  collegeId: number,
  collegeEducationIds: number[],
  page: number = 1,
  limit: number = 10,
  search: string = "",
  deptFilter: string = "All",
  yearFilter: string = "All",
  subjectFilter: string = "All",
  sectionFilter: string = "All"
) {
  if (!collegeId || collegeEducationIds.length === 0) {
    return {
      data: [],
      totalCount: 0,
      uniqueDepts: ["All"],
      uniqueYears: ["All"],
      uniqueSubjects: ["All"],
      uniqueSections: ["All"],
      error: null,
    };
  }

  const results = await Promise.all(
    collegeEducationIds.map(async (educationId) => {
      const result = await fetchAdminDiscussionStats(
        collegeId,
        educationId,
        1,
        10000,
        search,
        deptFilter,
        yearFilter,
        subjectFilter,
        sectionFilter
      );

      return {
        ...result,
        data: (result.data || []).map(
          (item: { id: string | number; [key: string]: unknown }) => ({
          ...item,
          id: `${educationId}-${item.id}`,
          collegeEducationId: educationId,
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
    uniqueSubjects: [
      "All",
      ...Array.from(
        new Set(
          results.flatMap((result) =>
            (result.uniqueSubjects || []).filter((value: string) => value !== "All"),
          ),
        ),
      ),
    ],
    uniqueSections: [
      "All",
      ...Array.from(
        new Set(
          results.flatMap((result) =>
            (result.uniqueSections || []).filter((value: string) => value !== "All"),
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
  yearFilter: string,
  subjectFilter: string,
  sectionFilter: string
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
          college_subjects (subjectName),
          collegeAcademicYearId,
          college_academic_year (collegeAcademicYear),
          college_sections (
            collegeSections,
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
          subjectNames: new Set<string>(),
          sectionNames: new Set<string>(),
          studentCount: studentCountsByYear.get(y.collegeAcademicYearId) || 0,
          yearId: y.collegeAcademicYearId,
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
            subjectNames: new Set<string>(),
            sectionNames: new Set<string>(),
            studentCount: count,
            yearId: y.collegeAcademicYearId,
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

      const subjectName = Array.isArray(item.college_subjects) ? item.college_subjects[0]?.subjectName : item.college_subjects?.subjectName;
      if (subjectName) group.subjectNames.add(subjectName);
      const sectionName = sectionObj?.collegeSections;
      if (sectionName) group.sectionNames.add(sectionName);

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

    const filteredSectionsForDropdowns = (sections || []).filter((s: any) => {
      const sectionObj = Array.isArray(s.college_sections) ? s.college_sections[0] : s.college_sections;
      const branchObj = Array.isArray(sectionObj?.college_branch) ? sectionObj?.college_branch[0] : sectionObj?.college_branch;
      const yearObj = Array.isArray(s.college_academic_year) ? s.college_academic_year[0] : s.college_academic_year;
      
      const year = yearObj?.collegeAcademicYear;
      const branchCode = branchObj?.collegeBranchCode;
      
      const matchesYear = yearFilter === "All" || year === yearFilter;
      const matchesDept = deptFilter === "All" || branchCode === deptFilter;
      
      return matchesYear && (isSchool || matchesDept);
    });

    const uniqueSubjects = ["All", ...Array.from(new Set(
      filteredSectionsForDropdowns.map((s: any) => {
        const sub = Array.isArray(s.college_subjects) ? s.college_subjects[0] : s.college_subjects;
        return sub?.subjectName;
      }).filter(Boolean)
    ))].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : String(a).localeCompare(String(b)));

    const uniqueSections = ["All", ...Array.from(new Set(
      filteredSectionsForDropdowns.map((s: any) => {
        const sec = Array.isArray(s.college_sections) ? s.college_sections[0] : s.college_sections;
        return sec?.collegeSections;
      }).filter(Boolean)
    ))].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : String(a).localeCompare(String(b)));

    // 6. Apply Filters
    const searchText = search.toLowerCase().trim();
    allGroups = allGroups.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchText) ||
        Array.from(item.facultyMap.values()).some((f: any) =>
          f.fullName?.toLowerCase().includes(searchText)
        );
      const matchesDept = deptFilter === "All" || item.deptCode === deptFilter;
      const matchesYear = yearFilter === "All" || item.year === yearFilter;
      const matchesSubject = subjectFilter === "All" || item.subjectNames.has(subjectFilter);
      const matchesSection = sectionFilter === "All" || item.sectionNames.has(sectionFilter);
      return matchesSearch && matchesDept && matchesYear && matchesSubject && matchesSection;
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

    const today = new Date().toISOString().split("T")[0];
    const [discussionsRes, profilesRes] = await Promise.all([
      subjectIdsToFetch.length > 0
        ? supabase.from("discussion_forum_sections")
          .select("discussionId, collegeSectionsId, discussion_forum!inner(isActive, is_deleted, deadline), college_sections!inner(collegeBranchId, collegeAcademicYearId)")
          .eq("discussion_forum.isActive", true)
          .eq("discussion_forum.is_deleted", false)
          .gte("discussion_forum.deadline", today)
          .eq("isActive", true)
          .eq("is_deleted", false)
        : Promise.resolve({ data: [] }),
      facultyUserIds.size > 0
        ? supabase.from("user_profile").select("userId, profileUrl").in("userId", Array.from(facultyUserIds))
        : Promise.resolve({ data: [] })
    ]);

    // We only care about active discussion counts per branch/year (or school/year)
    // Actually, discussion_forums are not tied to subjectId directly! They are tied to collegeSectionsId.
    // If the filters include Subject or Section, we already filtered the groups!
    // But wait, the card needs "Active Discussions" count. 
    // We should compute how many discussions belong to the current group's sections.
    const activeDiscussionsByGroup = new Map<string, number>();
    
    discussionsRes.data?.forEach((d: any) => {
      const branchId = d.college_sections?.collegeBranchId;
      const yearId = d.college_sections?.collegeAcademicYearId;
      const key = isSchool ? `School-${yearId}` : `${branchId}-${yearId}`;
      activeDiscussionsByGroup.set(key, (activeDiscussionsByGroup.get(key) || 0) + 1);
    });

    const profileMap = new Map<number, string>();
    profilesRes.data?.forEach((p: any) => {
      if (p.profileUrl) profileMap.set(p.userId, p.profileUrl);
    });

    // 9. Map final results
    const result = paginatedGroups.map((g) => {
      const discussionCount = activeDiscussionsByGroup.get(isSchool ? `School-${g.yearId}` : `${g.branchId}-${g.yearId}`) || 0;

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
        yearId: g.yearId,
        branchId: g.branchId,
        ...getDeptColor(g.name),
        totalStudents: g.studentCount,
        activeSubjects: discussionCount,
        issuesRaised: 0,
        facultyCount: uniqueFaculty.length,
        facultyList: uniqueFaculty,
        collegeEducationId,
      };
    });

    return { data: result, totalCount, uniqueDepts, uniqueYears, uniqueSubjects, uniqueSections, error: null };
  } catch (err: any) {
    console.error("Admin Dept Fetch Error:", err?.message || err);
    return { data: [], totalCount: 0, uniqueDepts: ["All"], uniqueYears: ["All"], uniqueSubjects: ["All"], uniqueSections: ["All"], error: err?.message || "Unknown error" };
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
