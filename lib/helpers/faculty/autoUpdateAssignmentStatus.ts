import { supabase } from "@/lib/supabaseClient";

export const autoUpdateAssignmentStatus = async (assignmentId: number) => {
  try {
    const { data: submissions, error: subErr } = await supabase
      .from("student_submissions")
      .select("status")
      .eq("assignmentId", assignmentId);

    if (subErr) throw subErr;

    if (!submissions || submissions.length === 0) {
      return { success: false, error: "No submissions found" };
    }

    const allEvaluated = submissions.every((s) => s.status === "evaluated");

    const newStatus = allEvaluated ? "evaluated" : "active";

    const { data, error } = await supabase
      .from("faculty_assignments")
      .update({ active: newStatus })
      .eq("assignmentId", assignmentId)
      .select();

    if (error) throw error;

    return {
      success: true,
      message: `Assignment marked as ${newStatus}.`,
      data,
    };
  } catch (err: any) {
    console.error("AUTO STATUS UPDATE ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};
