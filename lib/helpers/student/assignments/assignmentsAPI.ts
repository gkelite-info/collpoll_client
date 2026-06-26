import { supabase } from "@/lib/supabaseClient";

type AssignmentFilters = {
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
};

export const fetchAssignmentsForStudent = async (
  filters: AssignmentFilters,
  page: number,
  limit: number,
  type: "active" | "previous",
  dateStr?: string,
) => {
  try {
    const { collegeBranchId, collegeAcademicYearId, collegeSectionsId } = filters;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const today = new Date();
    const todayInt = Number(
      `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`
    );

    // Fetch current section name
    const { data: sectionRow, error: secError } = await supabase
      .from("college_sections")
      .select("collegeSections")
      .eq("collegeSectionsId", collegeSectionsId)
      .single();

    let sectionIds = [collegeSectionsId];
    if (!secError && sectionRow?.collegeSections) {
      // Fetch all matching section IDs (including soft-deleted ones)
      const { data: sectionsList, error: listError } = await supabase
        .from("college_sections")
        .select("collegeSectionsId")
        .eq("collegeBranchId", collegeBranchId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("collegeSections", sectionRow.collegeSections);

      if (!listError && sectionsList) {
        sectionIds = sectionsList.map((s: any) => s.collegeSectionsId);
      }
    }

    let query = supabase
      .from("assignments")
      .select(
        `
        assignmentId,
        topicName,
        dateAssignedInt,
        submissionDeadlineInt,
        marks,
        status,

        subject:subjectId (
          subjectName
        ),

        faculty:createdBy (
          facultyId,
          user:userId (
            fullName
          )
        )
      `,
        { count: "exact" }
      )
      .eq("collegeBranchId", collegeBranchId)
      .eq("collegeAcademicYearId", collegeAcademicYearId)
      .in("collegeSectionsId", sectionIds)
      .eq("is_deleted", false);

    let targetDateInt = todayInt;

    if (dateStr) {
      const d = new Date(dateStr);
      targetDateInt = parseInt(
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
          d.getDate()
        ).padStart(2, "0")}`
      );
      query = query.lte("dateAssignedInt", targetDateInt);
    }

    if (type === "active") {
      query = query.gte("submissionDeadlineInt", targetDateInt);
    } else if (type === "previous") {
      query = query.lt("submissionDeadlineInt", targetDateInt);
    }

    const { data, error, count } = await query
      .order("dateAssignedInt", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      assignments: data ?? [],
      totalCount: count ?? 0,
    };

  } catch (err: any) {
    return {
      success: false,
      assignments: [],
      totalCount: 0,
      error: err.message,
    };
  }
};