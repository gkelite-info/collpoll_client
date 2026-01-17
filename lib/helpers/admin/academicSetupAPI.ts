import { supabase } from "@/lib/supabaseClient";

export async function fetchCollegeDegrees() {
    const { data, error } = await supabase
        .from("college_degree")
        .select(`
      collegeDegreeId,
      degreeType,
      departments,
      createdBy,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt,
      years,
      sections
    `)
        .eq("is_deleted", false)
        .order("collegeDegreeId", { ascending: true });

    if (error) {
        console.error("fetchCollegeDegrees error:", error);
        throw error;
    }

    return data ?? [];
}
