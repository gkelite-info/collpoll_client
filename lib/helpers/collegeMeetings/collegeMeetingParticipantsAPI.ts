import { supabase } from "@/lib/supabaseClient";

export type CollegeMeetingParticipantRow = {
    collegeMeetingParticipantId: number;
    collegeMeetingId: number;
    userId: number;
    role: "Faculty" | "Admin" | "Student" | "Parent" | "Finance" | "Placement";
    notifiedInApp: boolean;
    notifiedEmail: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchCollegeMeetingParticipants(
    collegeMeetingId: number,
) {
    const { data, error } = await supabase
        .from("college_meeting_participants")
        .select("*")
        .eq("collegeMeetingId", collegeMeetingId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: true });

    if (error) throw error;

    return data as CollegeMeetingParticipantRow[];
}

export async function addCollegeMeetingParticipant(payload: {
    collegeMeetingId: number;
    userId: number;
    role: CollegeMeetingParticipantRow["role"];
}) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_meeting_participants")
        .insert({
            collegeMeetingId: payload.collegeMeetingId,
            userId: payload.userId,
            role: payload.role,
            createdAt: now,
            updatedAt: now,
        })
        .select("collegeMeetingParticipantId")
        .single();

    if (error) {
        console.error("addCollegeMeetingParticipant error:", error);
        return { success: false, error };
    }

    return { success: true, collegeMeetingParticipantId: data.collegeMeetingParticipantId };
}

export async function addCollegeMeetingParticipantsBulk(
    collegeMeetingId: number,
    participants: {
        userId: number;
        role: CollegeMeetingParticipantRow["role"];
    }[],
) {
    if (!participants.length) return { success: true };

    const now = new Date().toISOString();

    const payload = participants.map((p) => ({
        collegeMeetingId,
        userId: p.userId,
        role: p.role,
        createdAt: now,
        updatedAt: now,
    }));

    const { error } = await supabase
        .from("college_meeting_participants")
        .upsert(payload, {
            onConflict: "collegeMeetingId,userId",
        });

    if (error) {
        console.error("addCollegeMeetingParticipantsBulk error:", error);
        return { success: false, error };
    }

    return { success: true };
}

export async function updateCollegeMeetingParticipant(
    collegeMeetingParticipantId: number,
    payload: {
        role?: CollegeMeetingParticipantRow["role"];
        notifiedInApp?: boolean;
        notifiedEmail?: boolean;
    },
) {
    const { error } = await supabase
        .from("college_meeting_participants")
        .update({
            ...payload,
            updatedAt: new Date().toISOString(),
        })
        .eq("collegeMeetingParticipantId", collegeMeetingParticipantId);

    if (error) {
        console.error("updateCollegeMeetingParticipant error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function removeCollegeMeetingParticipant(
    collegeMeetingParticipantId: number,
) {
    const { error } = await supabase
        .from("college_meeting_participants")
        .update({
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeMeetingParticipantId", collegeMeetingParticipantId);

    if (error) {
        console.error("removeCollegeMeetingParticipant error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function removeAllCollegeMeetingParticipants(
    collegeMeetingId: number,
) {
    const { error } = await supabase
        .from("college_meeting_participants")
        .update({
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeMeetingId", collegeMeetingId)
        .is("deletedAt", null);

    if (error) {
        console.error("removeAllCollegeMeetingParticipants error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function isUserAlreadyParticipant(
    collegeMeetingId: number,
    userId: number,
) {
    const { data, error } = await supabase
        .from("college_meeting_participants")
        .select("collegeMeetingParticipantId")
        .eq("collegeMeetingId", collegeMeetingId)
        .eq("userId", userId)
        .is("deletedAt", null)
        .single();

    if (error) return false;

    return !!data;
}