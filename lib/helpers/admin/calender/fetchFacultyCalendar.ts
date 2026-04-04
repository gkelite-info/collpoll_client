import { supabase } from "@/lib/supabaseClient";

type FilterParams = {
  facultyId?: number;
  department?: string;
  subject?: string;
  year?: number | "All";
};

// export const fetchFacultyCalendar = async (filters: FilterParams) => {
//     let query = supabase
//         .from("faculty")
//         .select(`
//       facultyId,
//       fullName,
//       collegeId,
//       collegeBranchId,
//       collegeEducationId,
//       updatedAt
//     `)
//         .eq("isActive", true);

//     if (filters.facultyId) {
//         query = query.eq("facultyId", filters.facultyId);
//     }

//     if (filters.department) {
//         query = query.filter(
//             "departments",
//             "cs",
//             JSON.stringify([{ code: filters.department }])
//         );
//     }

//     if (filters.subject) {
//         query = query.filter(
//             "subjects",
//             "cs",
//             JSON.stringify([{ name: filters.subject }])
//         );
//     }

//     if (filters.year && filters.year !== "All") {
//     query = query.filter(
//         "years",
//         "cs",
//         JSON.stringify([{ value: Number(filters.year) }])
//     );
// }

//     const { data, error } = await query;
//     if (error) throw error;

//     const extractNames = (arr: any[] = []) =>
//         arr.map(item => item.name).join(", ");

//     const extractYear = (years: any[] = []) =>
//         years?.length ? String(years[0].value) : "";

//     const formatDate = (date: string) =>
//         new Date(date).toLocaleDateString("en-IN", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });

//     return data.map((f: any) => ({
//         id: String(f.facultyId),
//         name: f.fullName,

//         department: extractDeptCodes(f.departments),

//         subjects: extractNames(f.subjects),
//         year: extractYear(f.years),
//         lastUpdate: formatDate(f.updatedAt),
//         image: "/avatar-placeholder.png",
//     }));
// };

// type FacultyFilterParams = {
//     collegeId: number;
//     collegeEducationId?: number;
//     collegeBranchId?: number;
//     collegeAcademicYearId?: number;
//     collegeSubjectId?: number;
//     page?: number;
//     limit?: number;
// };

// export async function fetchFilteredFaculties(filters: FacultyFilterParams) {
//     const page = filters.page ?? 1;
//     const limit = filters.limit ?? 15;
//     const from = (page - 1) * limit;
//     const to = from + limit - 1;

//     let query = supabase
//         .from("faculty_sections")
//         .select(`
//       facultyId,
//       faculty:facultyId (
//         facultyId,
//         fullName,
//         gender,
//         updatedAt,
//         collegeBranchId,
//         branch:collegeBranchId (
//         collegeBranchCode
//         )
//       ),
//       subject:collegeSubjectId (
//         collegeSubjectId,
//         subjectName
//       ),
//       section:collegeSectionsId (
//     collegeSectionsId,
//     collegeBranchId,
//     branch:collegeBranchId (
//       collegeBranchCode
//     )
//   )`,
//         { count: "exact" }
// )
//         .eq("isActive", true)
//         .eq("faculty.collegeId", filters.collegeId);

//     if (filters.collegeAcademicYearId) {
//         query = query.eq("collegeAcademicYearId", filters.collegeAcademicYearId);
//     }

//     if (filters.collegeSubjectId) {
//         query = query.eq("collegeSubjectId", filters.collegeSubjectId);
//     }

//     if (filters.collegeBranchId) {
//         query = query.eq("faculty.collegeBranchId", filters.collegeBranchId);
//     }

//     if (filters.collegeEducationId) {
//         query = query.eq("faculty.collegeEducationId", filters.collegeEducationId);
//     }

//     query = query.range(from, to);

//     const { data, error, count } = await query;
//     if (error) {
//         console.error("Faculty filter error:", error);
//         return {data: [], total: 0};
//     }

//     const facultyMap = new Map<number, any>();

//     data.forEach((row: any) => {
//         if (!row.faculty) return;

//         const id = row.faculty.facultyId;

//         if (!facultyMap.has(id)) {
//             facultyMap.set(id, {
//                 id: String(id),
//                 name: row.faculty.fullName,
//                 gender: row.faculty.gender,
//                 subjects: [],
//                 branch: row.faculty.branch?.collegeBranchCode ?? "—",
//                 lastUpdate: new Date(row.faculty.updatedAt).toLocaleDateString("en-IN", {
//                     day: "2-digit",
//                     month: "short",
//                     year: "numeric",
//                 }),
//                 image: `https://i.pravatar.cc/100?u=${row.faculty.facultyId}`,
//             });
//         }

//         if (
//             row.subject?.subjectName &&
//             (!filters.collegeBranchId ||
//                 row.section?.collegeBranchId === filters.collegeBranchId)
//         ) {
//             facultyMap.get(id).subjects.push(row.subject.subjectName);
//         }

//     });

//     const result = Array.from(facultyMap.values()).map(f => ({
//         ...f,
//         subjects: Array.from(new Set(f.subjects)).join(", "),
//     }));

//     return {
//         data: result,
//         total: count ?? 0,
//     };
// }

// type FacultyFilterParams = {
//     collegeId: number;
//     collegeEducationId?: number;
//     collegeBranchId?: number;
//     collegeAcademicYearId?: number;
//     collegeSubjectId?: number;
//     page?: number;
//     limit?: number;
// };

// export async function fetchFilteredFaculties(filters: FacultyFilterParams) {
//     const page = filters.page ?? 1;
//     const limit = filters.limit ?? 15;
//     const from = (page - 1) * limit;
//     const to = from + limit - 1;

//     let allowedFacultyIds: number[] | null = null;

//     if (filters.collegeAcademicYearId || filters.collegeSubjectId) {
//         let sectionFilterQuery = supabase
//             .from("faculty_sections")
//             .select("facultyId")
//             .eq("isActive", true);

//         if (filters.collegeAcademicYearId) {
//             sectionFilterQuery = sectionFilterQuery.eq("collegeAcademicYearId", filters.collegeAcademicYearId);
//         }

//         if (filters.collegeSubjectId) {
//             sectionFilterQuery = sectionFilterQuery.eq("collegeSubjectId", filters.collegeSubjectId);
//         }

//         const { data: sectionRows, error: sectionFilterError } = await sectionFilterQuery;

//         if (sectionFilterError) {
//             console.error("Section pre-filter error:", sectionFilterError);
//             return { data: [], total: 0 };
//         }

//         allowedFacultyIds = Array.from(
//             new Set((sectionRows ?? []).map((r: any) => r.facultyId))
//         );

//         if (allowedFacultyIds.length === 0) {
//             return { data: [], total: 0 };
//         }
//     }

//     let facultyQuery = supabase
//         .from("faculty")
//         .select(
//             `
//             facultyId,
//             fullName,
//             gender,
//             updatedAt,
//             collegeBranchId,
//             branch:collegeBranchId (
//                 collegeBranchCode
//             )
//             `,
//             { count: "exact" }
//         )
//         .eq("isActive", true)
//         .eq("collegeId", filters.collegeId);

//     if (filters.collegeEducationId) {
//         facultyQuery = facultyQuery.eq("collegeEducationId", filters.collegeEducationId);
//     }

//     if (filters.collegeBranchId) {
//         facultyQuery = facultyQuery.eq("collegeBranchId", filters.collegeBranchId);
//     }

//     if (allowedFacultyIds !== null) {
//         facultyQuery = facultyQuery.in("facultyId", allowedFacultyIds);
//     }

//     facultyQuery = facultyQuery.range(from, to);

//     const { data: facultyData, error: facultyError, count } = await facultyQuery;

//     if (facultyError) {
//         console.error("Faculty fetch error:", facultyError);
//         return { data: [], total: 0 };
//     }

//     if (!facultyData || facultyData.length === 0) {
//         return { data: [], total: 0 };
//     }

//     const facultyIds = facultyData.map((f: any) => f.facultyId);

//     let sectionsQuery = supabase
//         .from("faculty_sections")
//         .select(
//             `
//             facultyId,
//             subject:collegeSubjectId (
//                 collegeSubjectId,
//                 subjectName
//             ),
//             section:collegeSectionsId (
//                 collegeSectionsId,
//                 collegeBranchId
//             )
//             `
//         )
//         .eq("isActive", true)
//         .in("facultyId", facultyIds);

//     if (filters.collegeAcademicYearId) {
//         sectionsQuery = sectionsQuery.eq("collegeAcademicYearId", filters.collegeAcademicYearId);
//     }

//     if (filters.collegeSubjectId) {
//         sectionsQuery = sectionsQuery.eq("collegeSubjectId", filters.collegeSubjectId);
//     }

//     const { data: sectionsData, error: sectionsError } = await sectionsQuery;

//     if (sectionsError) {
//         console.error("Sections fetch error:", sectionsError);
//     }

//     const subjectsByFaculty = new Map<number, Set<string>>();

//     (sectionsData ?? []).forEach((row: any) => {
//         if (!row.subject?.subjectName) return;

//         if (
//             filters.collegeBranchId &&
//             row.section?.collegeBranchId !== filters.collegeBranchId
//         ) return;

//         if (!subjectsByFaculty.has(row.facultyId)) {
//             subjectsByFaculty.set(row.facultyId, new Set());
//         }
//         subjectsByFaculty.get(row.facultyId)!.add(row.subject.subjectName);
//     });

//     const result = facultyData.map((f: any) => ({
//         id: String(f.facultyId),
//         name: f.fullName,
//         gender: f.gender,
//         branch: f.branch?.collegeBranchCode ?? "—",
//         subjects: Array.from(subjectsByFaculty.get(f.facultyId) ?? []).join(", "),
//         lastUpdate: new Date(f.updatedAt).toLocaleDateString("en-IN", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         }),
//         image: `https://i.pravatar.cc/100?u=${f.facultyId}`,
//     }));

//     return {
//         data: result,
//         total: count ?? 0,
//     };
// }

type FacultyFilterParams = {
  collegeId: number;
  collegeEducationId?: number;
  collegeBranchId?: number;
  collegeAcademicYearId?: number;
  collegeSubjectId?: number;
  page?: number;
  limit?: number;
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
      sectionFilterQuery = sectionFilterQuery.eq(
        "collegeAcademicYearId",
        filters.collegeAcademicYearId,
      );
    }

    if (filters.collegeSubjectId) {
      sectionFilterQuery = sectionFilterQuery.eq(
        "collegeSubjectId",
        filters.collegeSubjectId,
      );
    }

    const { data: sectionRows, error: sectionFilterError } =
      await sectionFilterQuery;

    if (sectionFilterError) {
      console.error("Section pre-filter error:", sectionFilterError);
      return { data: [], total: 0 };
    }

    allowedFacultyIds = Array.from(
      new Set((sectionRows ?? []).map((r: any) => r.facultyId)),
    );

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
      { count: "exact" },
    )
    .eq("isActive", true)
    .eq("collegeId", filters.collegeId);

  if (filters.collegeEducationId) {
    facultyQuery = facultyQuery.eq(
      "collegeEducationId",
      filters.collegeEducationId,
    );
  }

  if (filters.collegeBranchId) {
    facultyQuery = facultyQuery.eq("collegeBranchId", filters.collegeBranchId);
  }

  if (allowedFacultyIds !== null) {
    facultyQuery = facultyQuery.in("facultyId", allowedFacultyIds);
  }

  facultyQuery = facultyQuery.range(from, to);

  const { data: facultyData, error: facultyError, count } = await facultyQuery;

  if (facultyError) {
    console.error("Faculty fetch error:", facultyError);
    return { data: [], total: 0 };
  }

  if (!facultyData || facultyData.length === 0) {
    return { data: [], total: 0 };
  }

  const facultyIds = facultyData.map((f: any) => f.facultyId);
  const userIds = facultyData.map((f: any) => f.userId);

  // ---> NEW: FETCH USER PROFILES FOR IMAGES <---
  const { data: profilesData } = await supabase
    .from("user_profile")
    .select("userId, profileUrl")
    .in("userId", userIds)
    .eq("is_deleted", false);

  // Create a map for O(1) lookups
  const profileMap = new Map<number, string>();
  (profilesData ?? []).forEach((p: any) => {
    if (p.profileUrl) profileMap.set(p.userId, p.profileUrl);
  });

  let sectionsQuery = supabase
    .from("faculty_sections")
    .select(
      `
      facultyId,
      subject:collegeSubjectId (
        collegeSubjectId,
        subjectName
      ),
      section:collegeSectionsId (
        collegeSectionsId,
        collegeBranchId
      )
      `,
    )
    .eq("isActive", true)
    .in("facultyId", facultyIds);

  if (filters.collegeAcademicYearId) {
    sectionsQuery = sectionsQuery.eq(
      "collegeAcademicYearId",
      filters.collegeAcademicYearId,
    );
  }

  if (filters.collegeSubjectId) {
    sectionsQuery = sectionsQuery.eq(
      "collegeSubjectId",
      filters.collegeSubjectId,
    );
  }

  const { data: sectionsData, error: sectionsError } = await sectionsQuery;

  if (sectionsError) {
    console.error("Sections fetch error:", sectionsError);
  }

  const subjectsByFaculty = new Map<number, Set<string>>();

  (sectionsData ?? []).forEach((row: any) => {
    if (!row.subject?.subjectName) return;

    if (
      filters.collegeBranchId &&
      row.section?.collegeBranchId !== filters.collegeBranchId
    )
      return;

    if (!subjectsByFaculty.has(row.facultyId)) {
      subjectsByFaculty.set(row.facultyId, new Set());
    }
    subjectsByFaculty.get(row.facultyId)!.add(row.subject.subjectName);
  });

  const result = facultyData.map((f: any) => {
    // Check if the user has an uploaded profile picture
    const customImage = profileMap.get(f.userId);
    // If not, assign a default based on their gender (matching your dashboard logic)
    const fallbackImage =
      f.gender === "Female" ? "/faculty-f.png" : "/faculty-male.png";

    return {
      id: String(f.facultyId),
      name: f.fullName,
      gender: f.gender,
      branch: f.branch?.collegeBranchCode ?? "—",
      subjects:
        Array.from(subjectsByFaculty.get(f.facultyId) ?? []).join(", ") || "—",
      lastUpdate: new Date(f.updatedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      // ---> USE CUSTOM IMAGE OR FALLBACK <---
      image: customImage || fallbackImage,
    };
  });

  return {
    data: result,
    total: count ?? 0,
  };
}
