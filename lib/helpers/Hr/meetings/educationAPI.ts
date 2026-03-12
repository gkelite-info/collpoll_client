import { supabase } from "@/lib/supabaseClient";

export async function fetchEducationTypes(collegeId: number) {
    const { data, error } = await supabase
        .from("college_education")
        .select(`
            collegeEducationId,
            collegeEducationType
        `)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeEducationType", { ascending: true });

    if (error) {
        console.error("fetchEducationTypes error:", error);
        return [];
    }

    return data ?? [];
}