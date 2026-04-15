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
    .select(
      `
      submissionId,
      quizId,
      studentId,
      totalMarksObtained,
      submittedAt,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
    )
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
  quizId: number,
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
  attemptNumber: number;
}) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("quiz_submissions")
    .insert([
      {
        quizId: payload.quizId,
        studentId: payload.studentId,
        totalMarksObtained: payload.totalMarksObtained,
        attemptNumber: payload.attemptNumber,
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
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

// export async function fetchSubmissionsWithStudentsByQuizId(quizId: number) {
//   const { data, error } = await supabase
//     .from("quiz_submissions")
//     .select(
//       `
//             submissionId,
//             quizId,
//             studentId,
//             totalMarksObtained,
//             submittedAt
//         `,
//     )
//     .eq("quizId", quizId)
//     .eq("isActive", true)
//     .is("deletedAt", null)
//     .order("submittedAt", { ascending: false });

//   if (error) {
//     console.error("fetchSubmissionsWithStudentsByQuizId error:", error);
//     throw error;
//   }

//   return data ?? [];
// }

export async function getStudentAttemptCount(
  quizId: number,
  studentId: number,
): Promise<number> {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .select("submissionId")
    .eq("quizId", quizId)
    .eq("studentId", studentId)
    .is("deletedAt", null);

  if (error) {
    if (error.code === "PGRST116") return 0;
    throw error;
  }

  return data?.length ?? 0;
}

export async function fetchSubmissionDetails(submissionId: number) {
  const { data, error } = await supabase
    .from("quiz_submission_answers")
    .select(
      `
            answerId,
            questionId,
            selectedOptionId,
            writtenAnswer,
            isCorrect,
            marksObtained
        `,
    )
    .eq("submissionId", submissionId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("fetchSubmissionDetails error:", error);
    throw error;
  }

  return data ?? [];
}

export async function fetchSubmissionsWithStudentsByQuizId(quizId: number) {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .select(
      `
            submissionId,
            quizId,
            studentId,
            totalMarksObtained,
            submittedAt,
            students!inner (
                rollNumber,
                users!inner (
                    fullName,
                    user_profile (
                        profileUrl
                    )
                ),
                student_academic_history (
                    isCurrent,
                    college_sections (
                        collegeSections
                    )
                )
            )
        `,
    )
    .eq("quizId", quizId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("submittedAt", { ascending: false });

  if (error) {
    console.error("fetchSubmissionsWithStudentsByQuizId error:", error);
    throw error;
  }

  return (data ?? []).map((sub: any) => {
    const studentData = sub.students;
    const activeHistory = studentData?.student_academic_history?.find(
      (h: any) => h.isCurrent,
    );
    const section = activeHistory?.college_sections?.collegeSections || "-";

    const profileData = studentData?.users?.user_profile;
    const profileUrl = Array.isArray(profileData)
      ? profileData[0]?.profileUrl
      : profileData?.profileUrl;

    return {
      ...sub,
      students: {
        fullName: studentData?.users?.fullName,
        rollNumber: studentData?.rollNumber,
        section: section,
        profileImage: profileUrl || null,
      },
    };
  });
}
