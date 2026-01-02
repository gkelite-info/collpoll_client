import { supabase } from "@/lib/supabaseClient";

export const upsertFacultyAssignment = async (payload: any) => {
  try {
    const {
      assignmentId,
      facultyId,
      assignmentTitle,
      topicName,
      dateAssigned,
      submissionDeadline,
      totalSubmissionsExpected,
      totalMarks,
      instructions,
    } = payload;

    const now = new Date().toISOString();

    // -----------------------------------------------
    // ✔ CASE 1: UPDATE EXISTING ASSIGNMENT
    // -----------------------------------------------
    if (assignmentId) {
      const { data, error } = await supabase
        .from("faculty_assignments")
        .update({
          assignmentTitle,
          topicName,
          dateAssignedInt: convertToInt(dateAssigned),
          submissionDeadlineInt: convertToInt(submissionDeadline),
          totalSubmissionsExpected,
          totalMarks,
          instructions,
          updatedAt: now,
        })
        .eq("assignmentId", assignmentId)
        .select();

      if (error) throw error;

      return {
        success: true,
        message: "Assignment updated successfully",
        data,
      };
    }

    // -----------------------------------------------
    // ✔ CASE 2: CREATE NEW ASSIGNMENT
    // -----------------------------------------------
    const { data, error } = await supabase
      .from("faculty_assignments")
      .insert({
        facultyId,
        assignmentTitle,
        topicName,
        dateAssignedInt: convertToInt(dateAssigned),
        submissionDeadlineInt: convertToInt(submissionDeadline),
        totalSubmissionsExpected,
        totalMarks,
        instructions,
        createdAt: now,
        updatedAt: now,
      })
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Assignment created successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT ASSIGNMENT ERROR:", err);
    return { success: false, error: err.message };
  }
};

function convertToInt(dateStr: string) {
  if (!dateStr) return null;
  return Number(dateStr.replace(/-/g, ""));
}
