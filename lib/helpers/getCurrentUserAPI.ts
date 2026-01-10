import { supabase } from "@/lib/supabaseClient";

export async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("User not authenticated");
    }

    return user;
}
