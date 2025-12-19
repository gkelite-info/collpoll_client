"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const EXAMS = ["GMAT", "TOEL", "GRE", "SAT", "IELTS"];

export default function CompetetiveExams() {
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const router = useRouter()

  const toggleExam = (exam: string) => {
    setSelectedExams((prev) => {
      if (prev.includes(exam)) {
        const updated = prev.filter((e) => e !== exam);

        setScores((s) => {
          const copy = { ...s };
          delete copy[exam];
          return copy;
        });

        return updated;
      } else {
        setScores((s) => ({ ...s, [exam]: "" }));
        return [...prev, exam];
      }
    });
  };

  const handleScoreChange = (exam: string, value: string) => {
    setScores((prev) => ({
      ...prev,
      [exam]: value,
    }));
  };

  const handleSubmit = () => {
    const payload = selectedExams.map((exam) => ({
      exam,
      score: scores[exam],
    }));
    toast.success("Competitive Exams Submitted Successfully");
    console.log("Submitted Data:", payload);
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full min-h-[80vh] mb-5 mt-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-[#282828]">
          Competitive Exams
        </h2>

        <button
        onClick={()=>router.push('/profile?employment')}
         className="bg-[#43C17A] cursor-pointer text-white text-sm font-medium px-4 py-1.5 rounded-md">
          Next
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <p className="text-sm font-medium text-[#282828] mb-3">
          Select Exam
        </p>

        <div className="space-y-3">
          {EXAMS.map((exam) => {
            const checked = selectedExams.includes(exam);

            return (
              <div key={exam}>
                <div
                  onClick={() => toggleExam(exam)}
                  className="flex items-center gap-3 border rounded-md px-3 h-11 cursor-pointer border-[#cccccc]"
                >
                  <div
                    className={`w-5 h-5 rounded-sm border flex items-center justify-center
                      ${checked
                        ? "bg-[#22C55E] border-[#22C55E]"
                        : "border-[#CCCCCC]"
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

                  <span className="text-sm text-[#525252]">{exam}</span>
                </div>

                {checked && (
                  <div className="mt-0 w-1/2 mb-8 flex flex-col ">
                    <label className="block text-sm font-medium text-[#282828] mb-1">
                      Score
                    </label>
                    <input
                      value={scores[exam] || ""}
                      type="number"
                      onChange={(e) =>
                        handleScoreChange(exam, e.target.value)
                      }
                      placeholder="Eg : 8.5"
                      className="w-full text-[#525252] h-11 px-3 border border-[#CCCCCC] rounded-md text-sm focus:outline-none
                       [appearance:textfield] 
                       [&::-webkit-outer-spin-button]:appearance-none 
                       [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#43C17A] text-white text-sm font-medium h-11 rounded-md cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
