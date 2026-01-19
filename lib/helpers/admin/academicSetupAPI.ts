import { supabase } from "@/lib/supabaseClient";

<<<<<<< Updated upstream
export async function fetchCollegeDegrees() {
    const { data, error } = await supabase
        .from("college_degree")
        .select(`
      collegeDegreeId,
      degreeType,
      departments,
      createdBy,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt,
      years,
      sections
    `)
=======
// export async function fetchCollegeDegrees() {
//     const { data, error } = await supabase
//         .from("college_degree")
//         .select(`
//       collegeDegreeId,
//       degreeType,
//       departments,
//       createdBy,
//       is_deleted,
//       createdAt,
//       updatedAt,
//       deletedAt,
//       years,
//       sections
//     `)
//         .eq("is_deleted", false)
//         .order("collegeDegreeId", { ascending: true });

//     if (error) {
//         console.error("fetchCollegeDegrees error:", error);
//         throw error;
//     }

//     return data ?? [];
// }



type CollegeDegreeRow = {
    collegeDegreeId: number;
    degreeType: string;
    departments: string | string[] | null;
    years: unknown;
    sections: any;
};

type DegreeGroup = {
    degreeType: string;
    departments: Set<string>;
    years: Set<number>;
    sections: Record<string, Set<string>>;
};

export async function fetchCollegeDegrees() {
    const { data, error } = await supabase
        .from("college_degree")
        .select("collegeDegreeId, degreeType, departments, years, sections")
>>>>>>> Stashed changes
        .eq("is_deleted", false)
        .order("collegeDegreeId", { ascending: true });

    if (error) {
        console.error("fetchCollegeDegrees error:", error);
        throw error;
    }

<<<<<<< Updated upstream
    return data ?? [];
}
=======
    if (!data) return [];

    const degreeMap: Record<string, DegreeGroup> = {};

    data.forEach((row: CollegeDegreeRow) => {
        if (!row.degreeType) return;

        let safeSections: string[] = [];

        try {
            if (row.sections) {
                const sectionsArray = typeof row.sections === "string" ? JSON.parse(row.sections) : row.sections;
                if (Array.isArray(sectionsArray)) {
                    safeSections = sectionsArray
                        .filter((s: any) => s?.name)
                        .map((s: any) => s.name);
                }
            }
        } catch (err) {
            console.error("Failed to parse sections JSON", row.sections, err);
            safeSections = [];
        }

        if (!degreeMap[row.degreeType]) {
            degreeMap[row.degreeType] = {
                degreeType: row.degreeType,
                departments: new Set(),
                years: new Set(),
                sections: {},
            };
        }

        const group = degreeMap[row.degreeType];

        const deps = Array.isArray(row.departments)
            ? row.departments
            : typeof row.departments === "string"
                ? row.departments.split(",").map(d => d.trim())
                : [];

        deps.forEach(dep => group.departments.add(dep));

        if (Array.isArray(row.years)) {
            row.years.forEach(year => { if (typeof year === "number") group.years.add(year); });
        }

        group.departments.forEach(dep => {
            if (!group.sections[dep]) group.sections[dep] = new Set<string>();
            safeSections.forEach(sec => group.sections[dep].add(sec));
        });

    });

    return Object.values(degreeMap).map((group, index) => ({
        collegeDegreeId: index + 1,
        degreeType: group.degreeType,
        departments: Array.from(group.departments),
        years: Array.from(group.years).sort((a, b) => a - b),
        sections: Object.fromEntries(
            Object.entries(group.sections).map(([dep, secs]) => [
                dep.trim(),
                Array.from(secs).filter(Boolean)
            ])
        ),
    }));


}
>>>>>>> Stashed changes
