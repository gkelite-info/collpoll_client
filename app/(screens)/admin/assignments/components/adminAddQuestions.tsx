"use client";
import { useEffect, useState } from "react";
import { CaretLeftIcon, PencilSimple, PlusCircleIcon, Trash } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface Option { id: number; text: string; isCorrect: boolean; }
interface Question { id: number; title: string; type: "Multiple Choice" | "Fill in the Blanks"; options: Option[]; correctAnswer: string; }

interface AdminAddQuestionsProps {
    onBack: () => void;
    quizTitle?: string;
    quizTopic?: string;
    quizId?: number;
}

export default function AdminAddQuestions({
    onBack,
    quizTitle = "CPU Scheduling",
    quizTopic = "Process Scheduling & Deadblocks",
    quizId
}: AdminAddQuestionsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [questions, setQuestions] = useState<Question[]>([
        {
            id: 1,
            title: "",
            type: "Multiple Choice",
            correctAnswer: "",
            options: [
                { id: 1, text: "Option 1", isCorrect: false },
                { id: 2, text: "Option 2", isCorrect: false },
                { id: 3, text: "Option 3", isCorrect: false },
                { id: 4, text: "Option 4", isCorrect: false },
            ],
        },
    ]);

    const [quizDetails, setQuizDetails] = useState<{ quizTitle: string; topicTitle: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!quizId) return;
        setQuizDetails({ quizTitle: "Mock Title", topicTitle: "Mock Topic" });
    }, [quizId]);

    const addQuestion = () => {
        const lastType = questions[questions.length - 1]?.type || "Multiple Choice";
        setQuestions((prev) => [...prev, { id: Date.now(), title: "", type: lastType, correctAnswer: "", options: [{ id: 1, text: "Option 1", isCorrect: false }, { id: 2, text: "Option 2", isCorrect: false }, { id: 3, text: "Option 3", isCorrect: false }, { id: 4, text: "Option 4", isCorrect: false }] }]);
    };
    const deleteQuestion = (id: number) => setQuestions((prev) => prev.filter((q) => q.id !== id));
    const updateQuestionTitle = (id: number, title: string) => setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, title } : q)));
    const updateQuestionType = (id: number, type: Question["type"]) => setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, type } : q)));
    const updateOptionText = (qId: number, optId: number, text: string) => setQuestions((prev) => prev.map((q) => q.id === qId ? { ...q, options: q.options.map((o) => o.id === optId ? { ...o, text } : o) } : q));
    const setCorrectOption = (qId: number, optId: number) => setQuestions((prev) => prev.map((q) => q.id === qId ? { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.id === optId })) } : q));
    const addOption = (qId: number) => setQuestions((prev) => prev.map((q) => q.id === qId ? { ...q, options: [...q.options, { id: Date.now(), text: `Option ${q.options.length + 1}`, isCorrect: false }] } : q));

    const handleSave = async (status: "Draft" | "Active") => {
        for (const q of questions) {
            if (!q.title.trim()) return toast.error("All questions must have a title");
            if (q.type === "Multiple Choice" && !q.options.some((o) => o.isCorrect)) return toast.error(`Please mark a correct answer for: "${q.title}"`);
            if (q.type === "Fill in the Blanks" && !q.correctAnswer.trim()) return toast.error(`Please enter correct answer for: "${q.title}"`);
        }

        setIsSaving(true);
        setTimeout(() => {
            toast.success(status === "Draft" ? "Quiz saved as draft!" : "Quiz saved successfully!");
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", "quiz");
            params.set("quizView", status === "Draft" ? "drafts" : "active");
            params.delete("action");
            router.push(`${pathname}?${params.toString()}`);
            setIsSaving(false);
        }, 1000);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-4">
                <div className="bg-blue-00 flex items-center lg:mb-1">
                    <CaretLeftIcon size={22} weight="bold" className="text-[#282828] cursor-pointer active:scale-90" onClick={onBack} />
                    <h1 className="font-bold text-2xl text-[#282828]">Create New Quiz</h1>
                </div>
                <p className="text-[#282828] text-sm ">Enter details below to set up and publish your quiz for students.</p>
            </div>

            <div className="bg-white rounded-md px-4 py-3 mb-3 border border-gray-100 shadow-sm">
                <p className="font-bold text-[#282828] text-sm">{quizDetails?.quizTitle || quizTitle}</p>
                <p className="text-[#282828] text-xs mt-0.5">{quizDetails?.topicTitle || quizTopic}</p>
            </div>

            <div className="flex justify-end mb-3">
                <button onClick={addQuestion} className="flex items-center gap-2 bg-[#43C17A] text-white text-sm font-medium p-2 rounded-md hover:bg-[#35a868] transition-colors cursor-pointer">
                    <span className="text-lg leading-none"><PlusCircleIcon size={20} weight="fill" color="white" /></span> Add Question
                </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto flex-1 pb-4">
                {questions.map((question, index) => (
                    <div key={question.id} className={`bg-white shadow-sm rounded-md px-4 py-4 border-2 ${index === 0 ? "border-[#43C17A]" : "border-gray-100"}`}>
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <input
                                type="text"
                                value={question.title}
                                onChange={(e) => updateQuestionTitle(question.id, e.target.value)}
                                placeholder="Untitled Question"
                                className="flex-1 border-b border-gray-300 pb-1 text-sm font-semibold text-[#282828] outline-none focus:border-[#43C17A] bg-transparent"
                            />
                            <select
                                value={question.type}
                                onChange={(e) => updateQuestionType(question.id, e.target.value as Question["type"])}
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] bg-white cursor-pointer"
                            >
                                <option value="Multiple Choice">Multiple Choice</option>
                                <option value="Fill in the Blanks">Fill in the Blanks</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 mb-3">
                            {question.type === "Multiple Choice" ? (
                                question.options.map((option) => (
                                    <div key={option.id} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            checked={option.isCorrect}
                                            onChange={() => setCorrectOption(question.id, option.id)}
                                            className="accent-[#43C17A] w-4 h-4 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                            className="text-sm text-[#282828] outline-none border-b border-transparent focus:border-gray-300 bg-transparent"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap gap-4">
                                        {question.options.map((option) => (
                                            <input
                                                key={option.id}
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                                className="text-sm text-[#282828] outline-none border-b border-gray-300 bg-transparent w-20 text-center"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 font-medium">Correct Answer:</span>
                                        <input
                                            type="text"
                                            value={question.correctAnswer}
                                            onChange={(e) => setQuestions((prev) => prev.map((q) => q.id === question.id ? { ...q, correctAnswer: e.target.value } : q))}
                                            placeholder="Type correct answer..."
                                            className="text-sm text-[#282828] outline-none border-b border-[#43C17A] bg-transparent flex-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            {question.type === "Multiple Choice" && (
                                <button onClick={() => addOption(question.id)} className="text-[#43C17A] text-sm font-medium cursor-pointer hover:underline">
                                    Add Other
                                </button>
                            )}
                            <div className="flex items-center gap-3">
                                <button className="text-[#43C17A] cursor-pointer hover:opacity-75 transition-opacity">
                                    <PencilSimple size={16} weight="fill" />
                                </button>
                                <button onClick={() => deleteQuestion(question.id)} className="text-red-500 cursor-pointer hover:opacity-75 transition-opacity">
                                    <Trash size={16} weight="fill" className="text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => handleSave("Draft")} disabled={isSaving} className="px-8 py-2 rounded-md bg-[#16284F] text-white text-sm font-bold cursor-pointer hover:bg-[#102040] transition-colors disabled:opacity-50">
                    {isSaving ? "Saving..." : "Draft"}
                </button>
                <button onClick={() => handleSave("Active")} disabled={isSaving} className="px-8 py-2 rounded-md bg-[#43C17A] text-white text-sm font-bold cursor-pointer hover:bg-[#35a868] transition-colors disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
}