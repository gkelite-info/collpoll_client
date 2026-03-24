"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import AdminQuizCard, {
    STATIC_ACTIVE_QUIZZES,
    STATIC_DRAFT_QUIZZES,
    STATIC_COMPLETED_QUIZZES
} from "./adminQuizCard";
import AdminQuizResumeBanner from "./adminQuizResumeBanner";

export default function AdminQuizList({ subjectId }: { subjectId: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const quizView = searchParams.get("quizView") || "active";

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

    const handleCreate = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "createQuiz");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleEdit = (quizId: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "editQuiz");
        params.set("quizId", String(quizId));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleViewSubmissions = (quizId: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "viewQuizSubmissions");
        params.set("quizId", String(quizId));
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-full h-full flex flex-col mx-auto">
            <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-gray-600 transition-colors" onClick={handleBack}>
                <CaretLeft size={24} weight="bold" className="text-[#282828]" />
                <h1 className="font-bold text-2xl text-[#282828]">Quizzes for Subject</h1>
            </div>

            <AdminQuizResumeBanner margintop="mb-6" />

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
                        onClick={handleCreate}
                    >
                        Create Quiz
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                {quizView === "active" && STATIC_ACTIVE_QUIZZES.map((quiz) => (
                    <AdminQuizCard key={quiz.id} data={quiz} quizView="active" onViewSubmissions={handleViewSubmissions} />
                ))}
                {quizView === "drafts" && STATIC_DRAFT_QUIZZES.map((quiz) => (
                    <AdminQuizCard key={quiz.id} data={quiz} quizView="drafts" onEdit={handleEdit} />
                ))}
                {quizView === "completed" && STATIC_COMPLETED_QUIZZES.map((quiz) => (
                    <AdminQuizCard key={quiz.id} data={quiz} quizView="completed" onViewSubmissions={handleViewSubmissions} />
                ))}
            </div>
        </div>
    );
}