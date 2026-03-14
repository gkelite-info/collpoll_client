"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Question, Exam } from "@phosphor-icons/react";
import { AttemptedQuizCard } from "./quizCard";

export default function QuizPerformanceModal({ quiz }: { quiz: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("quizId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleViewAnswers = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.set("action", "viewAnswers");
        router.push(`${pathname}?${params.toString()}`);
    };

    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (quiz.percentage / 100) * circumference;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={handleClose} />
            
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[90vw] overflow-hidden flex flex-col">
                <div className="p-6 pb-2 border-b border-gray-100 pointer-events-none">
                     <AttemptedQuizCard data={quiz} />
                </div>

                <div className="p-6 flex flex-col items-center relative">
                    <button 
                        onClick={handleViewAnswers}
                        className="absolute cursor-pointer top-4 right-6 bg-[#16284F] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md"
                    >
                        View Answers
                    </button>

                    <div className="relative w-48 h-48 mt-4 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <defs>
                                <linearGradient id="doctorStrangePortal" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#F5AF19" />
                                    <stop offset="50%" stopColor="#F12711" />
                                    <stop offset="100%" stopColor="#F5AF19" />
                                </linearGradient>
                            </defs>
                            <circle cx="96" cy="96" r={radius} stroke="#f0f0f0" strokeWidth="16" fill="transparent" />
                            <circle 
                                cx="96" cy="96" r={radius} 
                                stroke="url(#doctorStrangePortal)" 
                                strokeWidth="16" fill="transparent" 
                                strokeDasharray={circumference} 
                                strokeDashoffset={offset} 
                                strokeLinecap="round" 
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-[#43C17A] tracking-tight">{quiz.score}</span>
                            <span className="text-sm font-bold text-[#16284F]">{quiz.percentage}%</span>
                            <span className="text-xs font-semibold text-gray-500 mt-1">Quiz Score</span>
                        </div>
                    </div>

                    <div className="text-center mt-6 mb-8">
                        <h3 className="text-lg font-bold text-[#282828]">Good job! you performed well in this quiz.</h3>
                        <p className="text-sm text-gray-600 mt-1">you answered {quiz.percentage}% of question correctly.<br/>Focus on deadlocks concepts to improve further</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 w-full">
                        <div className="bg-[#f0fcf5] p-3 rounded-xl flex flex-col items-center justify-center border border-[#d1f4e0]">
                            <div className="flex items-center gap-1 text-[#43C17A] text-xs font-bold mb-1">
                                <CheckCircle weight="fill" size={14}/> Correct Answers
                            </div>
                            <span className="text-lg font-bold text-[#282828]">{quiz.correct.toString().padStart(2, '0')}</span>
                        </div>

                        <div className="bg-[#fff1f0] p-3 rounded-xl flex flex-col items-center justify-center border border-[#fce8e6]">
                            <div className="flex items-center gap-1 text-[#FF3B30] text-xs font-bold mb-1">
                                <XCircle weight="fill" size={14}/> Wrong Answers
                            </div>
                            <span className="text-lg font-bold text-[#282828]">{quiz.wrong.toString().padStart(2, '0')}</span>
                        </div>

                        <div className="bg-[#f4f6f8] p-3 rounded-xl flex flex-col items-center justify-center border border-gray-200">
                            <div className="flex items-center gap-1 text-[#6b7280] text-xs font-bold mb-1">
                                <Question weight="regular" size={14}/> Unanswered
                            </div>
                            <span className="text-lg font-bold text-[#282828]">{quiz.unanswered.toString().padStart(2, '0')}</span>
                        </div>

                        <div className="bg-[#f0fcf5] p-3 rounded-xl flex flex-col items-center justify-center border border-[#d1f4e0]">
                            <div className="flex items-center gap-1 text-[#43C17A] text-xs font-bold mb-1">
                                <Question weight="regular" size={14}/> Total Questions
                            </div>
                            <span className="text-lg font-bold text-[#282828]">{quiz.total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}