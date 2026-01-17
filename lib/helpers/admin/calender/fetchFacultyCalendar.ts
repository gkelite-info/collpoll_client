import { supabase } from "@/lib/supabaseClient";

type FilterParams = {
    facultyId?: number;
    department?: string;
    subject?: string;
    year?: number | "All";
};

export const fetchFacultyCalendar = async (filters: FilterParams) => {
    /* -------------------------------
       Build query with filters
    --------------------------------*/
    let query = supabase
        .from("faculty")
        .select(`
      facultyId,
      fullName,
      departments,
      subjects,
      years,
      updatedAt
    `)
        .eq("is_deleted", false);

    if (filters.facultyId) {
        query = query.eq("facultyId", filters.facultyId);
    }

    if (filters.department) {
        query = query.filter(
            "departments",
            "cs",
            JSON.stringify([{ code: filters.department }])
        );
    }

    if (filters.subject) {
        query = query.filter(
            "subjects",
            "cs",
            JSON.stringify([{ name: filters.subject }])
        );
    }

    if (filters.year && filters.year !== "All") {
    query = query.filter(
        "years",
        "cs",
        JSON.stringify([{ value: Number(filters.year) }])
    );
}



    const { data, error } = await query;
    if (error) throw error;

    /* -------------------------------
       Local format helpers
    --------------------------------*/
    const extractNames = (arr: any[] = []) =>
        arr.map(item => item.name).join(", ");

    const extractYear = (years: any[] = []) =>
        years?.length ? String(years[0].value) : "";

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    /* -------------------------------
       Map DB → UI-ready object
    --------------------------------*/
    return data.map((f: any) => ({
        id: String(f.facultyId),
        name: f.fullName,

        // ✅ show department codes
        department: extractDeptCodes(f.departments),

        subjects: extractNames(f.subjects),
        year: extractYear(f.years),
        lastUpdate: formatDate(f.updatedAt),
        image: "/avatar-placeholder.png", // static for now
    }));
};

/* -------------------------------
   Added solution (ONLY this)
--------------------------------*/
const extractDeptCodes = (departments: any[] = []) =>
    departments.map(dep => dep.code ?? dep.name).join(", ");
