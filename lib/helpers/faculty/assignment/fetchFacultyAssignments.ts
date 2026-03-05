import { supabase } from "@/lib/supabaseClient";

export const fetchFacultyAssignments = async (
  facultyId: number,
  tab: "Active" | "Evaluated",
  page: number = 1,
  limit: number = 10,
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const selectQuery =
      tab === "Evaluated"
        ? `*, college_subjects (subjectName, subjectCode), student_assignments_submission!inner(status)`
        : `*, college_subjects (subjectName, subjectCode)`;

    let query = supabase
      .from("assignments")
      .select(selectQuery, { count: "exact" })
      .eq("createdBy", facultyId)
      .eq("is_deleted", false)
      .eq("status", "Active");

    if (tab === "Evaluated") {
      query = query.eq("student_assignments_submission.status", "Evaluated");
    }

    const { data, error, count } = await query
      .order("assignmentId", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { data, count, error: null };
  } catch (err: any) {
    console.error("Fetch Error:", err.message);
    return { data: null, count: 0, error: err.message };
  }
};
