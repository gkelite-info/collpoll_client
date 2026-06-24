"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import ViewCollegeTimings from "./ViewCollegeTimings";
import AddCollegeTimings from "./AddCollegeTimings";

type ActionTab = "view" | "add";

export default function CollegeTimingsStructure() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryAction = searchParams.get("action") as ActionTab | null;
  const activeTab = queryAction || "view";

  const setActiveTab = (action: ActionTab) => {
    const params = new URLSearchParams(searchParams);
    params.set("action", action);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    { id: "view", label: "View College Timings" },
    { id: "add", label: "Add College Timings" },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1.5 rounded-full max-w-full flex">
          <div className="relative flex items-center overflow-x-auto custom-scrollbar px-1 pb-0.5 rounded-full w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActionTab)}
              className={`relative cursor-pointer px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold z-10 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="college-timings-pill"
                  className="absolute shadow-[0_2px_8px_rgba(16,185,129,0.4)] inset-0 rounded-full -z-10"
                  style={{
                    background: "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        {activeTab === "view" && <ViewCollegeTimings />}
        {activeTab === "add" && <AddCollegeTimings />}
      </div>
    </div>
  );
}
