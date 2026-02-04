import { supabase } from "@/lib/supabaseClient";

export const updateAdminAssignment = async (
  assignmentId: number,
  deadline: string,
  status: string,
) => {
  try {
    // Convert YYYY-MM-DD to YYYYMMDD integer
    const deadlineInt = parseInt(deadline.replace(/-/g, ""));

    const { error } = await supabase
      .from("assignments")
      .update({
        submissionDeadlineInt: deadlineInt,
        status: status,
        updatedAt: new Date().toISOString(),
      })
      .eq("assignmentId", assignmentId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
