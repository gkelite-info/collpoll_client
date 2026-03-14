"use client"

import { Suspense, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Alarm, ArrowLeft } from "@phosphor-icons/react";
import { Loader } from "../../calendar/right/timetable";
import { MOCK_QUESTIONS } from "./quizData";

function QuizAttemptScreenContent({ quiz }: { quiz: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [answers, setAnswers] = useState<Record<number, string>>({});
    
    const initialMinutes = parseInt(quiz?.timeLimit?.split(" ")[0]) || 30;
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleOptionChange = (questionId: number, option: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("quizId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSubmit = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("quizId");
        params.set("tab", "quiz");
        params.set("quizView", "attempted");
        router.push(`${pathname}?${params.toString()}`);
    };

    const progressCount = Object.keys(answers).length;
    const progressPercentage = (progressCount / MOCK_QUESTIONS.length) * 100;

    return (
        <div className="flex flex-col h-full bg-[#f4f4f4] rounded-lg -m-2 p-4 relative">
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1">
                    <ArrowLeft 
                        size={24} className="text-[#282828] cursor-pointer hover:text-gray-600 mb-2" weight="bold" onClick={handleBack}
                    />
                    <h2 className="text-xl font-bold text-[#282828]">{quiz?.courseName || "Operating Systems"}</h2>
                    <p className="text-sm font-medium text-[#282828]">{quiz?.topic || "Process Scheduling & Deadlocks"}</p>
                </div>
                
                <div className="flex items-center gap-2 bg-[#182142] text-white px-4 py-2 rounded-md">
                    <Alarm size={20} weight="fill" className="text-[#87cefa]" />
                    <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-end mb-2">
                    <span className="text-[#43C17A] font-bold text-base">
                        {progressCount.toString().padStart(2, '0')} of {MOCK_QUESTIONS.length}
                    </span>
                </div>
                <div className="h-2.5 w-full bg-[#43C17A2B] rounded-full overflow-hidden">
                    <div className="h-full bg-[#43C17A] transition-all duration-300 ease-in-out" style={{ width: `${progressPercentage}%` }} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[60vh] pb-5 space-y-4">
                {MOCK_QUESTIONS.map((q) => (
                    <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-base font-semibold text-[#282828] mb-4">{q.question}</h4>
                        <div className="flex flex-col gap-3">
                            {q.options.map((opt, idx) => {
                                const isSelected = answers[q.id] === opt;
                                return (
                                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "border-[#43C17A]" : "border-gray-400 group-hover:border-[#43C17A]"}`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#43C17A]" />}
                                        </div>
                                        <span className={`text-sm ${isSelected ? "text-[#282828]" : "text-gray-500"}`}>{opt}</span>
                                        <input type="radio" name={`question-${q.id}`} value={opt} checked={isSelected} onChange={() => handleOptionChange(q.id, opt)} className="hidden" />
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 flex justify-end">
                <button onClick={handleSubmit} className="bg-[#43C17A] cursor-pointer text-white px-6 py-2.5 rounded-md font-bold text-sm">
                    Submit Quiz
                </button>
            </div>
        </div>
    );
}

export default function QuizAttemptScreen({ quiz }: { quiz: any }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center w-full h-full"><Loader /></div>}>
            <QuizAttemptScreenContent quiz={quiz} />
        </Suspense>
    );
}