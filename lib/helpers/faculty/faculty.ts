import { supabase } from "@/lib/supabaseClient";

export const getFacultyIdByUserId = async (userId: number) => {
    const { data, error } = await supabase
        .from("faculty")
        .select("facultyId")
        .eq("userId", userId)
<<<<<<< Updated upstream
        // .eq("is_deleted", false)
=======
        .eq("isActive", true)
>>>>>>> Stashed changes
        .maybeSingle();

    if (error) throw error;

    return data?.facultyId ?? null;
};
