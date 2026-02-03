import { supabase } from "@/lib/supabaseClient";

export const upsertFacultyAssignment = async (payload: any) => {
  try {
    const {
      assignmentId,
      facultyId, // Maps to 'createdBy'
      subjectId,
      topicName,
      dateAssigned, // String 'YYYY-MM-DD'
      submissionDeadline, // String 'YYYY-MM-DD'
      collegeBranchId,
      collegeAcademicYearId,
      collegeSectionsId,
      marks,
    } = payload;

    const now = new Date().toISOString();

    // Prepare the DB object strictly according to schema
    const dbPayload = {
      createdBy: facultyId,
      subjectId: Number(subjectId),
      topicName: topicName,
      dateAssignedInt: convertToInt(dateAssigned),
      submissionDeadlineInt: convertToInt(submissionDeadline),
      collegeBranchId: Number(collegeBranchId),
      collegeAcademicYearId: Number(collegeAcademicYearId),
      collegeSectionsId: Number(collegeSectionsId),
      marks: Number(marks),
      status: "Active",
      updatedAt: now,
    };

    // -----------------------------------------------
    // ✔ CASE 1: UPDATE EXISTING ASSIGNMENT
    // -----------------------------------------------
    if (assignmentId) {
      const { data, error } = await supabase
        .from("assignments") // Correct Table Name
        .update(dbPayload)
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
      .from("assignments") // Correct Table Name
      .insert({
        ...dbPayload,
        is_deleted: false,
        createdAt: now,
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
  if (!dateStr) return 0;
  // Converts "2026-01-27" -> 20260127
  return Number(dateStr.replace(/-/g, ""));
}
