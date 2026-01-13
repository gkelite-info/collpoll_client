import { supabase } from "@/lib/supabaseClient";

export interface EducationInsertPayload {
    educationName: string;
    educationCode: string;
    educationLevel: string;
    durationYears?: number | null;
}

export interface EducationRow {
    educationId: number;
    educationName: string;
    educationCode: string;
    educationLevel: string;
    durationYears: number | null;
    createdBy: string;
    is_deleted: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}


export async function insertEducation(
    payload: EducationInsertPayload,
    userId: number | null
): Promise<EducationRow> {

    const now = new Date().toISOString()

    const insertPayload = {
        educationName: payload.educationName,
        educationCode: payload.educationCode,
        educationLevel: payload.educationLevel,
        durationYears: payload.durationYears ?? null,

        createdBy: userId,
        is_deleted: false,
        createdAt: now,
        updatedAt: now
    };

    const { data, error } = await supabase
        .from("educations")
        .insert([insertPayload])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}


export async function getEducations(): Promise<EducationRow[]> {
    const { data, error } = await supabase
        .from("educations")
        .select("*")
        .eq("is_deleted", false)
        .order("createdAt", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}


export async function getEducationById(
    educationId: number
): Promise<EducationRow | null> {
    const { data, error } = await supabase
        .from("educations")
        .select("*")
        .eq("educationId", educationId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
