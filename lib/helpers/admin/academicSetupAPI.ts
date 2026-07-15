import { AcademicData } from "@/app/(screens)/admin/academic-setup/components/AddAcademicSetup";
import { supabase } from "@/lib/supabaseClient";
import { isSchoolEducation } from "./academicSetup/schoolHelper";

type CollegeDegreeRow = {
  collegeDegreeId: number;
  degreeType: string;
  departments: string | string[] | null;
  years: string[] | number[] | null;
  sections: any;
};

type DegreeGroup = {
  degreeType: string;
  departments: Set<string>;
  years: Map<string, string>;
  sections: Record<string, Set<string>>;
};

export async function fetchAdminBranchesWithDetails(adminId: number, page: number = 1, limit: number = 10) {
  try {
    const { data: adminCtx } = await supabase
      .from("admins")
      .select("collegeId")
      .eq("adminId", adminId)
      .maybeSingle();

    const { data: adminEdus } = await supabase
      .from("admin_education_types")
      .select("collegeEducationId")
      .eq("adminId", adminId)
      .eq("isActive", true)
      .eq("is_deleted", false);

    const validEduIds = adminEdus ? adminEdus.map((e) => e.collegeEducationId) : [];


    const { data: educations, error: eduErr } = await supabase
      .from("college_education")
      .select("collegeEducationId, collegeEducationType, updatedAt")
      .in("collegeEducationId", validEduIds)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (eduErr) throw eduErr;
    if (!educations || educations.length === 0) return { data: [], total: 0 };

    const { data: branches, error: branchErr } = await supabase
      .from("college_branch")
      .select(`
        collegeBranchId,
        collegeBranchType,
        collegeBranchCode,
        collegeEducationId,
        updatedAt
      `)
      .eq("collegeId", adminCtx?.collegeId)
      .in("collegeEducationId", validEduIds)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (branchErr) throw branchErr;

    const [yearsRes, sectionsRes, batchesRes] = await Promise.all([
      supabase.from("college_academic_year").select("collegeAcademicYearId, collegeAcademicYear, collegeBranchId, collegeEducationId, updatedAt").in("collegeEducationId", validEduIds).eq("isActive", true).is("deletedAt", null),
      supabase.from("college_sections").select("collegeSectionsId, collegeSections, collegeBranchId, collegeAcademicYearId, collegeEducationId").in("collegeEducationId", validEduIds).eq("isActive", true).is("deletedAt", null),
      supabase.from("college_batches").select("collegeBatchId, collegeBatchName, collegeBranchId, collegeAcademicYearId, collegeEducationId").in("collegeEducationId", validEduIds).eq("isActive", true).is("deletedAt", null)
    ]);

    const years = yearsRes.data || [];
    const sections = sectionsRes.data || [];
    const batches = batchesRes.data || [];

    const flatYearlyData: any[] = [];

    educations.forEach((edu: any) => {
      const isSchool = isSchoolEducation(edu.collegeEducationType);

      if (isSchool) {
        // Schools don't have branches, filter years directly by educationId and null branchId
        const schoolYears = years.filter((y) => y.collegeEducationId === edu.collegeEducationId && y.collegeBranchId === null);

        if (schoolYears.length === 0) {
          flatYearlyData.push({
            id: `edu-${edu.collegeEducationId}`,
            degree: edu.collegeEducationType,
            branch: "",
            dept: "",
            year: "",
            sections: [],
            batch: "",
            timestamp: new Date(edu.updatedAt || 0).getTime(),
          });
        } else {
          schoolYears.forEach((yearObj) => {
            const yearSections = sections.filter((s) => s.collegeAcademicYearId === yearObj.collegeAcademicYearId && s.collegeBranchId === null);
            const yearBatches = batches.filter((b) => b.collegeAcademicYearId === yearObj.collegeAcademicYearId && b.collegeBranchId === null);

            const uniqueSections = Array.from(new Set(yearSections.map((s) => s.collegeSections).filter(Boolean)));
            const uniqueBatches = Array.from(new Set(yearBatches.map((b) => typeof b.collegeBatchName === "string" ? b.collegeBatchName.trim() : "").filter(Boolean)));

            flatYearlyData.push({
              id: `edu-${edu.collegeEducationId}-yr-${yearObj.collegeAcademicYearId}`,
              degree: edu.collegeEducationType,
              branch: "",
              dept: "",
              year: yearObj.collegeAcademicYear,
              sections: uniqueSections,
              batch: uniqueBatches[0] || "",
              timestamp: Math.max(
                new Date(edu.updatedAt || 0).getTime(),
                new Date(yearObj.updatedAt || 0).getTime()
              ),
            });
          });
        }
      } else {
        // Colleges use branches
        const eduBranches = (branches || []).filter((b) => b.collegeEducationId === edu.collegeEducationId);

        eduBranches.forEach((branch: any) => {
          const branchYears = years.filter((y) => y.collegeBranchId === branch.collegeBranchId);

          if (branchYears.length === 0) {
            flatYearlyData.push({
              id: branch.collegeBranchId.toString(),
              degree: edu.collegeEducationType,
              branch: branch.collegeBranchType,
              dept: branch.collegeBranchCode,
              year: "",
              sections: [],
              batch: "",
              timestamp: new Date(branch.updatedAt || 0).getTime(),
            });
          } else {
            branchYears.forEach((yearObj) => {
              const yearSections = sections.filter((s) => s.collegeAcademicYearId === yearObj.collegeAcademicYearId);
              const yearBatches = batches.filter((b) => b.collegeAcademicYearId === yearObj.collegeAcademicYearId);

              const uniqueSections = Array.from(new Set(yearSections.map((s) => s.collegeSections).filter(Boolean)));
              const uniqueBatches = Array.from(new Set(yearBatches.map((b) => typeof b.collegeBatchName === "string" ? b.collegeBatchName.trim() : "").filter(Boolean)));

              flatYearlyData.push({
                id: `${branch.collegeBranchId}-${yearObj.collegeAcademicYearId}`,
                degree: edu.collegeEducationType,
                branch: branch.collegeBranchType,
                dept: branch.collegeBranchCode,
                year: yearObj.collegeAcademicYear,
                sections: uniqueSections,
                batch: uniqueBatches[0] || "",
                timestamp: Math.max(
                  new Date(branch.updatedAt || 0).getTime(),
                  new Date(yearObj.updatedAt || 0).getTime()
                ),
              });
            });
          }
        });
      }
    });

    flatYearlyData.sort((a, b) => b.timestamp - a.timestamp);

    const total = flatYearlyData.length;
    const start = (page - 1) * limit;
    const paginatedData = flatYearlyData.slice(start, start + limit);

    return { data: paginatedData, total };
  } catch (err) {
    console.error("Error fetching admin branches:", err);
    return { data: [], total: 0 };
  }
}

export async function fetchAvailableBatchesByCollege(collegeId: number) {
  try {
    const { data: batches, error } = await supabase
      .from("college_batches")
      .select("collegeBatchName")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (error || !batches) return [];

    return Array.from(
      new Set(
        batches
          .map((b) => typeof b.collegeBatchName === "string" ? b.collegeBatchName.trim() : "")
          .filter(Boolean)
      )
    );
  } catch (err) {
    console.error("Error fetching available batches:", err);
    return [];
  }
}

export async function fetchAdminAssignedEducationsList(userId: number | string): Promise<{ collegeEducationId: number; collegeEducationType: string }[]> {
  try {
    const { data: admin, error: adminErr } = await supabase
      .from("admins")
      .select("adminId")
      .eq("userId", userId)
      .is("deletedAt", null)
      .single();

    if (adminErr || !admin?.adminId) {
      return [];
    }

    const { data: edu, error: eduErr } = await supabase
      .from("admin_education_types")
      .select(`
        collegeEducationId,
        college_education!inner(
          collegeEducationId,
          collegeEducationType
        )
      `)
      .eq("adminId", admin.adminId)
      .eq("isActive", true)
      .eq("is_deleted", false);

    if (eduErr || !edu) throw new Error("Education type not found");

    return edu.map((e: any) => e.college_education);
  } catch (err) {
    console.error("Error fetching admin assigned education:", err);
    return [];
  }
}

export async function fetchAdminSpecificEducation(collegeEducationId: number) {
  try {
    const { data, error } = await supabase
      .from("college_education")
      .select("collegeEducationType")
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .single();

    if (error) throw error;

    return { success: true, data: data.collegeEducationType };
  } catch (err) {
    console.error("Error fetching admin specific education:", err);
    return { success: false, data: null };
  }
}

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
        const sectionsArray =
          typeof row.sections === "string"
            ? JSON.parse(row.sections)
            : row.sections;
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
        years: new Map(),
        sections: {},
      };
    }

    const group = degreeMap[row.degreeType];

    const deps = Array.isArray(row.departments)
      ? row.departments
      : typeof row.departments === "string"
        ? row.departments.split(",").map((d) => d.trim())
        : [];

    deps.forEach((dep) => group.departments.add(dep));

    if (Array.isArray(row.years)) {
      row.years.forEach((y: any) => {
        if (!y?.uuid || !y?.name) return;

        const match = String(y.name).match(/\d+/);
        if (!match) return;

        const yearNumber = match[0];

        if (!group.years.has(yearNumber)) {
          group.years.set(yearNumber, y.uuid);
        }
      });
    }

    group.departments.forEach((dep) => {
      if (!group.sections[dep]) group.sections[dep] = new Set<string>();
      safeSections.forEach((sec) => group.sections[dep].add(sec));
    });
  });

  return Object.values(degreeMap).map((group, index) => ({
    collegeDegreeId: index + 1,
    degreeType: group.degreeType,
    departments: Array.from(group.departments),
    years: Array.from(group.years.entries())
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([yearNumber, uuid]) => ({
        uuid,
        label: yearNumber,
        value: uuid,
      })),
    sections: Object.fromEntries(
      Object.entries(group.sections).map(([dep, secs]) => [
        dep.trim(),
        Array.from(secs).filter(Boolean),
      ]),
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
  isEdit: boolean,
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

export async function fetchDegrees() {
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
    `,
    )
    .eq("is_deleted", false)
    .order("collegeDegreeId", { ascending: true });

  if (error) {
    console.error("fetchCollegeDegrees error:", error);
    throw error;
  }

  return data ?? [];
}
