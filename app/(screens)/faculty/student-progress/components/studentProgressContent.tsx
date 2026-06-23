"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import StudentProgressOverview from "./studentProgressOverview";
import ResultsManagement from "./resultsManagement";
import ClassResultDetails from "./classResultDetails";
import MemorandumOfGrades from "./memorandumOfGrades";
import UploadResults from "./uploadResults";

export default function StudentProgressContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || "student-progress";
  const currentView = searchParams.get("view") || "";

  const tabs = [
    { id: "student-progress", label: "Student Progress" },
    { id: "results", label: "Results" },
  ];

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams();
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderResultsView = () => {
    switch (currentView) {
      case "details":
        return <ClassResultDetails />;
      case "grades":
        return <MemorandumOfGrades />;
      case "upload":
        return <UploadResults />;
      default:
        return <ResultsManagement />;
    }
  };

  return (
    <main className="p-2 relative overflow-hidden max-w-full min-h-screen flex flex-col">
      <div className="flex justify-center w-full mb-6">
        <div className="bg-white/80 p-2 rounded-full inline-flex gap-2 mx-auto self-center">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative z-10 cursor-pointer w-36 md:w-44 py-2 rounded-full text-xs md:text-sm font-semibold transition-colors flex items-center justify-center ${
                  isActive ? "text-[#E9E9E9]" : "text-[#414141] hover:text-gray-800"
                }`}
              >
                <span className="relative z-20">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="progress-tab-pill"
                    className="absolute inset-0 rounded-full bg-[#43C17A] shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-[#DEDEDE] shadow-sm -z-10" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto">
        {currentTab === "results" ? renderResultsView() : <StudentProgressOverview />}
      </div>
    </main>
  );
}
