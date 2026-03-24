"use client"

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, CaretLeftIcon, CheckCircle, XCircle } from "@phosphor-icons/react";
import { Loader } from "../../calendar/right/timetable";
import { fetchQuestionsWithOptionsByQuizId } from "@/lib/helpers/quiz/quizQuestionAPI";
import { fetchSubmissionDetails } from "@/lib/helpers/quiz/quizSubmissionAPI";

function QuizViewAnswersScreenContent({ quiz }: { quiz: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const submissionId = searchParams.get("submissionId");
    const activeQuizId = searchParams.get("quizId");

    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!activeQuizId || !submissionId) return;
        async function load() {
            try {
                setIsLoading(true);
                const [questionsData, answersData] = await Promise.all([
                    fetchQuestionsWithOptionsByQuizId(Number(activeQuizId)),
                    fetchSubmissionDetails(Number(submissionId)),
                ]);
                setQuestions(questionsData);
                setAnswers(answersData);
            } catch (err) {
                console.error("load error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [activeQuizId, submissionId]);

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.set("modal", "performance");
        router.push(`${pathname}?${params.toString()}`);
    };

    const totalMarks = quiz?.totalMarks ?? 0;
    const marksObtained = quiz?.totalMarksObtained ?? 0;
    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

    if (isLoading) return (
        <div className="flex justify-center items-center h-full">
            <Loader />
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[#f4f4f4] rounded-lg -m-2 p-4 relative">
            <div className="flex justify-between items-start mb-2">
                <div className="flex gap-1">
                    <CaretLeftIcon
                        size={24}
                        className="text-[#282828] cursor-pointer active:scale-90"
                        weight="bold"
                        onClick={handleBack}
                    />
                    <div className="bg-pink-00 flex flex-col">
                        <h2 className="text-xl font-bold text-[#282828]">
                            {quiz?.courseName || "Quiz"}
                        </h2>
                        <p className="text-sm font-medium text-[#282828]">
                            {quiz?.topic || ""}
                        </p>
                    </div>
                </div>
                <div className="text-xl font-bold text-[#282828] mt-8">
                    Score : <span className="text-[#43C17A]">{quiz?.score || "-"}</span>
                </div>
            </div>

            <div className="mb-6">
                <div className="h-2.5 w-full bg-[#dcfce7] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#43C17A] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[70vh] pb-5 space-y-4">
                {questions.map((q, index) => {
                    const studentAnswer = answers.find(
                        (a: any) => a.questionId === q.questionId
                    );

                    const isCorrect = studentAnswer?.isCorrect ?? false;

                    const correctOption = q.quiz_question_options?.find(
                        (o: any) => o.isCorrect === true
                    );

                    return (
                        <div key={q.questionId} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-base font-bold text-[#282828] max-w-[85%]">
                                    Q{index + 1}. {q.questionText}
                                </h4>
                                <span className={`px-4 py-1 text-sm font-bold rounded-md text-white ${isCorrect ? "bg-[#43C17A]" : "bg-[#FF3B30]"}`}>
                                    {isCorrect ? "Correct" : "Wrong"}
                                </span>
                            </div>

                            {q.questionType === "Multiple Choice" ? (
                                <div className="flex flex-col gap-2">
                                    {q.quiz_question_options
                                        ?.filter((o: any) => !o.isCorrect || q.questionType === "Multiple Choice")
                                        .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                                        .map((opt: any) => {
                                            const isSelected = studentAnswer?.selectedOptionId === opt.optionId;
                                            const isThisCorrect = opt.isCorrect;

                                            let bgClass = "bg-transparent";
                                            let textClass = "text-gray-500";
                                            let icon = <div className="w-4 h-4 rounded-full border border-gray-300" />;

                                            if (isThisCorrect) {
                                                bgClass = "bg-[#d1f4e0]";
                                                textClass = "text-[#43C17A]";
                                                icon = <CheckCircle size={20} weight="fill" className="text-[#43C17A]" />;
                                            } else if (isSelected && !isThisCorrect) {
                                                bgClass = "bg-[#fce8e6]";
                                                textClass = "text-[#FF3B30]";
                                                icon = <XCircle size={20} weight="fill" className="text-[#FF3B30]" />;
                                            }

                                            return (
                                                <div key={opt.optionId} className={`flex items-center gap-3 px-3 py-2 rounded-md ${bgClass}`}>
                                                    <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                                                        {icon}
                                                    </div>
                                                    <span className={`text-sm ${textClass}`}>{opt.optionText}</span>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className={`flex items-center gap-3 px-3 py-2 rounded-md ${isCorrect ? "bg-[#d1f4e0]" : "bg-[#fce8e6]"}`}>
                                        {isCorrect
                                            ? <CheckCircle size={20} weight="fill" className="text-[#43C17A]" />
                                            : <XCircle size={20} weight="fill" className="text-[#FF3B30]" />
                                        }
                                        <span className={`text-sm ${isCorrect ? "text-[#43C17A]" : "text-[#FF3B30]"}`}>
                                            Your answer: {studentAnswer?.writtenAnswer || "Not answered"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-4 text-sm font-semibold">
                                <CheckCircle size={20} weight="fill" className="text-[#9be4bc]" />
                                <span className="text-[#282828]">
                                    Correct Answer : <span className="text-[#43C17A]">
                                        {correctOption?.optionText || "-"}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function QuizViewAnswersScreen({ quiz }: { quiz: any }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center w-full h-full"><Loader /></div>}>
            <QuizViewAnswersScreenContent quiz={quiz} />
        </Suspense>
    );
}