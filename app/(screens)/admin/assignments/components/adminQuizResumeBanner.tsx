"use client";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface IncompleteQuiz {
    quizId: number;
    quizTitle: string;
    totalMarks: number;
    startDate: string;
    endDate: string;
    status: "Draft" | "Active";
}

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export default function AdminQuizResumeBanner({ margintop }: { margintop?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [quizzes, setQuizzes] = useState<IncompleteQuiz[]>([
        {
            quizId: 99,
            quizTitle: "Memory Management Concepts (Draft)",
            totalMarks: 45,
            startDate: "2025-01-01",
            endDate: "2025-01-10",
            status: "Draft"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading || quizzes.length === 0) return null;

    const handleResume = (quizId: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "addQuestions");
        params.set("quizId", String(quizId));
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className={`w-full bg-[#FFF8E7] border border-[#F5C842] rounded-md px-4 py-3 mb-4 ${margintop}`}>
            <p className="text-sm font-bold text-[#282828] mb-3">
                🕐 Continue Leftover Quizzes
            </p>
            <div className="flex flex-col gap-2">
                {quizzes.map((quiz) => (
                    <div key={quiz.quizId} className="bg-white rounded-md px-4 py-3 flex items-center justify-between border border-gray-100">
                        <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-semibold text-[#282828]">
                                {quiz.quizTitle}
                            </p>
                            <p className="text-xs text-gray-500">
                                {quiz.totalMarks} Marks • {formatDate(quiz.startDate)} → {formatDate(quiz.endDate)}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${quiz.status === "Draft" ? "bg-gray-100 text-gray-500" : "bg-[#D5FFE7] text-[#43C17A]"}`}>
                                {quiz.status}
                            </span>
                            <button
                                onClick={() => handleResume(quiz.quizId)}
                                className="text-xs font-bold text-white bg-[#43C17A] px-4 py-1.5 rounded-md hover:bg-[#35a868] transition-colors cursor-pointer"
                            >
                                Resume
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}