"use client"

import { Suspense, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { Loader } from "../../calendar/right/timetable";
import { fetchQuestionsWithOptionsByQuizId } from "@/lib/helpers/quiz/quizQuestionAPI";
import toast from "react-hot-toast";
import { saveBulkSubmissionAnswers } from "@/lib/helpers/quiz/quizSubmissionAnswerAPI";
import { getStudentAttemptCount, saveQuizSubmission } from "@/lib/helpers/quiz/quizSubmissionAPI";
import { useStudent } from "@/app/utils/context/student/useStudent";

function QuizAttemptScreenContent({ quiz, onSubmitSuccess }: { quiz: any, onSubmitSuccess?: () => void; }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<number, { optionId?: number; writtenAnswer?: string }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { studentId } = useStudent();

    const initialMinutes = parseInt(quiz?.timeLimit?.split(" ")[0]) || 30;
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

    const MAX_ATTEMPTS = 3;
    const [attemptCount, setAttemptCount] = useState(0);
    const [alreadyAttempted, setAlreadyAttempted] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!quiz?.id || !studentId) return;
        async function load() {
            try {
                setIsLoading(true);
                const [questionsData, count] = await Promise.all([
                    fetchQuestionsWithOptionsByQuizId(quiz.id),
                    getStudentAttemptCount(quiz.id, studentId as number),
                ]);
                setQuestions(questionsData);
                setAttemptCount(count);
                if (count >= MAX_ATTEMPTS) {
                    setAlreadyAttempted(true);
                }
            } catch (err) {
                toast.error("Failed to load quiz");
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [quiz?.id, studentId]);

    const handleOptionChange = (questionId: number, optionId: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: { optionId } }));
    };

    const handleWrittenAnswerChange = (questionId: number, text: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: { writtenAnswer: text } }));
    };

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("quizId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSubmit = async () => {
        if (!studentId || !quiz?.id) return toast.error("Missing student or quiz info");

        try {
            setIsSubmitting(true);

            let totalMarksObtained = 0;
            const answersPayload = questions.map((q) => {
                const answer = answers[q.questionId];
                if (q.questionType === "Multiple Choice") {
                    const selectedOption = q.quiz_question_options?.find(
                        (o: any) => o.optionId === answer?.optionId
                    );
                    const isCorrect = selectedOption?.isCorrect ?? false;
                    if (isCorrect) totalMarksObtained += q.marks;
                    return {
                        questionId: q.questionId,
                        selectedOptionId: answer?.optionId ?? null,
                        writtenAnswer: null,
                        isCorrect,
                        marksObtained: isCorrect ? q.marks : 0,
                    };
                } else {
                    const correctOption = q.quiz_question_options?.find(
                        (o: any) => o.isCorrect === true
                    );
                    const isCorrect = answer?.writtenAnswer?.trim().toLowerCase() ===
                        correctOption?.optionText?.trim().toLowerCase();
                    if (isCorrect) totalMarksObtained += q.marks;
                    return {
                        questionId: q.questionId,
                        selectedOptionId: null,
                        writtenAnswer: answer?.writtenAnswer ?? null,
                        isCorrect,
                        marksObtained: isCorrect ? q.marks : 0,
                    };
                }
            });

            const submissionResult = await saveQuizSubmission({
                quizId: quiz.id,
                studentId,
                totalMarksObtained,
                attemptNumber: attemptCount + 1,
            });

            if (!submissionResult.success || !submissionResult.submissionId) {
                toast.error("Failed to submit quiz");
                return;
            }

            await saveBulkSubmissionAnswers(submissionResult.submissionId, answersPayload);

            toast.success("Quiz submitted successfully!");
            onSubmitSuccess?.();

        } catch (err) {
            console.error("handleSubmit error:", err);
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const progressCount = Object.keys(answers).length;
    const progressPercentage = questions.length > 0 ? (progressCount / questions.length) * 100 : 0;

    if (alreadyAttempted) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-3 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-[#D5FFE7] flex items-center justify-center">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#282828]">All Attempts Used!</h2>
                    <p className="text-sm text-gray-500 text-center">
                        You have used all <span className="font-bold text-[#282828]">{MAX_ATTEMPTS} attempts</span> for this quiz.
                        <br /> Check your score in Attempted Quizzes.
                    </p>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete("action");
                            params.delete("quizId");
                            params.set("tab", "quiz");
                            params.set("quizView", "attempted");
                            router.push(`${pathname}?${params.toString()}`);
                        }}
                        className="bg-[#43C17A] text-white px-6 py-2 rounded-md font-bold text-sm cursor-pointer hover:bg-[#35a868] transition-colors"
                    >
                        View Attempted Quizzes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f4f4f4] rounded-lg -m-2 p-4 relative">
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center lg:mb-1">
                        <CaretLeftIcon
                            size={24}
                            className="text-[#282828] cursor-pointer hover:text-gray-600"
                            weight="bold"
                            onClick={handleBack}
                        />
                        <h2 className="text-xl font-bold text-[#282828]">{quiz?.courseName || "Quiz"}</h2>
                    </div>
                    <p className="text-sm font-medium text-[#282828] lg:ml-6">{quiz?.topic || ""}</p>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-end mb-2">
                    <span className="text-[#43C17A] font-bold text-base">
                        {progressCount} of {questions.length}
                    </span>
                </div>
                <div className="h-2.5 w-full bg-[#43C17A2B] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#43C17A] transition-all duration-300 ease-in-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[60vh] pb-5 space-y-4 focus:outline-none">
                {questions.map((q) => (
                    <div key={q.questionId} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-base font-semibold text-[#282828] mb-4">
                            {q.questionText}
                        </h4>

                        {q.questionType === "Multiple Choice" ? (
                            <div className="flex flex-col gap-3">
                                {q.quiz_question_options
                                    ?.filter((o: any) => !o.isCorrect || q.questionType === "Multiple Choice")
                                    .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                                    .map((opt: any) => {
                                        const isSelected = answers[q.questionId]?.optionId === opt.optionId;
                                        return (
                                            <label key={opt.optionId} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "border-[#43C17A]" : "border-gray-400 group-hover:border-[#43C17A]"}`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#43C17A]" />}
                                                </div>
                                                <span className={`text-sm ${isSelected ? "text-[#282828]" : "text-gray-500"}`}>
                                                    {opt.optionText}
                                                </span>
                                                <input
                                                    type="radio"
                                                    name={`question-${q.questionId}`}
                                                    value={opt.optionId}
                                                    checked={isSelected}
                                                    onChange={() => handleOptionChange(q.questionId, opt.optionId)}
                                                    className="hidden"
                                                />
                                            </label>
                                        );
                                    })}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={answers[q.questionId]?.writtenAnswer ?? ""}
                                onChange={(e) => handleWrittenAnswerChange(q.questionId, e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full border-b border-gray-300 pb-1 text-sm text-[#282828] outline-none focus:border-[#43C17A] bg-transparent"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-[#43C17A] cursor-pointer focus:outline-none text-white px-6 py-2.5 rounded-md font-bold text-sm disabled:opacity-50"
                >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </button>
            </div>
        </div>
    );
}

export default function QuizAttemptScreen({ quiz, onSubmitSuccess }: { quiz: any, onSubmitSuccess?: () => void; }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center w-full h-full"><Loader /></div>}>
            <QuizAttemptScreenContent quiz={quiz} onSubmitSuccess={onSubmitSuccess}/>
        </Suspense>
    );
} 