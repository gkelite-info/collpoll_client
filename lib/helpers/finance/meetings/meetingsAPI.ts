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

// export async function fetchFinanceMeetings(createdBy: number) {
//     const { data, error } = await supabase
//         .from("finance_meetings")
//         .select(
//             `
//       financeMeetingId,
//       title,
//       description,
//       role,
//       date,
//       fromTime,
//       toTime,
//       meetingLink,
//       inAppNotification,
//       emailNotification,
//       createdBy,
//       isActive,
//       createdAt,
//       updatedAt,
//       deletedAt
//     `,
//         )
//         .eq("createdBy", createdBy)
//         .eq("isActive", true)
//         .is("deletedAt", null)
//         .order("date", { ascending: true })
//         .order("fromTime", { ascending: true });

//     if (error) {
//         console.error("fetchFinanceMeetings error:", error);
//         throw error;
//     }

//     return data ?? [];
// }

// 🔴 MARKED CHANGE — FULL PRODUCTION FETCH

export async function fetchFinanceMeetings(params: {
    createdBy: number;
    role?: string;
    type?: "upcoming" | "previous";
    page?: number;
    limit?: number;
}) {
    const {
        createdBy,
        role,
        type = "upcoming",
        page = 1,
        limit = 6,
    } = params;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0];

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
      meetingLink,
      inAppNotification,
      emailNotification,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
            { count: "exact" }
        )
        .eq("createdBy", createdBy)
        .eq("isActive", true)
        .is("deletedAt", null);

    // 🔴 MARKED CHANGE — Role filter (case insensitive safe)
    if (role) {
        query = query.eq("role", role);
    }

    // 🔴 MARKED CHANGE — Correct upcoming / previous logic
    if (type === "upcoming") {
        query = query.or(
            `date.gt.${today},and(date.eq.${today},fromTime.gte.${currentTime})`
        );
    } else {
        query = query.or(
            `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`
        );
    }

    const { data, error, count } = await query
        .order("date", { ascending: true })
        .order("fromTime", { ascending: true })
        .range(from, to);

    if (error) {
        console.error("fetchFinanceMeetings error:", error);
        throw error;
    }

    return {
        data: data ?? [],
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
    };
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
                createdAt: payload.id ? undefined : now,
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
