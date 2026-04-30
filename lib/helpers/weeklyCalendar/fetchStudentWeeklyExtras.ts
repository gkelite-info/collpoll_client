import { supabase } from "@/lib/supabaseClient";

interface StudentParams {
    date: string;
    collegeSectionsId: number;
    collegeAcademicYearId: number;
}

export async function fetchQuizCountByDate({ date, collegeSectionsId, collegeAcademicYearId }: StudentParams) {
    const { count, error } = await supabase
        .from("quizzes")
        .select("*", { count: "exact", head: true })
        .eq("collegeSectionsId", collegeSectionsId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("isActive", true)
        .eq("status", "Published")
        .gte("startDate", `${date}T00:00:00`)
        .lte("startDate", `${date}T23:59:59`)
        .is("deletedAt", null);

    if (error) console.error("Quiz Fetch Error:", error);
    return count || 0;
}


export async function fetchAssignmentCountByDate({ date, collegeSectionsId, collegeAcademicYearId }: StudentParams) {
    const dateInt = parseInt(date.replace(/-/g, ""));

    const { count, error } = await supabase
        .from("assignments")
        .select("*", { count: "exact", head: true })
        .eq("collegeSectionsId", collegeSectionsId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("dateAssignedInt", dateInt)
        .eq("is_deleted", false)
        .is("deletedAt", null);

    if (error) console.error("Assignment Fetch Error:", error);
    return count || 0;
}


export async function fetchDiscussionCountByDate({ date, collegeSectionsId }: { date: string, collegeSectionsId: number }) {
    const { count, error } = await supabase
        .from("discussion_forum_sections")
        .select(`
      discussionSectionId,
      discussion_forum!inner(deadline)
    `, { count: "exact", head: true })
        .eq("collegeSectionsId", collegeSectionsId)
        .eq("discussion_forum.deadline", date)
        .eq("is_deleted", false)
        .is("deletedAt", null);

    if (error) console.error("Discussion Fetch Error:", error);
    return count || 0;
}