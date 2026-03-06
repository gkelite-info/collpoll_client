"use client";

import {
  getCompetitiveExam,
  upsertCompetitiveExams,
  softDeleteExam,
} from "@/lib/helpers/profile/competitiveExamAPI";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EXAMS = ["GMAT", "TOEL", "GRE", "SAT", "IELTS"];

const EXAM_RULES: Record<
  string,
  { min: number; max: number; decimals: number }
> = {
  GMAT: { min: 200, max: 800, decimals: 0 },
  GRE: { min: 260, max: 340, decimals: 0 },
  SAT: { min: 400, max: 1600, decimals: 0 },
  TOEL: { min: 0, max: 10, decimals: 1 },
  IELTS: { min: 0, max: 9, decimals: 1 },
};

export default function CompetetiveExams() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [initialExams, setInitialExams] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const studentId = 1;

  const validateScore = (exam: string, value?: string) => {
    if (!value) return "Score is required";
    const num = Number(value);
    if (Number.isNaN(num)) return "Score must be a number";
    const rule = EXAM_RULES[exam];
    if (num < rule.min || num > rule.max) {
      return `Must be between ${rule.min} and ${rule.max}`;
    }
    const decimals = value.includes(".") ? value.split(".")[1]?.length || 0 : 0;
    if (decimals > rule.decimals) {
      return `Max ${rule.decimals} decimal(s) allowed`;
    }
    return "";
  };

  const toggleExam = (exam: string) => {
    setSelectedExams((prev) => {
      if (prev.includes(exam)) {
        const updated = prev.filter((e) => e !== exam);
        setScores((s) => {
          const copy = { ...s };
          delete copy[exam];
          return copy;
        });
        setErrors((e) => {
          const copy = { ...e };
          delete copy[exam];
          return copy;
        });
        return updated;
      } else {
        return [...prev, exam];
      }
    });
  };

  const handleScoreChange = (exam: string, value: string) => {
    setScores((prev) => ({ ...prev, [exam]: value }));
    const error = validateScore(exam, value);
    setErrors((prev) => ({ ...prev, [exam]: error }));
  };

  const handleNext = () => {
    router.push("/profile?employment");
  };

  const handleSubmit = async () => {
    const validationErrors: Record<string, string> = {};
    selectedExams.forEach((exam) => {
      const err = validateScore(exam, scores[exam]);
      if (err) validationErrors[exam] = err;
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    if (selectedExams.length === 0) {
      toast.error("Please select at least one exam.");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();

      const payload = selectedExams.map((exam) => ({
        studentId: studentId,
        examName: exam,
        score: Number(scores[exam]),
        isDeleted: false,
        createdAt: now, // Added fix
        updatedAt: now, // Added fix
      }));

      const removedExams = initialExams.filter(
        (e) => !selectedExams.includes(e)
      );

      await Promise.all([
        upsertCompetitiveExams(payload),
        ...removedExams.map((exam) => softDeleteExam(studentId, exam)),
      ]);

      setInitialExams(selectedExams);
      toast.success("Competitive Exams Submitted Successfully");
      setTimeout(() => {
        handleNext();
      }, 500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit exams.");
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadExistingExams = async () => {
      try {
        const data = await getCompetitiveExam(studentId);
        if (data && data.length > 0) {
          const initialNames = data.map((e: any) => e.examName);
          const initialScores: Record<string, string> = {};

          data.forEach((e: any) => {
            if (e.examName) {
              initialScores[e.examName] = e.score.toString();
            }
          });

          setSelectedExams(initialNames);
          setInitialExams(initialNames);
          setScores(initialScores);
        }
      } catch (err) {
        console.error("Error loading exams:", err);
      }
    };
    loadExistingExams();
  }, [studentId]);

  return (
    <div className="bg-white rounded-xl p-6 w-full min-h-[80vh] mb-5 mt-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-[#282828]">
          Competitive Exams
        </h2>
        <button
          onClick={handleNext}
          className="bg-[#43C17A] cursor-pointer text-white text-sm font-medium px-4 py-1.5 rounded-md"
        >
          Next
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <p className="text-sm font-medium text-[#282828] mb-3">Select Exam</p>
        <div className="space-y-3">
          {EXAMS.map((exam) => {
            const checked = selectedExams.includes(exam);
            const hasError = !!errors[exam];

            return (
              <div key={exam}>
                <div
                  onClick={() => toggleExam(exam)}
                  className="flex items-center gap-3 border rounded-md px-3 h-11 cursor-pointer border-[#cccccc]"
                >
                  <div
                    className={`w-5 h-5 rounded-sm border flex items-center justify-center
                      ${
                        checked
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
                  <div className="mt-2 w-1/2 mb-4 flex flex-col">
                    <label className="block text-sm font-medium text-[#282828] mb-1">
                      Score
                    </label>
                    <input
                      value={scores[exam] || ""}
                      type="number"
                      step="0.1"
                      onChange={(e) => handleScoreChange(exam, e.target.value)}
                      placeholder="Eg : 8.5"
                      className={`w-full text-[#525252] h-11 px-3 border rounded-md text-sm focus:outline-none ${
                        hasError ? "border-red-500" : "border-[#CCCCCC]"
                      }`}
                    />
                    {hasError && (
                      <p className="text-[10px] text-red-500 mt-1 font-medium">
                        {errors[exam]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#43C17A] text-white text-sm font-medium h-11 rounded-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
