import { supabase } from "@/lib/supabaseClient";

export async function getUserProfileSummary(userId: number) {
    const { data, error } = await supabase
        .from("profile_summary")
        .select("summaryId, summary")
        .eq("userId", userId)
        .eq("is_deleted", false)
        .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    return data;
}

export async function createProfileSummary(
    userId: number,
    summary: string
): Promise<{ summaryId: number }> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from("profile_summary")
        .insert({
            userId: userId,
            summary,
            createdAt: now,
            updatedAt: now,
            is_deleted: false,
        })
        .select("summaryId")
        .single();

    if (error) throw error;

    return data;
}

export async function updateProfileSummary(
    userId: number,
    summary: string
) {
    const { error } = await supabase
        .from("profile_summary")
        .update({
            summary,
            updatedAt: new Date().toISOString(),
        })
        .eq("userId", userId)
        .eq("is_deleted", false);

    if (error) throw error;
}

export async function deleteProfileSummary(userId: number) {
    const { error } = await supabase
        .from("profile_summary")
        .update({
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("userId", userId);

    if (error) throw error;
}