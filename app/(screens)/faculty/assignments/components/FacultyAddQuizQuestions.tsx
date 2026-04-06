"use client";
import { useEffect, useState } from "react";
import { CaretLeftIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { saveQuizQuestion } from "@/lib/helpers/quiz/quizQuestionAPI";
import { saveBulkOptions } from "@/lib/helpers/quiz/quizQuestionOptionAPI";
import { fetchQuizById } from "@/lib/helpers/quiz/quizAPI";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

interface Option {
    id: number;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: number;
    title: string;
    type: "Multiple Choice" | "Fill in the Blanks";
    options: Option[];
    correctAnswer: string;
}

interface FacultyAddQuestionsProps {
    onBack: () => void;
    quizTitle?: string;
    quizTopic?: string;
    isLoading?: boolean;
    quizId?: number;
}

export default function FacultyAddQuestions({
    onBack,
    quizTitle = "CPU Scheduling",
    quizTopic = "Process Scheduling & Deadblocks",
    isLoading,
    quizId
}: FacultyAddQuestionsProps) {
    const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([
        {
            id: 1,
            title: "",
            type: "Multiple Choice",
            correctAnswer: "",
            options: [
                { id: 1, text: "", isCorrect: false },
                { id: 2, text: "", isCorrect: false },
                { id: 3, text: "", isCorrect: false },
                { id: 4, text: "", isCorrect: false },
            ],
        },
    ]);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [quizDetails, setQuizDetails] = useState<{ quizTitle: string; topicTitle: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDrafting, setIsDrafting] = useState(false);

    useEffect(() => {
        if (!quizId) return;
        fetchQuizById(quizId)
            .then((data) => {
                setQuizDetails({
                    quizTitle: data.quizTitle,
                    topicTitle: data.quizId,
                });
            })
            .catch(() => toast.error("Failed to fetch quiz details"));
    }, [quizId]);

    const addQuestion = () => {
        const lastType = questions[questions.length - 1]?.type || "Multiple Choice";
        const newQuestion: Question = {
            id: Date.now(),
            title: "",
            type: lastType,
            correctAnswer: "",
            options: [
                { id: 1, text: "", isCorrect: false },
                { id: 2, text: "", isCorrect: false },
                { id: 3, text: "", isCorrect: false },
                { id: 4, text: "", isCorrect: false },
            ],
        };
        setQuestions((prev) => [...prev, newQuestion]);
    };

    const deleteQuestion = (id: number) => {
        const question = questions.find(q => q.id === id);
        if (!question) return;
        if (isQuestionEmpty(question)) {
            setQuestions(prev => prev.filter(q => q.id !== id));
            return;
        }
        setDeleteQuestionId(id);
    };

    const confirmDeleteQuestion = () => {
        if (!deleteQuestionId) return;
        setQuestions(prev =>
            prev.filter(q => q.id !== deleteQuestionId)
        );
        setDeleteQuestionId(null);
    };

    const updateQuestionTitle = (id: number, title: string) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, title } : q))
        );
    };

    const updateQuestionType = (id: number, type: Question["type"]) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, type } : q))
        );
    };

    const updateOptionText = (qId: number, optId: number, text: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qId
                    ? {
                        ...q,
                        options: q.options.map((o) =>
                            o.id === optId ? { ...o, text } : o
                        ),
                    }
                    : q
            )
        );
    };

    const setCorrectOption = (qId: number, optId: number) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qId
                    ? {
                        ...q,
                        options: q.options.map((o) => ({
                            ...o,
                            isCorrect: o.id === optId,
                        })),
                    }
                    : q
            )
        );
    };

    const addOption = (qId: number) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qId
                    ? {
                        ...q,
                        options: [
                            ...q.options,
                            { id: Date.now(), text: '', isCorrect: false },
                        ],
                    }
                    : q
            )
        );
    };

    const handleSave = async (status: "Draft" | "Active") => {
        if (!quizId) return toast.error("Quiz ID not found");
        for (const q of questions) {
            if (!q.title.trim()) return toast.error("All questions must have a title");
            if (q.type === "Multiple Choice") {
                const hasCorrect = q.options.some((o) => o.isCorrect);
                if (!hasCorrect) return toast.error(`Please mark a correct answer for: "${q.title}"`);
            }
            if (q.type === "Fill in the Blanks" && !q.correctAnswer.trim()) {
                return toast.error(`Please enter correct answer for: "${q.title}"`);
            }
        }
        try {
            setIsSaving(true);
            setIsDrafting(true);
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const qResult = await saveQuizQuestion({
                    quizId,
                    questionText: q.title,
                    questionType: q.type,
                    marks: 1,
                    displayOrder: i,
                });
                if (!qResult.success || !qResult.questionId) {
                    toast.error("Failed to save question");
                    return;
                }
                if (q.type === "Multiple Choice") {
                    await saveBulkOptions(
                        qResult.questionId,
                        q.options.map((o, idx) => ({
                            optionText: o.text,
                            isCorrect: o.isCorrect,
                            displayOrder: idx,
                        }))
                    );
                } else {
                    const allOptions = [
                        ...q.options.map((o, idx) => ({
                            optionText: o.text,
                            isCorrect: false,
                            displayOrder: idx,
                        })),
                        {
                            optionText: q.correctAnswer.trim(),
                            isCorrect: true,
                            displayOrder: q.options.length,
                        },
                    ];
                    await saveBulkOptions(qResult.questionId, allOptions);
                }
            }
            toast.success(status === "Draft" ? "Quiz saved as draft!" : "Quiz saved successfully!");
            const params = new URLSearchParams();
            params.set("tab", "quiz");
            params.set("quizView", status === "Draft" ? "drafts" : "active");
            params.set("refreshQuiz", "1");
            router.push(`${pathname}?${params.toString()}`);
        } catch (err) {
            console.error("handleSave error:", err);
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
            setIsDrafting(false);
        }
    };

    const isQuestionEmpty = (q: Question) => {
        const hasTitle = q.title.trim().length > 0;
        const hasOptions = q.options.some(o => o.text.trim().length > 0);
        const hasAnswer = q.correctAnswer.trim().length > 0;
        return !(hasTitle || hasOptions || hasAnswer);
    };

    const hasMultipleChoice = questions.some((q) => q.type === "Multiple Choice");

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-4">
                <div className="bg-blue-00 flex items-center lg:mb-1">
                    <CaretLeftIcon size={22} weight="bold" className="text-[#282828] cursor-pointer active:scale-90" onClick={onBack} />
                    <h1 className="font-bold text-2xl text-[#282828]">Create New Quiz</h1>
                </div>
                <p className="text-[#282828] text-sm lg:ml-6">
                    Enter details below to set up and publish your quiz for students.
                </p>
            </div>

            <div className="bg-white rounded-md px-4 py-3 mb-3 min-h-[60px]">
                <p className="font-bold text-[#282828] text-sm">
                    {quizDetails?.quizTitle || ""}
                </p>
                <p className="text-[#282828] text-xs mt-0.5">
                    {quizDetails?.quizTitle || ""}
                </p>
            </div>

            {/* <div className="flex justify-end mb-3">
                <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 bg-[#43C17A] text-white text-sm font-medium p-2 rounded-md hover:bg-[#35a868] transition-colors cursor-pointer"
                >
                    <span className="text-lg leading-none"><PlusCircleIcon size={20} weight="fill" color="white" /></span> Add Question
                </button>
            </div> */}

            <div className="flex justify-between items-center mb-3 gap-4">
                <div className="flex-1">
                    {hasMultipleChoice && (
                        <div className="inline-block bg-red-50 border border-red-100 px-3 py-1.5 rounded-md">
                            <p className="text-red-500 text-xs sm:text-sm font-medium m-0">
                                * Note: For multiple choice questions, select the correct answer by clicking the radio button.
                            </p>
                        </div>
                    )}
                </div>
                <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 bg-[#43C17A] text-white text-sm font-medium p-2 rounded-md hover:bg-[#35a868] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                    <span className="text-lg leading-none"><PlusCircleIcon size={20} weight="fill" color="white" /></span> Add Question
                </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto flex-1 pb-4">
                {questions.map((question, index) => (
                    <div
                        key={question.id}
                        className={`bg-white rounded-md px-4 py-4 border-2 ${index === 0 ? "border-[#43C17A]" : "border-transparent"
                            }`}
                    >
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
                                onChange={(e) =>
                                    updateQuestionType(question.id, e.target.value as Question["type"])
                                }
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
                                            placeholder={`Option ${question.options.findIndex(o => o.id === option.id) + 1}`}
                                            onChange={(e) =>
                                                updateOptionText(question.id, option.id, e.target.value)
                                            }
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
                                                placeholder={`Option ${question.options.findIndex(o => o.id === option.id) + 1}`}
                                                onChange={(e) =>
                                                    updateOptionText(question.id, option.id, e.target.value)
                                                }
                                                className="text-sm text-[#282828] outline-none border-b border-gray-300 bg-transparent w-20 text-center"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 font-medium">Correct Answer:</span>
                                        <input
                                            type="text"
                                            value={question.correctAnswer}
                                            onChange={(e) =>
                                                setQuestions((prev) =>
                                                    prev.map((q) =>
                                                        q.id === question.id
                                                            ? { ...q, correctAnswer: e.target.value }
                                                            : q
                                                    )
                                                )
                                            }
                                            placeholder="Type correct answer..."
                                            className="text-sm text-[#282828] outline-none border-b border-[#43C17A] bg-transparent flex-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            {question.type === "Multiple Choice" && (
                                <button
                                    onClick={() => addOption(question.id)}
                                    className="text-[#43C17A] text-sm font-medium cursor-pointer hover:underline"
                                >
                                    Add Other
                                </button>
                            )}
                            <div className="flex items-center gap-3">
                                <button className="text-[#43C17A] cursor-pointer hover:opacity-75 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => deleteQuestion(question.id)}
                                    className="text-red-500 cursor-pointer hover:opacity-75 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-3">
                <button
                    onClick={() => handleSave("Draft")}
                    disabled={isDrafting}
                    className="px-8 py-2 rounded-md bg-[#16284F] text-white text-sm font-bold cursor-pointer hover:bg-[#102040] transition-colors disabled:opacity-50"
                >
                    {isDrafting ? "Saving..." : "Draft"}
                </button>
                <button
                    onClick={() => handleSave("Active")}
                    disabled={isSaving}
                    className="px-8 py-2 rounded-md bg-[#43C17A] text-white text-sm font-bold cursor-pointer hover:bg-[#35a868] transition-colors disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>
            <ConfirmDeleteModal
                open={!!deleteQuestionId}
                name="question"
                onConfirm={confirmDeleteQuestion}
                onCancel={() => setDeleteQuestionId(null)}
            />
        </div>
    );
}