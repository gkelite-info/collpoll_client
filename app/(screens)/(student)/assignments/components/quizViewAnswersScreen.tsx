"use client"

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "@phosphor-icons/react";
import { Loader } from "../../calendar/right/timetable";
import { MOCK_QUESTIONS, MOCK_USER_ANSWERS } from "./quizData";

function QuizViewAnswersScreenContent({ quiz }: { quiz: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("quizId");
        params.set("tab", "quiz");
        params.set("quizView", "attempted");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f4f4] rounded-lg -m-2 p-4 relative">
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                    <ArrowLeft 
                        size={24} 
                        className="text-[#282828] cursor-pointer hover:text-gray-600 mb-2" 
                        weight="bold" 
                        onClick={handleBack}
                    />
                    <h2 className="text-xl font-bold text-[#282828]">{quiz?.courseName || "Operating Systems"}</h2>
                    <p className="text-sm font-medium text-[#282828]">{quiz?.topic || "Process Scheduling & Deadlocks"}</p>
                </div>
                
                <div className="text-xl font-bold text-[#282828] mt-8">
                    Score : <span className="text-[#43C17A]">{quiz?.score || "25/30"}</span>
                </div>
            </div>

            <div className="mb-6">
                <div className="h-2.5 w-full bg-[#dcfce7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#43C17A] w-[83%]" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-screen pb-5 space-y-4">
                {MOCK_QUESTIONS.map((q) => {
                    const userAnswer = MOCK_USER_ANSWERS[q.id];
                    const isAnswered = !!userAnswer;
                    const isCorrectOverall = userAnswer === q.correctAnswer;

                    return (
                        <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-base font-bold text-[#282828] max-w-[85%]">{q.question}</h4>
                                
                                <span className={`px-4 py-1 text-sm font-bold rounded-md text-white ${isCorrectOverall ? 'bg-[#43C17A]' : 'bg-[#FF3B30]'}`}>
                                    {isCorrectOverall ? 'Correct' : 'Wrong'}
                                </span>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                {q.options.map((opt, idx) => {
                                    const isThisSelected = userAnswer === opt;
                                    const isThisCorrect = q.correctAnswer === opt;
                                    
                                    let bgClass = "bg-transparent";
                                    let textClass = "text-gray-500";
                                    let icon = <div className="w-4 h-4 rounded-full border border-gray-300" />;
                                    
                                    if (isThisCorrect) {
                                        bgClass = "bg-[#d1f4e0]"; 
                                        textClass = "text-[#43C17A]";
                                        icon = <CheckCircle size={20} weight="fill" className="text-[#43C17A]" />;
                                    } else if (isThisSelected && !isThisCorrect) {
                                        bgClass = "bg-[#fce8e6]"; 
                                        textClass = "text-[#FF3B30]";
                                        icon = <XCircle size={20} weight="fill" className="text-[#FF3B30]" />;
                                    }

                                    return (
                                        <div key={idx} className={`flex items-center gap-3 px-3 py-2 rounded-md ${bgClass}`}>
                                            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                                                {icon}
                                            </div>
                                            <span className={`text-sm ${textClass}`}>{opt}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {!isCorrectOverall && (
                                <div className="flex items-center gap-2 mt-4 text-sm font-semibold">
                                    <CheckCircle size={20} weight="fill" className="text-[#9be4bc]" />
                                    <span className="text-[#282828]">
                                        Correct Answer : <span className="text-[#43C17A]">{q.correctAnswer}</span>
                                    </span>
                                </div>
                            )}
                            {isCorrectOverall && (
                                <div className="flex items-center gap-2 mt-4 text-sm font-semibold">
                                    <CheckCircle size={20} weight="fill" className="text-[#9be4bc]" />
                                    <span className="text-[#282828]">
                                        Correct Answer : <span className="text-[#43C17A]">{q.correctAnswer}</span>
                                    </span>
                                </div>
                            )}
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