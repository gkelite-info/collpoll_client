'use client';
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function TabNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "assignments";
  const { collegeEducationType } = useAdmin();

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("action");
    params.delete("discussionId");
    params.delete("dept");
    params.delete("year");
    params.delete("subjectId");
    params.delete("discussionView");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex justify-between items-center">
      <div>
        <h1 className="font-bold text-2xl mb-1 flex items-center gap-2">
          <span
            onClick={() => handleTabChange("assignments")}
            className={`cursor-pointer transition-colors ${activeTab === "assignments"
              ? "text-[#43C17A]"
              : "text-[#282828]"
              }`}
          >
            Assignments
          </span>
          <span className="text-[#282828]">/</span>
          <span
            onClick={() => handleTabChange("quiz")}
            className={`cursor-pointer transition-colors ${activeTab === "quiz"
              ? "text-[#43C17A]"
              : "text-[#282828]"
              }`}
          >
            Quiz
          </span>
          <span className="text-[#282828]">/</span>
          <span
            onClick={() => handleTabChange("discussion")}
            className={`cursor-pointer transition-colors ${activeTab === "discussion"
              ? "text-[#43C17A]"
              : "text-[#282828]"
              }`}
          >
            Discussion forum
          </span>
        </h1>
        <p className="text-[#282828] text-sm">
          {activeTab === "assignments" && "Track subjects, faculty who created assignments, raised issues, and submission progress."}
          {activeTab === "quiz" && "Monitor and manage quizzes across all departments."}
          {activeTab === "discussion" && `Manage project discussions and forums across all ${!(collegeEducationType === "Inter") ? "branches." : "groups."}`}
        </p>
      </div>
      <div className="w-[320px]">
        <CourseScheduleCard isVisibile={false} />
      </div>
    </div>
  );
}
