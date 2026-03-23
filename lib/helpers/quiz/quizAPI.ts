import { supabase } from "@/lib/supabaseClient";

export type QuizRow = {
    quizId: number;
    facultyId: number;
    collegeSubjectId: number;
    collegeSectionsId: number;
    collegeSubjectUnitId: number;
    quizTitle: string;
    totalMarks: number;
    startDate: string;
    endDate: string;
    status: "Draft" | "Active" | "Completed";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchQuizzesByFacultyId(facultyId: number) {
    const { data, error } = await supabase
        .from("quizzes")
        .select(`
      quizId,
      facultyId,
      collegeSubjectId,
      collegeSectionsId,
      collegeSubjectUnitId,
      quizTitle,
      totalMarks,
      startDate,
      endDate,
      status,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("facultyId", facultyId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchQuizzesByFacultyId error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchQuizzesByStatus(
    facultyId: number,
    status: "Draft" | "Active" | "Completed"
) {
    const { data, error } = await supabase
        .from("quizzes")
        .select(`
            quizId,
            quizTitle,
            totalMarks,
            startDate,
            endDate,
            status,
            college_subjects (
                subjectName
            ),
            college_sections (
                collegeSections
            ),
            quiz_questions (
                questionId
            )
        `)
        .eq("facultyId", facultyId)
        .eq("status", status)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchQuizzesByStatus error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchQuizById(quizId: number) {
    const { data, error } = await supabase
        .from("quizzes")
        .select(`
      quizId,
      facultyId,
      collegeSubjectId,
      collegeSectionsId,
      collegeSubjectUnitId,
      quizTitle,
      totalMarks,
      startDate,
      endDate,
      status,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("quizId", quizId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .single();

    if (error) {
        console.error("fetchQuizById error:", error);
        throw error;
    }

    return data;
}

export async function saveQuiz(
    payload: {
        quizId?: number;
        facultyId: number;
        collegeSubjectId: number;
        collegeSectionsId: number;
        collegeSubjectUnitId: number;
        quizTitle: string;
        totalMarks: number;
        startDate: string;
        endDate: string;
        status?: "Draft" | "Active" | "Completed";
    }
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        facultyId: payload.facultyId,
        collegeSubjectId: payload.collegeSubjectId,
        collegeSectionsId: payload.collegeSectionsId,
        collegeSubjectUnitId: payload.collegeSubjectUnitId,
        quizTitle: payload.quizTitle.trim(),
        totalMarks: payload.totalMarks,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: payload.status ?? "Draft",
        updatedAt: now,
    };

    if (!payload.quizId) {
        upsertPayload.createdAt = now;

        const { data, error } = await supabase
            .from("quizzes")
            .insert([upsertPayload])
            .select("quizId")
            .single();

        if (error) {
            console.error("saveQuiz insert error:", error);
            return { success: false, error };
        }

        return { success: true, quizId: data.quizId };
    }

    const { error } = await supabase
        .from("quizzes")
        .update(upsertPayload)
        .eq("quizId", payload.quizId);

    if (error) {
        console.error("saveQuiz update error:", error);
        return { success: false, error };
    }

    return { success: true, quizId: payload.quizId };
}

export async function updateQuizStatus(
    quizId: number,
    status: "Draft" | "Active" | "Completed"
) {
    const { error } = await supabase
        .from("quizzes")
        .update({ status, updatedAt: new Date().toISOString() })
        .eq("quizId", quizId);

    if (error) {
        console.error("updateQuizStatus error:", error);
        return { success: false, error };
    }

    return { success: true };
}

export async function deactivateQuiz(quizId: number) {
    const { error } = await supabase
        .from("quizzes")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("quizId", quizId);

    if (error) {
        console.error("deactivateQuiz error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function autoCompleteExpiredQuizzes(facultyId: number) {
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
        .from("quizzes")
        .update({
            status: "Completed",
            updatedAt: new Date().toISOString(),
        })
        .lt("endDate", today)
        .eq("facultyId", facultyId)
        .eq("isActive", true)
        .neq("status", "Completed");

    if (error) {
        console.error("autoCompleteExpiredQuizzes error:", error);
    }
}

export async function fetchIncompleteQuizzesByFacultyId(facultyId: number) {
    const { data: quizzesWithQuestions } = await supabase
        .from("quiz_questions")
        .select("quizId")
        .eq("isActive", true)
        .is("deletedAt", null);

    const quizIdsWithQuestions = quizzesWithQuestions?.map((q: any) => q.quizId) ?? [];

    let query = supabase
        .from("quizzes")
        .select(`
            quizId,
            quizTitle,
            totalMarks,
            startDate,
            endDate,
            status
        `)
        .eq("facultyId", facultyId)
        .in("status", ["Draft", "Active"])
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (quizIdsWithQuestions.length > 0) {
        query = query.not("quizId", "in", `(${quizIdsWithQuestions.join(",")})`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("fetchIncompleteQuizzesByFacultyId error:", error);
        throw error;
    }

    return data ?? [];
}

