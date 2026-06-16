"use client";

import { motion } from "framer-motion";
import type { StudentProgressView } from "./types";

export default function StudentProgressTabs({
  activeView,
  onChange,
}: {
  activeView: StudentProgressView;
  onChange: (view: StudentProgressView) => void;
}) {
  const tabs: { id: StudentProgressView; label: string }[] = [
    { id: "progress", label: "Student Progress" },
    { id: "results", label: "Results" },
  ];
  const normalizedView =
    activeView === "result-details" || activeView === "result-preview"
      ? "results"
      : activeView;

  return (
    <div className="mb-5 mt-2 flex w-full justify-center">
      <div className="inline-flex gap-3 rounded-full bg-white/80 p-2 shadow-md">
        {tabs.map((tab) => {
          const isActive = normalizedView === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative z-10 min-w-[150px] cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                isActive ? "text-white" : "text-[#414141]"
              }`}
            >
              {tab.label}
              {isActive ? (
                <motion.div
                  layoutId="student-progress-view-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-[#43C17A] shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              ) : (
                <div className="absolute inset-0 -z-10 rounded-full bg-[#DEDEDE] shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
