import { AcademicData } from "@/app/(screens)/admin/academic-setup/components/AddAcademicSetup";
import { supabase } from "@/lib/supabaseClient";

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

export async function fetchCollegeDegrees() {
  const { data, error } = await supabase
    .from("college_degree")
    .select(
      `
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
    `
    )
    .eq("is_deleted", false)
    .order("collegeDegreeId", { ascending: true });

  if (error) {
    console.error("fetchCollegeDegrees error:", error);
    throw error;
  }

  return data ?? [];
}
