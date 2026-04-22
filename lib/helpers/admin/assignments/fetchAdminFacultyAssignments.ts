// import { supabase } from "@/lib/supabaseClient";

// export const fetchAdminFacultyAssignments = async (
//   subjectId: number,
//   facultyId: number,
//   page: number,
//   pageSize: number,
// ) => {
//   try {
//     const from = (page - 1) * pageSize;
//     const to = from + pageSize - 1;
//     const { data, error, count } = await supabase
//       .from("assignments")
//       .select(
//         `
//         assignmentId,
//         collegeBranchId,
//         collegeAcademicYearId,
//         collegeSectionsId,
//         topicName,
//         dateAssignedInt,
//         submissionDeadlineInt,
//         marks,
//         status,
//         submissions_count:student_assignments_submission(count)
//       `,
//         { count: "exact" },
//       )
//       .eq("subjectId", subjectId)
//       .eq("createdBy", facultyId)
//       .eq("is_deleted", false)
//       .order("assignmentId", { ascending: false })
//       .range(from, to);

//     if (error) throw error;

//     const { data: subjectData } = await supabase
//       .from("college_subjects")
//       .select("subjectName")
//       .eq("collegeSubjectId", subjectId)
//       .maybeSingle();

//     // Enrich with expected student counts dynamically
//     const enrichedData = await Promise.all(
//       (data || []).map(async (assignment: any) => {
//         const { count: expectedStudentsCount, error: stuError } = await supabase
//           .from("students")
//           .select(
//             "studentId, student_academic_history!inner(collegeAcademicYearId, collegeSectionsId)",
//             { count: "exact", head: true },
//           )
//           .eq("collegeBranchId", assignment.collegeBranchId)
//           .eq(
//             "student_academic_history.collegeAcademicYearId",
//             assignment.collegeAcademicYearId,
//           )
//           .eq(
//             "student_academic_history.collegeSectionsId",
//             assignment.collegeSectionsId,
//           )
//           .eq("student_academic_history.isCurrent", true)
//           .eq("isActive", true);

//         if (stuError)
//           console.error("Error fetching student count:", stuError.message);

//         const actualSubmissionsCount =
//           assignment.submissions_count?.[0]?.count || 0;

//         return {
//           ...assignment,
//           subjectName: subjectData?.subjectName || "Subject",
//           actualSubmissionsCount,
//           expectedStudentsCount: expectedStudentsCount || 0,
//         };
//       }),
//     );

//     return {
//       data: enrichedData,
//       count: count || 0,
//       error: null,
//     };
//   } catch (error: any) {
//     return { data: [], count: 0, error: error.message };
//   }
// };

import { supabase } from "@/lib/supabaseClient";

export const fetchAdminFacultyAssignments = async (
  subjectId: number,
  facultyId: number,
  page: number,
  pageSize: number,
) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from("assignments")
      .select(
        `
        assignmentId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSectionsId,
        topicName,
        dateAssignedInt,
        submissionDeadlineInt,
        marks,
        status,
        submissions_count:student_assignments_submission(count)
      `,
        { count: "exact" },
      )
      .eq("subjectId", subjectId)
      .eq("createdBy", facultyId)
      .eq("is_deleted", false)
      .order("assignmentId", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const { data: subjectData } = await supabase
      .from("college_subjects")
      .select("subjectName")
      .eq("collegeSubjectId", subjectId)
      .maybeSingle();

    // Enrich with expected student counts dynamically
    const enrichedData = await Promise.all(
      (data || []).map(async (assignment: any) => {
        const { count: expectedStudentsCount, error: stuError } = await supabase
          .from("students")
          .select(
            "studentId, student_academic_history!inner(collegeAcademicYearId, collegeSectionsId)",
            { count: "exact", head: true },
          )
          .eq("collegeBranchId", assignment.collegeBranchId)
          .eq(
            "student_academic_history.collegeAcademicYearId",
            assignment.collegeAcademicYearId,
          )
          .eq(
            "student_academic_history.collegeSectionsId",
            assignment.collegeSectionsId,
          )
          .eq("student_academic_history.isCurrent", true)
          .eq("isActive", true);

        if (stuError)
          console.error("Error fetching student count:", stuError.message);

        const actualSubmissionsCount =
          assignment.submissions_count?.[0]?.count || 0;

        return {
          ...assignment,
          subjectName: subjectData?.subjectName || "Subject",
          actualSubmissionsCount,
          expectedStudentsCount: expectedStudentsCount || 0,
        };
      }),
    );

    return {
      data: enrichedData,
      count: count || 0,
      error: null,
    };
  } catch (error: any) {
    return { data: [], count: 0, error: error.message };
  }
};
