import { supabase } from "@/lib/supabaseClient";

export const fetchAdminFacultyAssignments = async (
  subjectId: number,
  facultyId: number,
  page: number,
  pageSize: number,
) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
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
        { count: "exact" },
      )
      .eq("subjectId", subjectId)
      .eq("createdBy", facultyId)
      .eq("is_deleted", false)
      .order("assignmentId", { ascending: false })
      .range(from, to);

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
      count : count || 0,
      error: null,
    };
  } catch (error: any) {
    return { data: [], count: 0, error: error.message };
  }
};
