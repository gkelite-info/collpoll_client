import { supabase } from "@/lib/supabaseClient";

export const deleteFacultyAssignment = async (assignmentId: number) => {
  try {
    const { error } = await supabase
      .from("faculty_assignments")
      .delete()
      .eq("assignmentId", assignmentId);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("DELETE ERROR:", err.message);
    return { success: false, error: err.message };
  }
};
