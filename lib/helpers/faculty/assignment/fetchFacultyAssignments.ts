import { supabase } from "@/lib/supabaseClient";

export const fetchFacultyAssignments = async (
  facultyId: number,
  tab: "Active" | "Evaluated",
  page: number = 1,
  limit: number = 10,
  dateStr?: string,
    filters?: {
    branchIds?: number[];
    yearId?: number;
    sectionId?: number;
    subjectId?: number;
    isSchool?: boolean;
  }
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const selectQuery =
      tab === "Evaluated"
        ? `*, college_subjects (subjectName, subjectCode), student_assignments_submission!inner(status), submissions_count:student_assignments_submission(count)`
        : `*, college_subjects (subjectName, subjectCode), submissions_count:student_assignments_submission(count)`;

    let query = supabase
      .from("assignments")
      .select(selectQuery, { count: "exact" })
      .eq("createdBy", facultyId)
      .eq("is_deleted", false)
      .eq("status", "Active");

    if (dateStr) {
      const d = new Date(dateStr);
      const selectedDateInt = parseInt(
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
          d.getDate()
        ).padStart(2, "0")}`
      );
      query = query
        .lte("dateAssignedInt", selectedDateInt)
        .gte("submissionDeadlineInt", selectedDateInt);
    }

    if (tab === "Evaluated") {
      query = query.eq("student_assignments_submission.status", "Evaluated");
    }

    if (filters?.isSchool) {
      query = query.is("collegeBranchId", null);
    } else if (filters?.branchIds && filters.branchIds.length > 0) {
      query = query.in("collegeBranchId", filters.branchIds);
    }

    if (filters?.yearId) {
      query = query.eq("collegeAcademicYearId", filters.yearId);
    }

    if (filters?.subjectId) {
      query = query.eq("collegeSubjectId", filters.subjectId);
    }

    if (filters?.sectionId) {
      query = query.eq("collegeSectionsId", filters.sectionId);
    }

    const { data, error, count } = await query
      .order("assignmentId", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const enrichedData = await Promise.all(
      (data || []).map(async (assignment: any) => {
        let studentCountQuery = supabase
          .from("students")
          .select(
            "studentId, student_academic_history!inner(collegeAcademicYearId, collegeSectionsId)",
            { count: "exact", head: true },
          )
          .eq(
            "student_academic_history.collegeAcademicYearId",
            assignment.collegeAcademicYearId,
          )
          .eq(
            "student_academic_history.collegeSectionsId",
            assignment.collegeSectionsId,
          )
          .eq("student_academic_history.isCurrent", true)
          .is("student_academic_history.deletedAt", null)
          .eq("isActive", true)
          .is("deletedAt", null);

        if (
          assignment.collegeBranchId !== null &&
          assignment.collegeBranchId !== undefined &&
          Number(assignment.collegeBranchId) > 0
        ) {
          studentCountQuery = studentCountQuery.eq(
            "collegeBranchId",
            assignment.collegeBranchId,
          );
        }

        const { count: expectedStudentsCount, error: stuError } =
          await studentCountQuery;

        if (stuError) {
          console.error("Error fetching student count:", {
            message: stuError.message,
            code: stuError.code,
            details: stuError.details,
            hint: stuError.hint,
            assignmentId: assignment.assignmentId,
          });
        }

        const actualSubmissionsCount =
          assignment.submissions_count?.[0]?.count || 0;

        return {
          ...assignment,
          actualSubmissionsCount,
          expectedStudentsCount: expectedStudentsCount || 0,
        };
      }),
    );

    return { data: enrichedData, count, error: null };
  } catch (err: any) {
    console.error("Fetch Error:", err.message);
    return { data: null, count: 0, error: err.message };
  }
};
