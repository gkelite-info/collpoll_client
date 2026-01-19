import { AcademicData } from "@/app/(screens)/admin/academic-setup/components/AddAcademicSetup";
import { supabase } from "@/lib/supabaseClient";

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
        .eq("is_deleted", false)
        .order("collegeDegreeId", { ascending: true });

    if (error) {
        console.error("fetchCollegeDegrees error:", error);
        throw error;
    }

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

export async function fetchDegreeAndDepartments() {
    try {
        const { data, error } = await supabase.from("education_departments")
            .select(`
        educationId,
        departments,
        education:educationId (
          educationCode
        )
      `);

        if (error) throw error;

        const degreeMap: Record<string, string[]> = {};

        data?.forEach((row: any) => {
            const degreeName = row.education?.educationCode;

            let depts: string[] = [];
            if (Array.isArray(row.departments)) {
                depts = row.departments.map((d: any) => d.code || d.name);
            } else if (typeof row.departments === "string") {
                try {
                    const parsed = JSON.parse(row.departments);
                    depts = parsed.map((d: any) => d.code || d.name);
                } catch (e) {
                    console.error("Error parsing depts", e);
                }
            }

            if (degreeName) {
                degreeMap[degreeName] = depts;
            }
        });

        return { success: true, data: degreeMap };
    } catch (err) {
        console.error("Error fetching academic options:", err);
        return { success: false, data: {} };
    }
}

export async function fetchExistingSetup(degree: string, dept: string) {
    try {
        const { data, error } = await supabase
            .from("college_degree")
            .select("collegeDegreeId, sections, years")
            .eq("degreeType", degree)
            .eq("departments", dept)
            .is("deletedAt", null)
            .single();

        if (error) {
            if (error.code === "PGRST116") return { success: true, data: null };
            throw error;
        }

        const parseJson = (val: any) => {
            if (typeof val === "string") {
                try {
                    return JSON.parse(val);
                } catch (e) {
                    return [];
                }
            }
            return Array.isArray(val) ? val : [];
        };

        const sectionsRaw = parseJson(data.sections);
        const yearsRaw = parseJson(data.years);

        const formattedData = {
            id: data.collegeDegreeId,
            sections: sectionsRaw.map((s: any) => s.name || s),
            year: yearsRaw.map((y: any) => y.name || y),
        };

        return { success: true, data: formattedData };
    } catch (err) {
        console.error("Error checking existing setup:", err);
        return { success: false, data: null };
    }
}

export async function saveAcademicSetup(
    form: AcademicData,
    adminId: number | string,
    isEdit: boolean
) {
    try {
        const payload = {
            collegeDegreeId: form.id,
            degreeType: form.degree,
            departments: form.dept,
            years: form.year,
            sections: form.sections,
            createdBy: adminId,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            is_deleted: false,
        };

        const { error } = await supabase.from("college_degree").upsert(payload, {
            onConflict: "collegeDegreeId",
        });

        if (error) throw error;

        return { success: true };
    } catch (err) {
        console.error("Error saving academic data:", err);
        return { success: false, error: err };
    }
}

