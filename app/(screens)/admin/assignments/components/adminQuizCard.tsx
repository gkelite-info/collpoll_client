"use client";
import { PencilSimple, Trash } from "@phosphor-icons/react";

export default function AdminQuizCard({ 
    data, 
    quizView = "active",
    onViewSubmissions,
    onEdit
}: { 
    data: any, 
    quizView?: "active" | "drafts" | "completed", 
    onViewSubmissions?: (quizId: number) => void;
    onEdit?: (quizId: number) => void;
}) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-base font-bold text-[#282828]">{data.title}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">{data.subtitle}</p>
                </div>
                
                {quizView === "drafts" && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit?.(data.quizId || data.id)}
                            className="bg-[#43C17A1A] cursor-pointer p-1.5 rounded-full text-[#43C17A] hover:bg-[#43C17A33] transition-colors"
                        >
                            <PencilSimple size={16} weight="fill" />
                        </button>
                        <button className="bg-red-50 cursor-pointer p-1.5 rounded-full hover:bg-red-100 transition-colors">
                            <Trash size={16} weight="fill" className="text-red-500" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-[#282828] w-28">Duration</span>
                    <span className="bg-[#F3F0FF] text-[#8B5CF6] px-2 py-0.5 rounded-md text-xs font-semibold">
                        {data.duration}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-[#282828] w-28">Total Questions</span>
                    <span className="text-gray-600 font-medium">{data.totalQuestions}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-[#282828] w-28">Total Marks</span>
                        <span className="text-gray-600 font-medium">{data.totalMarks}</span>
                    </div>
                    
                    {quizView === "drafts" ? (
                        <button className="bg-[#16284F] text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-[#102040] transition-colors cursor-pointer">
                            Publish
                        </button>
                    ) : (
                        <span
                            onClick={() => onViewSubmissions?.(data.quizId || data.id)}
                            className="text-[#43C17A] font-semibold cursor-pointer hover:underline"
                        >
                            View Submissions
                        </span>
                    )}
                </div>
            </div>
        </div >
    );
}

export const STATIC_ACTIVE_QUIZZES = Array.from({ length: 18 }, (_, i) => ({
    id: `active-${i + 1}`,
    title: "Deadlocks",
    subtitle: "Avoidance & Detection Techniques",
    duration: "11/01/2025 - 25/01/2025",
    totalQuestions: 10,
    totalMarks: 30
}));

export const STATIC_DRAFT_QUIZZES = Array.from({ length: 8 }, (_, i) => ({
    id: `draft-${i + 1}`,
    title: "Memory Management",
    subtitle: "Paging & Segmentation Concepts",
    duration: "Unscheduled",
    totalQuestions: 15,
    totalMarks: 45
}));

export const STATIC_COMPLETED_QUIZZES = Array.from({ length: 8 }, (_, i) => ({
    id: `completed-${i + 1}`,
    title: "Process Synchronization",
    subtitle: "Semaphores & Mutex Locks",
    duration: "01/12/2024 - 15/12/2024",
    totalQuestions: 20,
    totalMarks: 60
}));