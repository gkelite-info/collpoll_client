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

export async function fetchAdminDepartmentStats(
  collegeId: number,
  collegeEducationId: number,
  page: number = 1,
  limit: number = 10,
  search: string = "",
  deptFilter: string = "All",
  yearFilter: string = "All"
) {
  try {
    if (!collegeEducationId) {
       return { data: [], totalCount: 0, uniqueDepts: ["All"], uniqueYears: ["All"], error: null };
    }

    // 1. Fetch base structure (Lightweight query)
    const { data: sections, error } = await supabase
      .from("faculty_sections")
      .select(
        `
        facultyId,
        collegeSubjectId,
        collegeAcademicYearId,
        college_academic_year (collegeAcademicYear),
        college_sections (
          collegeBranchId,
          college_branch (collegeBranchCode, collegeBranchType)
        ),
        faculty (fullName, userId, email)
      `,
      )
      .eq("isActive", true)
      .eq("college_sections.collegeEducationId", collegeEducationId);

    if (error) throw error;

    const grouped = new Map();

    // 2. Group items in memory by Branch and Year
    sections.forEach((item: any) => {
      const sectionObj = Array.isArray(item.college_sections)
        ? item.college_sections[0]
        : item.college_sections;
      const branchObj = sectionObj?.college_branch;
      const branchCode = branchObj?.collegeBranchCode;
      const branchId = sectionObj?.collegeBranchId;
      const year = item.college_academic_year?.collegeAcademicYear;

      if (!branchCode || !year) return;

      const key = `${branchCode}-${year}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          name: branchCode,
          deptCode: branchCode,
          year: year,
          branchId: branchId, // Saved for fast parallel querying later
          facultySet: new Set(),
          subjectIds: new Set<number>(),
        });
      }

      const group = grouped.get(key);
      group.subjectIds.add(item.collegeSubjectId);
      if (item.faculty) group.facultySet.add(JSON.stringify(item.faculty));
    });

    let allGroups = Array.from(grouped.values());

    // 3. Extract unique dropdown options by fetching directly from base tables
    const [{ data: branchData }, { data: yearData }] = await Promise.all([
      supabase.from("college_branch").select("collegeBranchCode").eq("collegeId", collegeId).eq("collegeEducationId", collegeEducationId).eq("isActive", true),
      supabase.from("college_academic_year").select("collegeAcademicYear").eq("collegeId", collegeId).eq("collegeEducationId", collegeEducationId)
    ]);

    const uniqueDepts = ["All", ...Array.from(new Set((branchData || []).map((b) => b.collegeBranchCode || "")))].filter(Boolean);
    const uniqueYears = ["All", ...Array.from(new Set((yearData || []).map((y) => y.collegeAcademicYear || "")))].filter(Boolean).sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return String(a).localeCompare(String(b));
    });

    // 4. Apply Filters (Server-Side Logic)
    const searchText = search.toLowerCase().trim();
    allGroups = allGroups.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchText);
      const matchesDept = deptFilter === "All" || item.deptCode === deptFilter;
      const matchesYear = yearFilter === "All" || item.year === yearFilter;
      return matchesSearch && matchesDept && matchesYear;
    });

    const totalCount = allGroups.length;

    // 5. Apply Pagination (Slice the data so we only fetch heavy stats for the current page)
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedGroups = allGroups.slice(from, to);

    // 6. Extract unique IDs for the Current Page ONLY
    const branchIdsToFetch = [...new Set(paginatedGroups.map((g) => g.branchId))];
    const subjectIdsToFetch = [...new Set(paginatedGroups.flatMap((g) => Array.from(g.subjectIds)))];
    const facultyUserIds = new Set<number>();

    paginatedGroups.forEach((g) => {
      Array.from(g.facultySet).forEach((fStr: any) => {
        const f = JSON.parse(fStr);
        if (f.userId) facultyUserIds.add(f.userId);
      });
    });

    // 7. PARALLEL FETCH: Heavy data (Students, Assignments, Profiles)
    const [studentsRes, assignmentsRes, profilesRes] = await Promise.all([
      branchIdsToFetch.length > 0
        ? supabase.from("students").select("collegeBranchId").eq("collegeId", collegeId).eq("isActive", true).in("collegeBranchId", branchIdsToFetch)
        : Promise.resolve({ data: [] }),
      subjectIdsToFetch.length > 0
        ? supabase.from("assignments").select("subjectId").eq("status", "Active").eq("is_deleted", false).in("subjectId", subjectIdsToFetch)
        : Promise.resolve({ data: [] }),
      facultyUserIds.size > 0
        ? supabase.from("user_profile").select("userId, profileUrl").in("userId", Array.from(facultyUserIds)).eq("is_deleted", false)
        : Promise.resolve({ data: [] })
    ]);

    const studentCounts = new Map<number, number>();
    studentsRes.data?.forEach((s) => {
      studentCounts.set(s.collegeBranchId, (studentCounts.get(s.collegeBranchId) || 0) + 1);
    });

    const activeAssignments = new Set(assignmentsRes.data?.map((a) => a.subjectId));

    const profileMap = new Map<number, string>();
    profilesRes.data?.forEach((p: any) => {
      if (p.profileUrl) profileMap.set(p.userId, p.profileUrl);
    });

    // 8. Map final data injection
    const result = paginatedGroups.map((g) => {
      const uniqueFaculty = Array.from(g.facultySet).map((fStr: any) => {
        const f = JSON.parse(fStr);
        // Inject Profile URL here!
        return { ...f, profileUrl: profileMap.get(f.userId) || "" };
      });

      const subIds = Array.from(g.subjectIds) as number[];
      const activeSubjectsCount = subIds.filter(id => activeAssignments.has(id)).length;

      return {
        id: g.id,
        name: g.name,
        deptCode: g.deptCode,
        year: g.year,
        ...getDeptColor(g.name),
        totalStudents: studentCounts.get(g.branchId) || 0,
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
