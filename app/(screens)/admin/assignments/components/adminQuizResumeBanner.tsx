"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { fetchAdminIncompleteQuizzes } from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";

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

interface AdminQuizResumeBannerProps {
  subjectId?: number;
  margintop?: string;
}

export default function AdminQuizResumeBanner({
  subjectId,
  margintop,
}: AdminQuizResumeBannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [quizzes, setQuizzes] = useState<IncompleteQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    setIsLoading(true);
    fetchAdminIncompleteQuizzes(subjectId)
      .then((data) => setQuizzes(data as IncompleteQuiz[]))
      .catch(() => toast.error("Failed to load incomplete quizzes"))
      .finally(() => setIsLoading(false));
  }, [subjectId]);

  if (isLoading) {
    return (
      <div
        className={`w-full bg-[#FFF8E7] border border-[#F5C842] rounded-md px-4 py-3 mb-4 animate-pulse ${margintop}`}
      >
        <div className="h-4 bg-[#F5C842]/40 rounded w-48 mb-4"></div>
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-md px-4 py-3 flex items-center justify-between border border-gray-100"
            >
              <div className="flex flex-col gap-2 w-1/2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-8 bg-gray-300 rounded-md w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) return null;

  const handleResume = (quizId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("action", "addQuestions");
    params.set("quizId", String(quizId));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className={`w-full bg-[#FFF8E7] border border-[#F5C842] rounded-md px-4 py-3 mb-4 ${margintop}`}
    >
      <p className="text-sm font-bold text-[#282828] mb-3">
        🕐 Continue Leftover Quizzes
      </p>
      <div className="flex flex-col gap-2">
        {quizzes.map((quiz) => (
          <div
            key={quiz.quizId}
            className="bg-white rounded-md px-4 py-3 flex items-center justify-between border border-gray-100"
          >
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-[#282828]">
                {quiz.quizTitle}
              </p>
              <p className="text-xs text-gray-500">
                {quiz.totalMarks} Marks • {formatDate(quiz.startDate)} →{" "}
                {formatDate(quiz.endDate)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${quiz.status === "Draft" ? "bg-gray-100 text-gray-500" : "bg-[#D5FFE7] text-[#43C17A]"}`}
              >
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
