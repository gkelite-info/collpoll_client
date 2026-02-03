import { supabase } from "@/lib/supabaseClient";

export const fetchFacultyAssignments = async (facultyId: number) => {
  try {
    const { data, error } = await supabase
      .from("assignments")
      .select(
        `
        *,
        college_subjects (
          subjectName,
          subjectCode 
        )
      `,
      )
      .eq("createdBy", facultyId)
      .eq("status", "Active")
      .eq("is_deleted", false)
      .order("assignmentId", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error("Fetch Error:", err.message);
    return { data: null, error: err.message };
  }
};
