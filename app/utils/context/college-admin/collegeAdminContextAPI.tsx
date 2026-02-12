import { supabase } from "@/lib/supabaseClient";

type CollegeAdminJoin = {
    collegeAdminId: number;
    userId: number;
    collegeId: number;
    isActive: boolean;

    college: {
        collegeName: string;
    };
};

export async function fetchCollegeAdminContext(userId: number) {
    const { data, error } = await supabase
        .from("college_admin")
        .select(`
      collegeAdminId,
      userId,
      collegeId,
      isActive,
      college:collegeId!inner (
        collegeName
      )
    `)
        .eq("userId", userId)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .single<CollegeAdminJoin>();

    if (error) throw error;

    return {
        collegeAdminId: data.collegeAdminId,
        userId: data.userId,
        collegeId: data.collegeId,
        collegeName: data.college.collegeName,
        isActive: data.isActive,
    };
}
