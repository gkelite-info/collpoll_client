import { supabase } from "@/lib/supabaseClient";

export const fetchAssignmentsForStudent = async (filters: {
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
}) => {
  try {
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        assignmentId,
        topicName,
        dateAssignedInt,
        submissionDeadlineInt,
        marks,
        status,

        subject:subjectId (
          subjectName
        ),

        faculty:createdBy (
          facultyId,
          user:userId (
            fullName
          )
        )
      `)
      .eq("collegeBranchId", filters.collegeBranchId)
      .eq("collegeAcademicYearId", filters.collegeAcademicYearId)
      .eq("collegeSectionsId", filters.collegeSectionsId)
      .eq("is_deleted", false)
      .order("dateAssignedInt", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      assignments: data ?? [],
    };
  } catch (err: any) {
    return {
      success: false,
      assignments: [],
      error: err.message,
    };
  }
};