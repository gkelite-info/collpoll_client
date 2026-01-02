import { supabase } from "@/lib/supabaseClient";

export const updateAssignmentStatus = async (
  assignmentId: number,
  status: "active" | "evaluated"
) => {
  try {
    const { data, error } = await supabase
      .from("faculty_assignments")
      .update({ active: status })
      .eq("assignmentId", assignmentId)
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Status updated successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPDATE STATUS ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};
