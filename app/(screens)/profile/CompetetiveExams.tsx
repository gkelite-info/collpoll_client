"use client";

import { useState } from "react";

const EXAMS = ["GMAT", "TOEL", "GRE", "SAT", "IELTS"];

export default function CompetetiveExams() {
  const [selectedExams, setSelectedExams] = useState<string[]>(["GMAT"]);
  const [score, setScore] = useState("");

  const toggleExam = (exam: string) => {
    setSelectedExams((prev) =>
      prev.includes(exam)
        ? prev.filter((e) => e !== exam)
        : [...prev, exam]
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full min-h-[80vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1F2937]">
          Competitive Exams
        </h2>

        <button className="bg-[#22C55E] cursor-pointer text-white text-sm font-medium px-4 py-1.5 rounded-md">
          Next
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <p className="text-sm font-medium text-[#374151] mb-3 text-center">
          Select Exam
        </p>

        <div className="space-y-3">
          {EXAMS.map((exam) => {
            const checked = selectedExams.includes(exam);

            return (
              <div
                key={exam}
                onClick={() => toggleExam(exam)}
                className={`flex items-center gap-3 border rounded-md px-3 h-11 cursor-pointer border-[#cccccc]`}
              >
                <div
                  className={`w-5 h-5 rounded-sm border flex items-center justify-center
                    ${
                      checked
                        ? "bg-[#22C55E] border-[#22C55E]"
                        : "border-[#9CA3AF]"
                    }`}
                >
                  {checked && (
                    <svg
                      width="12"
                      height="10"
                      viewBox="0 0 12 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5L4.5 8.5L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <span className="text-sm text-[#1F2937]">
                  {exam}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-[#374151] mb-2">
            Score
          </label>
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Eg : 8.5"
            className="w-full h-11 px-3 border border-[#D1D5DB] rounded-md text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
