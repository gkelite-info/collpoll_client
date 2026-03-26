import { supabase } from "@/lib/supabaseClient";

export async function fetchActiveStudentCount(
    collegeEducationId: number,
    collegeBranchId: number,
    collegeAcademicYearId: number
) {
    try {
        const { count, error } = await supabase
            .from("students")
            .select(`
        studentId,
        student_academic_history!inner(collegeAcademicYearId, isCurrent)
      `, { count: "exact", head: true })
            .eq("collegeEducationId", collegeEducationId)
            .eq("collegeBranchId", collegeBranchId)
            .eq("isActive", true)
            .eq("status", "Active")
            .is("deletedAt", null)
            .eq("student_academic_history.collegeAcademicYearId", collegeAcademicYearId)
            .eq("student_academic_history.isCurrent", true)
            .is("student_academic_history.deletedAt", null);

        if (error) {
            console.error("fetchActiveStudentCount error:", error);
            return 0;
        }

        return count ?? 0;
    } catch (err) {
        console.error("Unexpected error fetching student count:", err);
        return 0;
    }
}

export async function fetchAllStudentCountsForCollege(collegeEducationId: number) {
    const { data, error } = await supabase
        .from("students")
        .select(`
      collegeBranchId,
      student_academic_history!inner(collegeAcademicYearId)
    `)
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true)
        .eq("status", "Active")
        .eq("student_academic_history.isCurrent", true)
        .is("deletedAt", null);

    if (error) {
        console.error("fetchAllStudentCounts error:", error);
        return [];
    }

    return data;
}

export async function fetchPendingSubmissionsCount(facultyId: number, collegeSubjectId: number) {
    try {
        const today = new Date().toISOString().split("T")[0];

        const { data: discussions, error: discError } = await supabase
            .from("discussion_forum")
            .select(`
        discussionId,
        discussion_forum_sections!inner (
          discussionSectionId,
          collegeSectionsId,
          college_sections!inner (
            faculty_sections!inner (
              collegeSubjectId
            )
          )
        )
      `)
            .eq("createdBy", facultyId)
            .eq("discussion_forum_sections.college_sections.faculty_sections.collegeSubjectId", collegeSubjectId)
            .eq("isActive", true)
            .eq("is_deleted", false)
            .gte("deadline", today);

        if (discError || !discussions || discussions.length === 0) return 0;

        let totalPending = 0;

        for (const disc of discussions) {
            const sections = disc.discussion_forum_sections;
            const sectionIds = sections.map((s: any) => s.collegeSectionsId);
            const discSectionIds = sections.map((s: any) => s.discussionSectionId);

            const { count: expectedCount } = await supabase
                .from("student_academic_history")
                .select("*", { count: "exact", head: true })
                .in("collegeSectionsId", sectionIds)
                .eq("isCurrent", true)
                .is("deletedAt", null);

            const { count: uploadedCount } = await supabase
                .from("student_discussion_uploads")
                .select("studentId", { count: "exact", head: true })
                .eq("discussionId", disc.discussionId)
                .in("discussionSectionId", discSectionIds)
                .eq("is_deleted", false);

            const pendingForThisDisc = (expectedCount || 0) - (uploadedCount || 0);
            totalPending += Math.max(0, pendingForThisDisc);
        }

        return totalPending;
    } catch (err) {
        console.error("Error calculating pending submissions:", err);
        return 0;
    }
}