import { supabase } from "@/lib/supabaseClient";

export const fetchAssignments = async (filters: {
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSectionsId: number;
    subjectId?: number;
}) => {
    try {
        const query = supabase
            .from("assignments")
            .select(`
        assignmentId,
        subjectId,
        topicName,
        dateAssignedInt,
        submissionDeadlineInt,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSectionsId,
        status,
        createdAt,
        updatedAt
      `)
            .eq("collegeBranchId", filters.collegeBranchId)
            .eq("collegeAcademicYearId", filters.collegeAcademicYearId)
            .eq("collegeSectionsId", filters.collegeSectionsId)
            .eq("is_deleted", false);

        if (filters.subjectId) {
            query.eq("subjectId", filters.subjectId);
        }

        const { data, error } = await query.order("dateAssignedInt", {
            ascending: false,
        });

        if (error) throw error;

        return {
            success: true,
            assignments: data ?? [],
        };
    } catch (err: any) {
        console.error("FETCH ASSIGNMENTS ERROR:", err.message);

        return {
            success: false,
            error: err.message,
            assignments: [],
        };
    }
};