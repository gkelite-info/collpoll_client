import { supabase } from "@/lib/supabaseClient";

export type FinanceMeetingRow = {
    financeMeetingId: number;
    title: string;
    description: string;
    role: string;
    date: string;
    fromTime: string;
    toTime: string;
    collegeBranchId: number | null;
    collegeAcademicYearId: number | null;
    collegeSectionsId: number | null;
    meetingLink: string;
    notificationType: string;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchFinanceMeetings(filters?: {
    collegeBranchId?: number;
    collegeAcademicYearId?: number;
    collegeSectionsId?: number;
}) {
    let query = supabase
        .from("finance_meetings")
        .select(
            `
      financeMeetingId,
      title,
      description,
      role,
      date,
      fromTime,
      toTime,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSectionsId,
      meetingLink,
      notificationType,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
        )
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("date", { ascending: true })
        .order("fromTime", { ascending: true });

    if (filters?.collegeBranchId) {
        query = query.eq("collegeBranchId", filters.collegeBranchId);
    }

    if (filters?.collegeAcademicYearId) {
        query = query.eq(
            "collegeAcademicYearId",
            filters.collegeAcademicYearId,
        );
    }

    if (filters?.collegeSectionsId) {
        query = query.eq("collegeSectionsId", filters.collegeSectionsId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("fetchFinanceMeetings error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchFinanceMeetingById(
    financeMeetingId: number,
) {
    const { data, error } = await supabase
        .from("finance_meetings")
        .select("*")
        .eq("financeMeetingId", financeMeetingId)
        .is("deletedAt", null)
        .single();

    if (error) {
        throw error;
    }

    return data as FinanceMeetingRow;
}


export async function saveFinanceMeeting(
    payload: {
        id?: number;
        title: string;
        description: string;
        role: string;
        date: string;
        fromTime: string;
        toTime: string;
        collegeBranchId?: number | null;
        collegeAcademicYearId?: number | null;
        collegeSectionsId?: number | null;
        meetingLink: string;
        notificationType: string;
    },
    financeManagerId: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("finance_meetings")
        .upsert(
            {
                financeMeetingId: payload.id,
                title: payload.title.trim(),
                description: payload.description.trim(),
                role: payload.role,
                date: payload.date,
                fromTime: payload.fromTime,
                toTime: payload.toTime,
                collegeBranchId: payload.collegeBranchId ?? null,
                collegeAcademicYearId:
                    payload.collegeAcademicYearId ?? null,
                collegeSectionsId: payload.collegeSectionsId ?? null,
                meetingLink: payload.meetingLink.trim(),
                notificationType: payload.notificationType,
                createdBy: financeManagerId,
                updatedAt: now,
            },
            {
                onConflict: "date, fromTime, toTime, createdBy",
            },
        )
        .select("financeMeetingId")
        .single();

    if (error) {
        console.error("saveFinanceMeeting error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        financeMeetingId: data.financeMeetingId,
    };
}


export async function deactivateFinanceMeeting(
    financeMeetingId: number,
) {
    const { error } = await supabase
        .from("finance_meetings")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("financeMeetingId", financeMeetingId);

    if (error) {
        console.error("deactivateFinanceMeeting error:", error);
        return { success: false };
    }

    return { success: true };
}
