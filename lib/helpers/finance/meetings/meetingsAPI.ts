import { supabase } from "@/lib/supabaseClient";

export type FinanceMeetingRow = {
    financeMeetingId: number;
    title: string;
    description: string;
    role: string;
    date: string;
    fromTime: string;
    toTime: string;
    meetingLink: string;
    inAppNotification: boolean;
    emailNotification: boolean;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchFinanceMeetings(createdBy: number) {
    const { data, error } = await supabase
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
      meetingLink,
      inAppNotification,
      emailNotification,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
        )
        .eq("createdBy", createdBy)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("date", { ascending: true })
        .order("fromTime", { ascending: true });

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
        meetingLink: string;
        inAppNotification?: boolean;
        emailNotification?: boolean;
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
                meetingLink: payload.meetingLink.trim(),
                inAppNotification: payload.inAppNotification ?? false,
                emailNotification: payload.emailNotification ?? false,
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
