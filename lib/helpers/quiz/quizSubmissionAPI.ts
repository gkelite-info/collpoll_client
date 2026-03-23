import { supabase } from "@/lib/supabaseClient";

export type QuizSubmissionRow = {
    submissionId: number;
    quizId: number;
    studentId: number;
    totalMarksObtained: number;
    submittedAt: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchSubmissionsByQuizId(quizId: number) {
    const { data, error } = await supabase
        .from("quiz_submissions")
        .select(`
      submissionId,
      quizId,
      studentId,
      totalMarksObtained,
      submittedAt,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("quizId", quizId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("submittedAt", { ascending: false });

    if (error) {
        console.error("fetchSubmissionsByQuizId error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchSubmissionByStudentAndQuiz(
    studentId: number,
    quizId: number
) {
    const { data, error } = await supabase
        .from("quiz_submissions")
        .select("submissionId, totalMarksObtained, submittedAt")
        .eq("studentId", studentId)
        .eq("quizId", quizId)
        .is("deletedAt", null)
        .single();

    if (error) {
        if (error.code === "PGRST116") return { success: true, data: null };
        throw error;
    }

    return { success: true, data };
}

export async function saveQuizSubmission(payload: {
    quizId: number;
    studentId: number;
    totalMarksObtained: number;
}) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("quiz_submissions")
        .insert([{
            quizId: payload.quizId,
            studentId: payload.studentId,
            totalMarksObtained: payload.totalMarksObtained,
            submittedAt: now,
            createdAt: now,
            updatedAt: now,
        }])
        .select("submissionId")
        .single();

    if (error) {
        console.error("saveQuizSubmission error:", error);
        return { success: false, error };
    }

    return { success: true, submissionId: data.submissionId };
}

export async function deactivateQuizSubmission(submissionId: number) {
    const { error } = await supabase
        .from("quiz_submissions")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("submissionId", submissionId);

    if (error) {
        console.error("deactivateQuizSubmission error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function fetchSubmissionsWithStudentsByQuizId(quizId: number) {
    const { data, error } = await supabase
        .from("quiz_submissions")
        .select(`
            submissionId,
            quizId,
            studentId,
            totalMarksObtained,
            submittedAt
        `)
        .eq("quizId", quizId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("submittedAt", { ascending: false });

    if (error) {
        console.error("fetchSubmissionsWithStudentsByQuizId error:", error);
        throw error;
    }

    return data ?? [];
}