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

export const fetchCollegesForAdmin = async (
    page: number = 1,
    limit: number = 10,
    searchQuery: string = ""
): Promise<FetchCollegesResponse & { hasMore?: boolean }> => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("colleges")
            .select("collegeId, collegeName", { count: "exact" })
            .eq("is_active", true)
            .order("collegeName", { ascending: true });

        if (searchQuery.trim() !== "") {
            query = query.ilike("collegeName", `%${searchQuery}%`);
        }

        const { data, error, count } = await query.range(from, to);

        if (error) throw error;

        const hasMore = count ? from + limit < count : false;

        return { success: true, data: data ?? [], hasMore };

    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch colleges" };
    }
};