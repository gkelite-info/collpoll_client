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