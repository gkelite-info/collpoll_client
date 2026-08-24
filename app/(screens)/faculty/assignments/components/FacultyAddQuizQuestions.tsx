"use client";
import { useEffect, useState } from "react";
import { CaretLeftIcon, PlusCircleIcon, X } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { saveQuizQuestion, fetchQuestionsWithOptionsByQuizId, deactivateQuizQuestion } from "@/lib/helpers/quiz/quizQuestionAPI";
import { saveBulkOptions } from "@/lib/helpers/quiz/quizQuestionOptionAPI";
import { fetchQuizById, updateQuizStatus } from "@/lib/helpers/quiz/quizAPI";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  quizId,
}: FacultyAddQuestionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 2000000000000,
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

  const { data: quizDetails, isLoading: isQuizLoading } = useQuery({
    queryKey: ["quizDetails", quizId],
    queryFn: async () => {
      if (!quizId) return null;
      const data = await fetchQuizById(quizId);
      return {
        quizTitle: data.quizTitle,
        topicTitle: data.college_subject_unit_topics?.topicTitle || "General Topic",
        maxQuestions: data.questionsCount || 0,
      };
    },
    enabled: !!quizId,
  });

  const { data: existingQuestions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["quizQuestions", quizId],
    queryFn: async () => {
      if (!quizId) return null;
      const existing = await fetchQuestionsWithOptionsByQuizId(quizId);
      if (!existing || existing.length === 0) return null;

      return existing.map((eq: any) => ({
        id: eq.questionId,
        title: eq.questionText,
        type: eq.questionType,
        correctAnswer: eq.questionType === "Fill in the Blanks" ? (eq.quiz_question_options?.[0]?.optionText || "") : "",
        options:
          eq.questionType === "Multiple Choice" && eq.quiz_question_options?.length > 0
            ? eq.quiz_question_options.map((o: any) => ({
                id: o.optionId,
                text: o.optionText,
                isCorrect: o.isCorrect,
              }))
            : [
                { id: 1, text: "", isCorrect: false },
                { id: 2, text: "", isCorrect: false },
                { id: 3, text: "", isCorrect: false },
                { id: 4, text: "", isCorrect: false },
              ],
      }));
    },
    enabled: !!quizId,
  });

  useEffect(() => {
    if (existingQuestions && existingQuestions.length > 0) {
      setQuestions(existingQuestions);
    }
  }, [existingQuestions]);

  const addQuestion = () => {
    if (quizDetails && questions.length >= quizDetails.maxQuestions) {
      toast.error(`You can only add up to ${quizDetails.maxQuestions} questions for this quiz.`);
      return;
    }

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

  const isQuestionEmpty = (q: Question) => {
    const hasTitle = q.title.trim().length > 0;
    const hasOptions = q.options.some((o) => o.text.trim().length > 0);
    const hasAnswer = q.correctAnswer.trim().length > 0;
    return !(hasTitle || hasOptions || hasAnswer);
  };

  const deleteQuestion = (id: number) => {
    const question = questions.find((q) => q.id === id);
    if (!question) return;
    
    // If it's a completely unsaved local question, just remove it directly
    if (isQuestionEmpty(question) || id >= 1000000000000) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      return;
    }
    setDeleteQuestionId(id);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (id < 1000000000000) {
        const res = await deactivateQuizQuestion(id);
        if (!res.success) throw new Error("Failed to delete question from DB");
      }
      return id;
    },
    onSuccess: (id) => {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setDeleteQuestionId(null);
      toast.success("Question deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["quizQuestions", quizId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete question");
    }
  });

  const confirmDeleteQuestion = () => {
    if (!deleteQuestionId) return;
    deleteMutation.mutate(deleteQuestionId);
  };

  const updateQuestionTitle = (id: number, title: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, title } : q)),
    );
  };

  const updateQuestionType = (id: number, type: Question["type"]) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, type } : q)));
  };

  const updateOptionText = (qId: number, optId: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
            ...q,
            options: q.options.map((o) =>
              o.id === optId ? { ...o, text } : o,
            ),
          }
          : q,
      ),
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
          : q,
      ),
    );
  };

  const addOption = (qId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          if (q.options.length >= 10) return q;
          return {
            ...q,
            options: [
              ...q.options,
              { id: Date.now(), text: "", isCorrect: false },
            ],
          };
        }
        return q;
      }),
    );
  };

  const removeOption = (qId: number, optId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.filter((o) => o.id !== optId),
            }
          : q,
      ),
    );
  };

  const saveMutation = useMutation({
    mutationFn: async (status: "Draft" | "Active") => {
      if (!quizId) throw new Error("Quiz ID not found");

      for (const q of questions) {
        if (!q.title.trim()) throw new Error("All questions must have a title");
        if (q.type === "Multiple Choice") {
          const hasCorrect = q.options.some((o) => o.isCorrect);
          if (!hasCorrect) throw new Error(`Please mark a correct answer for: "${q.title}"`);
        }
        if (q.type === "Fill in the Blanks" && !q.correctAnswer.trim()) {
          throw new Error(`Please enter correct answer for: "${q.title}"`);
        }
      }

      const isComplete = quizDetails && questions.length === quizDetails.maxQuestions;
      const finalStatus = (status === "Active" && isComplete) ? "Active" : "Draft";

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        // Use questionId if it is an existing DB record to safely UPDATE instead of INSERTing duplicate
        const existingQuestionId = typeof q.id === "number" && q.id < 1000000000000 ? q.id : undefined;

        const qResult = await saveQuizQuestion({
          questionId: existingQuestionId,
          quizId,
          questionText: q.title,
          questionType: q.type,
          marks: 1,
          displayOrder: i,
        });

        if (!qResult.success || !qResult.questionId) {
          throw new Error(`Failed to save question: ${q.title}`);
        }

        if (q.type === "Multiple Choice") {
          await saveBulkOptions(
            qResult.questionId,
            q.options.map((o, idx) => ({
              optionText: o.text,
              isCorrect: o.isCorrect,
              displayOrder: idx,
            })),
          );
        } else {
          await saveBulkOptions(qResult.questionId, [
            {
              optionText: q.correctAnswer.trim(),
              isCorrect: true,
              displayOrder: 0,
            },
          ]);
        }
      }

      const statusResult = await updateQuizStatus(quizId, finalStatus);
      if (!statusResult.success) throw new Error("Failed to update status");

      return { finalStatus, isComplete, requestedStatus: status };
    },
    onSuccess: (data) => {
      if (data.requestedStatus === "Active" && !data.isComplete) {
        toast.error(`You need ${quizDetails?.maxQuestions} questions to publish. Saved as Draft.`);
      } else {
        toast.success(data.finalStatus === "Active" ? "Quiz published successfully!" : "Quiz saved as draft!");
      }

      // Aggressively invalidate queries to keep UI perfectly synchronized
      queryClient.invalidateQueries({ queryKey: ["quizQuestions", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizDetails", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizList"] });

      const params = new URLSearchParams();
      params.set("tab", "quiz");
      params.set("quizView", data.finalStatus === "Active" ? "active" : "drafts");
      params.set("refreshQuiz", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      toast.error(error.message || "Something went wrong");
    }
  });

  const handleSave = (status: "Draft" | "Active") => {
    saveMutation.mutate(status);
  };

  const hasMultipleChoice = questions.some((q) => q.type === "Multiple Choice");
  
  const isMutating = saveMutation.isPending || deleteMutation.isPending;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <div className="bg-blue-00 flex items-center lg:mb-1">
          <CaretLeftIcon
            size={22}
            weight="bold"
            className="text-[#282828] cursor-pointer active:scale-90"
            onClick={onBack}
          />
          <h1 className="font-bold text-2xl text-[#282828]">{quizId ? "Edit Quiz Questions" : "Create New Quiz"}</h1>
        </div>
        <p className="text-[#282828] text-sm lg:ml-6">
          Enter details below to set up and publish your quiz for students.
        </p>
      </div>

      <div className="bg-white rounded-md px-4 py-3 mb-3 min-h-[60px] flex items-center justify-between shadow-sm">
        <div className="bg-red-00 flex flex-col items-start">
          <p className="font-bold text-[#282828] text-sm">
            {isQuizLoading ? "Loading..." : (quizDetails?.quizTitle || "Untitled Quiz")}
          </p>
          <p className="text-[#282828] text-xs mt-0.5">
            {isQuizLoading ? "..." : (quizDetails?.topicTitle || "N/A")}
          </p>
        </div>
        <div className="bg-blue-00">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Questions Added</p>
          {quizDetails ? (
            <p className={`text-xl font-bold ${questions.length === quizDetails.maxQuestions ? 'text-[#43C17A]' : 'text-[#16284F]'}`}>
              {questions.length} <span className="text-gray-300 text-sm">/ {quizDetails.maxQuestions}</span>
            </p>
          ) : (
            <p className="text-xl font-bold text-gray-200 animate-pulse">-- / --</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3 gap-4">
        <div className="flex-1">
          {hasMultipleChoice && (
            <div className="inline-block bg-red-50 border border-red-100 px-3 py-1.5 rounded-md">
              <p className="text-red-500 text-xs sm:text-sm font-medium m-0">
                * Note: For multiple choice questions, select the correct answer
                by clicking the radio button.
              </p>
            </div>
          )}
        </div>
        <button
          onClick={addQuestion}
          disabled={!!(quizDetails && questions.length >= quizDetails.maxQuestions)}
          className={`flex items-center gap-2 text-white text-sm font-medium p-2 rounded-md transition-colors shrink-0 whitespace-nowrap ${(quizDetails && questions.length >= quizDetails.maxQuestions)
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#43C17A] hover:bg-[#35a868] cursor-pointer shadow-sm"
            }`}
        >
          <PlusCircleIcon size={20} weight="fill" color="white" />
          Add Question
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto flex-1 pb-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`bg-white rounded-md px-4 py-4 border-2 shadow-sm ${index === 0 ? "border-[#43C17A]" : "border-transparent"
              }`}
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <input
                type="text"
                value={question.title}
                onChange={(e) =>
                  updateQuestionTitle(question.id, e.target.value)
                }
                placeholder="Untitled Question"
                className="flex-1 border-b border-gray-300 pb-1 text-sm font-semibold text-[#282828] outline-none focus:border-[#43C17A] bg-transparent"
              />
              <select
                value={question.type}
                onChange={(e) =>
                  updateQuestionType(
                    question.id,
                    e.target.value as Question["type"],
                  )
                }
                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] bg-white cursor-pointer"
              >
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="Fill in the Blanks">Fill in the Blanks</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 mb-3">
              {question.type === "Multiple Choice" ? (
                question.options.map((option, index) => (
                  <div key={option.id} className="group flex items-center gap-2">
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
                      placeholder={`Option ${index + 1}`}
                      onChange={(e) =>
                        updateOptionText(question.id, option.id, e.target.value)
                      }
                      className="text-sm text-[#282828] outline-none border-b border-transparent focus:border-gray-300 bg-transparent flex-1"
                    />
                    {index > 3 && (
                      <button
                        onClick={() => removeOption(question.id, option.id)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer p-1 transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                        title="Remove Option"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-md px-3 py-2.5 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 text-sm">💡</span>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong>Tip:</strong> Use underscores (e.g.,{" "}
                      <code className="bg-white px-1 py-0.5 rounded text-blue-600 border border-blue-200 shadow-sm font-mono text-[10px]">
                        ___
                      </code>
                      ) in the question title above to indicate where the blank
                      should appear for the student.
                    </p>
                  </div>

                  <div className="bg-[#43C17A]/5 border border-[#43C17A]/20 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#43C17A]"></div>
                    <label className="block text-sm font-semibold text-[#205B3A] mb-2 flex items-center gap-2">
                      Correct Answer
                      <span className="text-[10px] bg-[#43C17A]/20 text-[#205B3A] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        Required
                      </span>
                    </label>
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((q) =>
                            q.id === question.id
                              ? { ...q, correctAnswer: e.target.value }
                              : q,
                          ),
                        )
                      }
                      placeholder="Type the exact text for the blank..."
                      className="w-full bg-white border border-[#43C17A]/40 rounded-md px-3 py-2.5 text-sm text-[#282828] outline-none focus:ring-2 focus:ring-[#43C17A]/30 focus:border-[#43C17A] transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              {question.type === "Multiple Choice" && question.options.length < 10 && (
                <button
                  onClick={() => addOption(question.id)}
                  className="text-[#43C17A] text-sm w-[100px] font-medium cursor-pointer hover:underline"
                >
                  Add Option
                </button>
              )}
              <div className="flex justify-end gap-3 w-full">
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors p-1"
                  title="Delete Question"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {isQuestionsLoading && <div className="text-center py-6 text-gray-500 text-sm animate-pulse">Loading saved questions...</div>}
        
        <div className="flex justify-end gap-3 pt-3 mt-4 border-t border-gray-100">
          <button
            onClick={() => handleSave("Draft")}
            disabled={isMutating}
            className="px-8 py-2.5 rounded-md bg-[#16284F] text-white text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#102040]"
          >
            {saveMutation.isPending && saveMutation.variables === "Draft" ? "Saving..." : "Draft"}
          </button>
          <button
            onClick={() => handleSave("Active")}
            disabled={isMutating}
            className="px-8 py-2.5 rounded-md bg-[#43C17A] text-white text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#35a868]"
          >
            {saveMutation.isPending && saveMutation.variables === "Active" ? "Saving..." : "Save"}
          </button>
        </div>
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
