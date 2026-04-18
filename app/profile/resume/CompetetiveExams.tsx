"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { CompetitiveExamPayload, getCompetitiveExams, softDeleteExam, upsertCompetitiveExams } from "@/lib/helpers/student/Resume/Resumecompetitiveexamsapi";
import { fetchResumePersonalDetails } from "@/lib/helpers/student/Resume/Resumepersonaldetailsapi";

const DEFAULT_EXAMS = ["GMAT", "TOEL", "GRE", "SAT", "IELTS"];

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

// ─── Shimmer ──────────────────────────────────────────────────────────────────

function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

function ExamsShimmer() {
  return (
    <div className="max-w-md mx-auto space-y-3">
      {[...Array(5)].map((_, i) => (
        <ShimmerBlock key={i} className="h-11 w-full" />
      ))}
      <ShimmerBlock className="h-11 w-full mt-8" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CompetetiveExams() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableExams, setAvailableExams] = useState<string[]>(DEFAULT_EXAMS);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [initialExams, setInitialExams] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherExamName, setOtherExamName] = useState("");

  const router = useRouter();
  const { studentId } = useUser();

  const validateScore = (exam: string, value?: string) => {
    if (!value) return "Score is required";
    const num = Number(value);
    if (Number.isNaN(num)) return "Score must be a number";

    const rule = EXAM_RULES[exam] || { min: 0, max: 1000, decimals: 2 };

    if (num < rule.min || num > rule.max) {
      return `Must be between ${rule.min} and ${rule.max}`;
    }

    const decimals = value.includes(".")
      ? value.split(".")[1]?.length || 0
      : 0;

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

  // ✅ UPDATED handleNext (Save + Navigate, NO validation block)

  const handleNext = async () => {
    setIsSubmitting(true);

    try {
      const payload: CompetitiveExamPayload[] = selectedExams.map((exam) => ({
        studentId: studentId!,
        examName: exam,
        score: scores[exam] ? Number(scores[exam]) : 0,
      }));

      const removedExams = initialExams.filter((e) => !selectedExams.includes(e));

      await Promise.all([
        upsertCompetitiveExams(payload),
        ...removedExams.map((exam) => softDeleteExam(studentId!, exam)),
      ]);

      setInitialExams(selectedExams);
      toast.success("Competitive Exams saved successfully"); // ✅ ADD THIS

      const res = await fetchResumePersonalDetails(studentId!);
      const workStatus = res?.data?.workStatus?.toLowerCase();

      if (workStatus === "fresher") {
        router.push("/profile?resume=academic-achievements&Step=10");
      } else {
        router.push("/profile?resume=employment&Step=10");
      }

    } catch (error: any) {
      toast.error(error?.message || "Failed to submit exams.");
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOther = () => {
    const name = otherExamName.trim();
    if (!name) {
      toast.error("Enter exam name");
      return;
    }

    if (!availableExams.includes(name)) {
      setAvailableExams((prev) => [...prev, name]);
    }

    if (!selectedExams.includes(name)) {
      setSelectedExams((prev) => [...prev, name]);
    }

    setOtherExamName("");
    setShowOtherInput(false);
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
      // ✅ Clean — helper handles timestamps & is_deleted
      const payload: CompetitiveExamPayload[] = selectedExams.map((exam) => ({
        studentId: studentId!,
        examName: exam,
        score: Number(scores[exam]),
      }));

      const removedExams = initialExams.filter((e) => !selectedExams.includes(e));

      await Promise.all([
        upsertCompetitiveExams(payload),
        ...removedExams.map((exam) => softDeleteExam(studentId!, exam)),
      ]);

      setInitialExams(selectedExams);
      toast.success("Competitive Exams Submitted Successfully");
      setTimeout(() => handleNext(), 500);

    } catch (error: any) {
      toast.error(error?.message || "Failed to submit exams.");
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;

    const loadExistingExams = async () => {
      setLoading(true);
      try {
        const data = await getCompetitiveExams(studentId);

        if (data && data.length > 0) {
          const initialNames = data.map((e: any) => e.examName);

          const initialScores: Record<string, string> = {};
          data.forEach((e: any) => {
            if (e.examName) {
              initialScores[e.examName] = e.score.toString();
            }
          });

          setAvailableExams(prev => {
            const combined = [...prev, ...initialNames];
            return Array.from(new Set(combined));
          });

          setSelectedExams(initialNames);
          setInitialExams(initialNames);
          setScores(initialScores);
        }
      } catch (err) {
        console.error("Error loading exams:", err);
        toast.error("Failed to load competitive exams");
      } finally {
        setLoading(false);
      }
    };

    loadExistingExams();
  }, [studentId]);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="bg-white rounded-xl p-6 w-full min-h-[80vh] mb-5 mt-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-[#282828]">
            Competitive Exams
          </h2>
        </div>

        {loading ? (
          <ExamsShimmer />
        ) : <>
          <div className="max-w-md mx-auto">
            <p className="text-sm font-medium text-[#282828] mb-3">
              Select Exam
            </p>

            <div className="space-y-3">
              {availableExams.map((exam) => {
                const checked = selectedExams.includes(exam);
                const hasError = !!errors[exam];

                return (
                  <div key={exam}>
                    <div
                      onClick={() => toggleExam(exam)}
                      className="flex items-center gap-3 border rounded-md px-3 h-11 cursor-pointer border-[#cccccc]"
                    >
                      <div
                        className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors
                          ${checked
                            ? "bg-[#22C55E] border-[#22C55E]"
                            : "border-[#CCCCCC]"
                          }`}
                      >
                        {checked && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-[#525252]">{exam}</span>
                    </div>

                    {checked && (
                      <div className="mt-2 w-1/2 mb-4 flex flex-col">
                        <input
                          placeholder="Enter Score"
                          value={scores[exam] || ""}
                          onChange={(e) =>
                            handleScoreChange(exam, e.target.value)
                          }
                          // Added placeholder color and text color
                          className="border h-11 px-3 rounded-md text-[#282828] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#43C17A]"
                        />
                        {hasError && <p className="text-xs text-red-500 mt-1">{errors[exam]}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              {!showOtherInput ? (
                <button
                  onClick={() => setShowOtherInput(true)}
                  className="flex items-center gap-2 w-full h-11 px-3 border rounded-md border-[#CCCCCC] text-[#525252] cursor-pointer hover:bg-gray-50 transition"
                >
                  <span className="text-lg">+</span> Other
                </button>
              ) : (
                <div className="flex gap-3 mt-2 items-center">
                  <input
                    placeholder="Enter exam name"
                    autoFocus
                    value={otherExamName}
                    onChange={(e) => setOtherExamName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOther()}
                    className="flex-1 border h-11 px-3 rounded-md border-[#CCCCCC] text-[#282828] focus:outline-none focus:ring-1 focus:ring-[#CCCCCC]"
                  />

                  <button
                    onClick={handleAddOther}
                    className="bg-green-500 text-white px-4 rounded-md cursor-pointer h-11 font-medium hover:bg-[#16A34A] transition"
                  >
                    Add
                  </button>

                  <button
                    onClick={() => {
                      setShowOtherInput(false);
                      setOtherExamName("");
                    }}
                    className="border px-4 rounded-md cursor-pointer h-11 border-[#CCCCCC] text-[#525252] hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#43C17A] text-white h-11 px-6 rounded-md cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>


            <button
              onClick={handleNext}
              className="bg-[#43C17A] cursor-pointer text-white text-sm font-medium px-6 py-2 rounded-md"
            >
              {isSubmitting ? "Saving..." : "Next"}
            </button>
          </div>
        </>
        }
      </div>
    </>
  );
}