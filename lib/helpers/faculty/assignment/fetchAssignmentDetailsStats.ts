import { supabase } from "@/lib/supabaseClient";

export const fetchAssignmentDetailsStats = async (
  assignmentId: string | number,
) => {
  try {
    const { data: assignmentData, error: assignmentError } = await supabase
      .from("assignments")
      .select("*")
      .eq("assignmentId", assignmentId)
      .single();

    if (assignmentError) throw assignmentError;

    const { count: submittedCount, error: subError } = await supabase
      .from("student_assignments_submission")
      .select("*", { count: "exact", head: true })
      .eq("assignmentId", assignmentId);

    if (subError) throw subError;

    let expectedQuery = supabase
      .from("students")
      .select(
        "studentId, student_academic_history!inner(collegeAcademicYearId, collegeSectionsId)",
        { count: "exact", head: true }
      )
      .eq("isActive", true)
      .is("deletedAt", null);

    if (assignmentData.collegeAcademicYearId) {
      expectedQuery = expectedQuery.eq(
        "student_academic_history.collegeAcademicYearId",
        assignmentData.collegeAcademicYearId
      );
    }

    if (assignmentData.collegeSectionsId) {
      expectedQuery = expectedQuery.eq(
        "student_academic_history.collegeSectionsId",
        assignmentData.collegeSectionsId
      );
    }

    if (
      assignmentData.collegeBranchId !== null &&
      assignmentData.collegeBranchId !== undefined &&
      Number(assignmentData.collegeBranchId) > 0
    ) {
      expectedQuery = expectedQuery.eq(
        "collegeBranchId",
        assignmentData.collegeBranchId
      );
    }

    expectedQuery = expectedQuery
      .eq("student_academic_history.isCurrent", true)
      .is("student_academic_history.deletedAt", null);

    const { count: expectedCount, error: expError } = await expectedQuery;

    if (expError) throw expError;

    return {
      data: {
        ...assignmentData,
        totalSubmitted: submittedCount || 0,
        totalSubmissionsExpected: expectedCount || 0,
      },
      error: null,
    };
  } catch (err: any) {
    console.error("Error fetching detail stats:", err.message);
    return { data: null, error: err.message };
  }
};
