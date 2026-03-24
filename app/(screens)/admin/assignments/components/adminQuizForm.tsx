"use client";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface AdminQuizFormProps {
    onCancel: () => void;
    onSaved?: () => void;
}

export default function AdminQuizForm({ onCancel, onSaved }: AdminQuizFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [subjects] = useState([{ collegeSubjectId: 1, subjectName: "Data Structures" }]);
    const [sections] = useState([{ collegeSectionsId: 1, collegeSections: "Section A" }]);
    const [topics] = useState([
        { topicTitle: "Process Scheduling", collegeSubjectUnitId: 1 },
        { topicTitle: "Deadlocks", collegeSubjectUnitId: 2 }
    ]);
    
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(1);
    const [quizTitle, setQuizTitle] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (status: "Draft" | "Active") => {
        if (!quizTitle.trim()) return toast.error("Quiz title is required");
        if (!totalMarks) return toast.error("Total marks is required");
        if (!startDate) return toast.error("Start date is required");
        if (!endDate) return toast.error("End date is required");
        if (!selectedTopicId) return toast.error("Please select a topic");

        try {
            setIsSaving(true);
            setTimeout(() => {
                toast.success(status === "Draft" ? "Quiz saved as draft!" : "Quiz saved successfully!");
                
                const params = new URLSearchParams(searchParams.toString());
                params.set("tab", "quiz");
                params.set("quizView", "active");
                params.set("action", "addQuestions");
                params.set("quizId", "999");
                router.push(`${pathname}?${params.toString()}`);
            }, 800);
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="w-full  flex flex-col">
            <div className="mb-6">
                <div className="bg-blue-00 flex items-center lg:mb-1">
                    <CaretLeftIcon size={22} weight="bold" className="text-[#282828] cursor-pointer active:scale-90" onClick={onCancel} />
                    <h1 className="font-bold text-2xl text-[#282828]">Create New Quiz</h1>
                </div>
                <p className="text-[#282828] text-sm ">Enter details below to set up and publish your quiz for students.</p>
            </div>

            <div className="bg-white rounded-md p-3 flex flex-col gap-4 flex-1 border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-[#282828]">Quiz Title</label>
                    <input
                        type="text"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        placeholder="CPU Scheduling"
                        className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-[#282828]">Subject</label>
                        <input
                            type="text"
                            value={subjects[0]?.subjectName || ""}
                            readOnly
                            className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none bg-gray-50 cursor-not-allowed"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-[#282828]">Topic</label>
                        <div className="relative">
                            <select
                                value={selectedTopicId ?? ""}
                                onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                                className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors appearance-none bg-white cursor-pointer w-full"
                            >
                                <option value="">Select Topic</option>
                                {topics.map((topic, index) => (
                                    <option key={index} value={topic.collegeSubjectUnitId}>
                                        {topic.topicTitle}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#282828]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-[#282828]">Section(s)</label>
                        <input
                            type="text"
                            value={sections[0]?.collegeSections || ""}
                            readOnly
                            className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none bg-gray-50 cursor-not-allowed"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-[#282828]">Total Marks</label>
                        <input
                            type="number"
                            value={totalMarks}
                            onChange={(e) => setTotalMarks(e.target.value)}
                            placeholder="Eg: 40"
                            className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#282828]">Duration</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-[#282828]">Start Date</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-[#282828]">End Date</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-md cursor-pointer border border-[#16284F] text-[#16284F] text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave("Draft")}
                            disabled={isSaving}
                            className="px-6 py-2 rounded-md cursor-pointer bg-[#16284F] text-white text-sm font-medium hover:bg-[#102040] transition-colors disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save as Draft"}
                        </button>

                        <button
                            onClick={() => handleSave("Active")}
                            disabled={isSaving}
                            className="flex items-center cursor-pointer gap-2 px-6 py-2 rounded-md bg-[#43C17A] text-white text-sm font-medium hover:bg-[#35a868] transition-colors disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : <> Add Questions <span className="text-base">›</span> </>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}