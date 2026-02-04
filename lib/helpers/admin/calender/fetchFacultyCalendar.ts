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

type FacultyFilterParams = {
    collegeId: number;
    collegeEducationId?: number;
    collegeBranchId?: number;
    collegeAcademicYearId?: number;
    collegeSubjectId?: number;
};

export async function fetchFilteredFaculties(filters: FacultyFilterParams) {
    let query = supabase
        .from("faculty_sections")
        .select(`
      facultyId,
      faculty:facultyId (
        facultyId,
        fullName,
        gender,
        updatedAt,
        collegeBranchId,
        branch:collegeBranchId (
        collegeBranchCode
        )
      ),
      subject:collegeSubjectId (
        collegeSubjectId,
        subjectName
      ),
      section:collegeSectionsId (
    collegeSectionsId,
    collegeBranchId,
    branch:collegeBranchId (
      collegeBranchCode
    )
  )
    `)
        .eq("isActive", true)
        .eq("faculty.collegeId", filters.collegeId);

    if (filters.collegeAcademicYearId) {
        query = query.eq("collegeAcademicYearId", filters.collegeAcademicYearId);
    }

    if (filters.collegeSubjectId) {
        query = query.eq("collegeSubjectId", filters.collegeSubjectId);
    }

    if (filters.collegeBranchId) {
        query = query.eq("faculty.collegeBranchId", filters.collegeBranchId);
    }

    if (filters.collegeEducationId) {
        query = query.eq("faculty.collegeEducationId", filters.collegeEducationId);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Faculty filter error:", error);
        return [];
    }

    const facultyMap = new Map<number, any>();

    data.forEach((row: any) => {
        if (!row.faculty) return;

        const id = row.faculty.facultyId;

        if (!facultyMap.has(id)) {
            facultyMap.set(id, {
                id: String(id),
                name: row.faculty.fullName,
                gender: row.faculty.gender,
                subjects: [],
                branch: row.faculty.branch?.collegeBranchCode ?? "—",
                lastUpdate: new Date(row.faculty.updatedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
                image: `https://i.pravatar.cc/100?u=${row.faculty.facultyId}`,
            });
        }

        if (
            row.subject?.subjectName &&
            (!filters.collegeBranchId ||
                row.section?.collegeBranchId === filters.collegeBranchId)
        ) {
            facultyMap.get(id).subjects.push(row.subject.subjectName);
        }

    });

    return Array.from(facultyMap.values()).map(f => ({
        ...f,
        subjects: Array.from(new Set(f.subjects)).join(", "),
    }));
}
