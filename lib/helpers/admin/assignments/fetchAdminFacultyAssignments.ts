// lib/helpers/admin/assignments/fetchAdminFacultyAssignments.ts
import { supabase } from "@/lib/supabaseClient";

export const fetchAdminFacultyAssignments = async (
  subjectId: number,
  facultyId: number,
) => {
  try {
    const { data, error } = await supabase
      .from("assignments")
      .select(
        `
        assignmentId,
        collegeSectionsId,
        topicName,
        dateAssignedInt,
        submissionDeadlineInt,
        marks,
        status
      `,
      )
      .eq("subjectId", subjectId)
      .eq("createdBy", facultyId) // Directly matches the ID from params
      .eq("is_deleted", false)
      .order("assignmentId", { ascending: false });

    if (error) throw error;

    const { data: subjectData } = await supabase
      .from("college_subjects")
      .select("subjectName")
      .eq("collegeSubjectId", subjectId)
      .maybeSingle();

    return {
      data: (data || []).map((a) => ({
        ...a,
        subjectName: subjectData?.subjectName || "Subject",
      })),
      error: null,
    };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};
