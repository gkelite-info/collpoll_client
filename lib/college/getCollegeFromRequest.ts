import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

export async function getCollegeFromRequest() {
    const cookieStore = await cookies();
    const collegeCode = cookieStore.get("college_code")?.value;

    if (!collegeCode) return null;

    const { data, error } = await supabase
        .from("colleges")
        .select("collegeId, collegeName, collegeCode")
        .ilike("collegeCode", collegeCode)
        .eq("is_active", true)
        .single();

    if (error) return null;
    return data;
}