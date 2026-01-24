import { supabase } from "@/lib/supabaseClient";

export type SectionItem = {
    section: string;
    uuid: string;
};

export type CollegeSectionsRow = {
    collegeSectionsId: number;
    collegeSections: SectionItem[];
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
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }

    return data as CollegeSectionsRow;
}

export async function saveCollegeSections(
    payload: {
        collegeSections: SectionItem[];
        collegeEducationId: number;
        collegeBranchId: number;
        collegeAcademicYearId: number;
        collegeId: number;
    },
    adminId: number
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_sections")
        .upsert(
            {
                collegeSections: payload.collegeSections,
                collegeEducationId: payload.collegeEducationId,
                collegeBranchId: payload.collegeBranchId,
                collegeAcademicYearId: payload.collegeAcademicYearId,
                collegeId: payload.collegeId,
                createdBy: adminId,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            },
            {
                onConflict:
                    "collegeEducationId, collegeBranchId, collegeAcademicYearId, collegeId",
            }
        )
        .select("collegeSectionsId")
        .single();

    if (error) {
        console.error("saveCollegeSections error:", error);
        throw error;
    }

    return {
        success: true,
        collegeSectionsId: data.collegeSectionsId,
    };
}

export async function updateCollegeSections(
    collegeSectionsId: number,
    sections: SectionItem[]
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
