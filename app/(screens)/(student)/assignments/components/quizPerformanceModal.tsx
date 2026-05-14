"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Question, X } from "@phosphor-icons/react";
import { AttemptedQuizCard } from "./quizCard";
import { useTranslations } from "next-intl";

export default function QuizPerformanceModal({ quiz }: { quiz: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Assignment.student");

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[850px] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            {t("Performance Summary")}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="pointer-events-none mb-6">
            <AttemptedQuizCard data={quiz} />
          </div>

          <div className="flex flex-col items-center relative">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <img
                src="result-circle.png"
                alt="result-circle"
                className="w-full h-full object-contain"
              />

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold font-black bg-gradient-to-b from-[#DDCC18] to-[#713F06] bg-clip-text text-transparent tracking-tight leading-none">
                  {quiz.score}
                </span>
                <span className="text-sm font-bold text-[#16284F] mt-0.5">
                  {quiz.percentage}%
                </span>
                <span className="text-xs font-semibold text-gray-500 mt-1">
                  {t("Quiz Score")}
                </span>
              </div>
            </div>

            <div className="text-center mt-6 mb-8 px-4">
              <h3 className="text-lg md:text-xl font-bold text-[#282828] leading-tight">
                {t("Good job! you performed well in this quiz")}
              </h3>
              <p className="text-[13px] md:text-sm text-gray-600 mt-1.5 font-medium">
                {t("you answered {percent}% of question correctly", {
                  percent: quiz.percentage,
                })}
              </p>
            </div>

            {/* 📱 Mobile: 2 Columns | 🖥️ Desktop: 4 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
              <div className="bg-[#f0fcf5] p-3 rounded-xl flex flex-col items-center justify-center border border-[#d1f4e0] shadow-sm">
                <div className="flex items-center gap-1 text-[#43C17A] text-[11px] md:text-xs font-bold mb-1 whitespace-nowrap">
                  <CheckCircle weight="fill" size={14} /> {t("Correct Answers")}
                </div>
                <span className="text-lg font-bold text-[#282828]">
                  {quiz.correct.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="bg-[#fff1f0] p-3 rounded-xl flex flex-col items-center justify-center border border-[#fce8e6] shadow-sm">
                <div className="flex items-center gap-1 text-[#FF3B30] text-[11px] md:text-xs font-bold mb-1 whitespace-nowrap">
                  <XCircle weight="fill" size={14} /> {t("Wrong Answers")}
                </div>
                <span className="text-lg font-bold text-[#282828]">
                  {quiz.wrong.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="bg-[#f4f6f8] p-3 rounded-xl flex flex-col items-center justify-center border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 text-[#6b7280] text-[11px] md:text-xs font-bold mb-1 whitespace-nowrap">
                  <Question weight="regular" size={14} /> {t("Unanswered")}
                </div>
                <span className="text-lg font-bold text-[#282828]">
                  {quiz.unanswered.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="bg-[#f0fcf5] p-3 rounded-xl flex flex-col items-center justify-center border border-[#d1f4e0] shadow-sm">
                <div className="flex items-center gap-1 text-[#43C17A] text-[11px] md:text-xs font-bold mb-1 whitespace-nowrap">
                  <Question weight="regular" size={14} /> {t("Total Questions")}
                </div>
                <span className="text-lg font-bold text-[#282828]">
                  {quiz.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 bg-gray-50/50 rounded-b-2xl">
          <button
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
            onClick={handleClose}
          >
            {t("Close")}
          </button>

          {quiz.allAttemptsUsed && (
            <button
              onClick={handleViewAnswers}
              className="w-full sm:w-auto bg-[#16284F] text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#16284fe1] transition-colors cursor-pointer"
            >
              {t("View Answers")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
