import { supabase } from "@/lib/supabaseClient";

export type FinanceCalendarSectionRow = {
    financeCalendarSectionId: number;
    financeCalendarId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSemesterId: number;
    collegeSectionsId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchFinanceCalendarSections(
    financeCalendarId: number,
) {
    const { data, error } = await supabase
        .from("finance_calendar_sections")
        .select(`
      financeCalendarSectionId,
      financeCalendarId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSemesterId,
      collegeSectionsId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("financeCalendarId", financeCalendarId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("financeCalendarSectionId", { ascending: true });

    if (error) {
        console.error("fetchFinanceCalendarSections error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchExistingFinanceCalendarSection(
    payload: {
        financeCalendarId: number;
        collegeEducationId: number;
        collegeBranchId: number;
        collegeAcademicYearId: number;
        collegeSemesterId: number;
        collegeSectionsId: number;
    },
) {
    const { data, error } = await supabase
        .from("finance_calendar_sections")
        .select("financeCalendarSectionId")
        .eq("financeCalendarId", payload.financeCalendarId)
        .eq("collegeEducationId", payload.collegeEducationId)
        .eq("collegeBranchId", payload.collegeBranchId)
        .eq("collegeAcademicYearId", payload.collegeAcademicYearId)
        .eq("collegeSemesterId", payload.collegeSemesterId)
        .eq("collegeSectionsId", payload.collegeSectionsId)
        .is("deletedAt", null)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        throw error;
    }

    return { success: true, data };
}


export async function saveFinanceCalendarSection(
    payload: {
        financeCalendarSectionId?: number;
        financeCalendarId: number;
        collegeEducationId: number;
        collegeBranchId: number;
        collegeAcademicYearId: number;
        collegeSemesterId: number;
        collegeSectionsId: number;
    },
    createdBy: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("finance_calendar_sections")
        .upsert(
            {
                financeCalendarSectionId: payload.financeCalendarSectionId,
                financeCalendarId: payload.financeCalendarId,
                collegeEducationId: payload.collegeEducationId,
                collegeBranchId: payload.collegeBranchId,
                collegeAcademicYearId: payload.collegeAcademicYearId,
                collegeSemesterId: payload.collegeSemesterId,
                collegeSectionsId: payload.collegeSectionsId,
                createdBy,
                updatedAt: now,
            },
            {
                onConflict:
                    "financeCalendarId, collegeEducationId, collegeBranchId, collegeAcademicYearId, collegeSemesterId, collegeSectionsId",
            },
        )
        .select("financeCalendarSectionId")
        .single();

    if (error) {
        console.error("saveFinanceCalendarSection error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        financeCalendarSectionId: data.financeCalendarSectionId,
    };
}


export async function deactivateFinanceCalendarSection(
    financeCalendarSectionId: number,
) {
    const { error } = await supabase
        .from("finance_calendar_sections")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("financeCalendarSectionId", financeCalendarSectionId);

    if (error) {
        console.error("deactivateFinanceCalendarSection error:", error);
        return { success: false };
    }

    return { success: true };
}


export async function deactivateAllFinanceCalendarSections(
    financeCalendarId: number,
) {
    const { error } = await supabase
        .from("finance_calendar_sections")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("financeCalendarId", financeCalendarId);

    if (error) {
        console.error("deactivateAllFinanceCalendarSections error:", error);
        return { success: false };
    }

    return { success: true };
}
