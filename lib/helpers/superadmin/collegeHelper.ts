import { supabase } from "@/lib/supabaseClient";

export type CollegeDropdown = {
    collegeId: number;
    collegeName: string;
};

type FetchCollegesSuccess = {
    success: true;
    data: CollegeDropdown[];
};

type FetchCollegesError = {
    success: false;
    error: string;
};

export type FetchCollegesResponse =
    | FetchCollegesSuccess
    | FetchCollegesError;

export const fetchCollegesForAdmin = async (): Promise<FetchCollegesResponse> => {
    try {
        const { data, error } = await supabase
            .from("colleges")
            .select("collegeId, collegeName")
            .eq("is_active", true)
            .order("collegeName", { ascending: true });

        if (error) throw error;

        return { success: true, data: data ?? [] };

    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch colleges" };
    }
};