import { supabase } from "@/lib/supabaseClient";

export type FinanceMeetingSectionRow = {
    financeMeetingSectionsId: number;
    financeMeetingId: number;
    collegeEducationId: number;
    collegeBranchId: number | null;
    collegeAcademicYearId: number | null;
    collegeSectionsId: number | null;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchFinanceMeetingSections(
    financeMeetingId: number,
) {
    const { data, error } = await supabase
        .from("finance_meetings_sections")
        .select(
            `
      financeMeetingSectionsId,
      financeMeetingId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSectionsId,
      createdBy,
      createdAt,
      updatedAt,
      deletedAt
    `,
        )
        .eq("financeMeetingId", financeMeetingId)
        .is("deletedAt", null)
        .order("financeMeetingSectionsId", { ascending: true });

    if (error) {
        console.error("fetchFinanceMeetingSections error:", error);
        throw error;
    }

    return data ?? [];
}


export async function saveFinanceMeetingSection(
    payload: {
        id?: number;
        financeMeetingId: number;
        collegeEducationId: number;
        collegeBranchId?: number | null;
        collegeAcademicYearId?: number | null;
        collegeSectionsId?: number | null;
    },
    financeManagerId: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("finance_meetings_sections")
        .upsert(
            {
                financeMeetingSectionsId: payload.id,
                financeMeetingId: payload.financeMeetingId,
                collegeEducationId: payload.collegeEducationId,
                collegeBranchId: payload.collegeBranchId ?? null,
                collegeAcademicYearId: payload.collegeAcademicYearId ?? null,
                collegeSectionsId: payload.collegeSectionsId ?? null,
                createdBy: financeManagerId,
                updatedAt: now,
            },
            {
                onConflict:
                    "financeMeetingId, collegeBranchId, collegeAcademicYearId, collegeSectionsId",
            },
        )
        .select("financeMeetingSectionsId")
        .single();

    if (error) {
        console.error("saveFinanceMeetingSection error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        financeMeetingSectionsId: data.financeMeetingSectionsId,
    };
}

export async function deleteFinanceMeetingSection(
    financeMeetingSectionsId: number,
) {
    const { error } = await supabase
        .from("finance_meetings_sections")
        .update({
            deletedAt: new Date().toISOString(),
        })
        .eq("financeMeetingSectionsId", financeMeetingSectionsId);

    if (error) {
        console.error("deleteFinanceMeetingSection error:", error);
        return { success: false };
    }

    return { success: true };
}


export async function deleteAllFinanceMeetingSections(
    financeMeetingId: number,
) {
    const { error } = await supabase
        .from("finance_meetings_sections")
        .update({
            deletedAt: new Date().toISOString(),
        })
        .eq("financeMeetingId", financeMeetingId)
        .is("deletedAt", null);

    if (error) {
        console.error("deleteAllFinanceMeetingSections error:", error);
        return { success: false };
    }

    return { success: true };
}
