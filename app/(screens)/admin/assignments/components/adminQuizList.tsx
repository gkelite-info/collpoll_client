"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import AdminQuizCard from "./adminQuizCard";
import AdminQuizResumeBanner from "./adminQuizResumeBanner";

import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import toast from "react-hot-toast";
import {
  fetchAdminQuizzesBySubject,
  publishAdminQuiz,
} from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";

export default function AdminQuizList({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const quizView =
    (searchParams.get("quizView") as "active" | "drafts" | "completed") ||
    "active";

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!subjectId) return;
    setIsLoading(true);
    const statusMap = {
      active: "Active",
      drafts: "Draft",
      completed: "Completed",
    } as const;

    fetchAdminQuizzesBySubject(Number(subjectId), statusMap[quizView])
      .then(setQuizzes)
      .finally(() => setIsLoading(false));
  }, [subjectId, quizView, refreshKey]);

  const handleViewChange = (view: "active" | "drafts" | "completed") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("quizView", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("subjectId");
    params.delete("quizView");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAction = (action: string, id?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("action", action);
    if (id) params.set("quizId", String(id));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePublish = async (quizId: number) => {
    try {
      await publishAdminQuiz(quizId);
      toast.success("Quiz published successfully! 🎉");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to publish the quiz.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col mx-auto">
      <div className="flex items-center gap-2 mb-6 hover:text-gray-600 transition-colors"      >
        <CaretLeft size={24} weight="bold" className="text-[#282828] cursor-pointer" onClick={handleBack} />
        <h1 className="font-bold text-2xl text-[#282828]">
          Quizzes for Subject
        </h1>
      </div>

      <div className="flex justify-between items-center w-full mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.4fr_0.8fr] w-full gap-3 mt-1 items-center">
          <button
            onClick={() => handleViewChange("active")}
            className={`px-6 py-2 cursor-pointer rounded-md font-bold text-sm transition-colors ${quizView === "active" ? "bg-[#43C17A] text-white" : "bg-[#D5FFE7] text-[#43C17A]"}`}
          >
            Active Quizzes
          </button>
          <button
            onClick={() => handleViewChange("drafts")}
            className={`px-8 py-2 cursor-pointer rounded-md font-bold text-sm transition-colors ${quizView === "drafts" ? "bg-[#43C17A] text-white" : "bg-[#D5FFE7] text-[#43C17A]"}`}
          >
            Drafts
          </button>
          <button
            onClick={() => handleViewChange("completed")}
            className={`px-8 py-2 cursor-pointer rounded-md font-bold text-sm transition-colors ${quizView === "completed" ? "bg-[#43C17A] text-white" : "bg-[#D5FFE7] text-[#43C17A]"}`}
          >
            Completed Quizzes
          </button>

          <button
            className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-2 rounded-md font-bold hover:bg-[#102040] transition-colors"
            onClick={() => handleAction("createQuiz")}
          >
            Create Quiz
          </button>
        </div>
      </div>

      <AdminQuizResumeBanner subjectId={Number(subjectId)} margintop="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
        {isLoading ? (
          <div className="col-span-2 flex justify-center py-10">
            <Loader />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-gray-500">
            No {quizView} quizzes found.
          </div>
        ) : (
          quizzes.map((quiz, index) => (
            <AdminQuizCard
              key={quiz.id || quiz.quizId || `quiz-${index}`}
              data={quiz}
              quizView={quizView}
              onViewSubmissions={(id) =>
                handleAction("viewQuizSubmissions", id as number)
              }
              onEdit={(id) => handleAction("editQuiz", id as number)}
              onPublish={handlePublish}
            />
          ))
        )}
      </div>
    </div>
  );
}
