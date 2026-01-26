import { supabase } from "@/lib/supabaseClient";


export type CollegeSectionsRow = {
    collegeSectionsId: number;
    collegeSections: string;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchCollegeSections(
    collegeId: number,
    collegeBranchId: number,
    collegeAcademicYearId: number
) {
    const { data, error } = await supabase
        .from("college_sections")
        .select(`
      collegeSectionsId,
      collegeSections,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("isActive", true)
        .is("deletedAt", null)

    // if (error) {
    //     if (error.code === "PGRST116") return null;
    //     throw error;
    // }

    if (error) throw error;

    return data as CollegeSectionsRow[];
}

export async function saveCollegeSections(
    payload: {
        collegeSections: string[];
        collegeEducationId: number;
        collegeBranchId: number;
        collegeAcademicYearId: number;
        collegeId: number;
    },
    adminId: number
) {
    const now = new Date().toISOString();

    await supabase
        .from("college_sections")
        .delete()
        .eq("collegeId", payload.collegeId)
        .eq("collegeBranchId", payload.collegeBranchId)
        .eq("collegeAcademicYearId", payload.collegeAcademicYearId);

    const rows = payload.collegeSections.map((section) => ({
        collegeSections: section,
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeId: payload.collegeId,
        createdBy: adminId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    }));

    const { error } = await supabase
        .from("college_sections")
        .insert(rows);

    if (error) throw error;

    return { success: true };
}

export async function updateCollegeSections(
    collegeSectionsId: number,
    sections: string
) {
    const { error } = await supabase
        .from("college_sections")
        .update({
            collegeSections: sections,
            updatedAt: new Date().toISOString(),
        })
        .eq("collegeSectionsId", collegeSectionsId)
        .is("deletedAt", null);

    if (error) {
        console.error("updateCollegeSections error:", error);
        throw error;
    }

    return { success: true };
}

export async function deactivateCollegeSections(
    collegeSectionsId: number
) {
    const { error } = await supabase
        .from("college_sections")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeSectionsId", collegeSectionsId);

    if (error) {
        console.error("deactivateCollegeSections error:", error);
        throw error;
    }

    return { success: true };
}
