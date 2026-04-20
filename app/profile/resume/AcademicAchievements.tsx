"use client";

import {
  getAcademicAchievements,
  softDeleteAcademicAchievement,
  upsertAcademicAchievements,
} from "@/lib/helpers/student/Resume/academicAchievementsAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { fetchResumePersonalDetails } from "@/lib/helpers/student/Resume/Resumepersonaldetailsapi";

const DEFAULT_ACHIEVEMENTS = [
  "College Topper",
  "Department Topper",
  "Top in Class",
  "Top 10 in Class",
  "Gold Medalist",
  "Received Scholarship",
  "All Rounder",
];

// ── Shimmer ───────────────────────────────────────────────────────────────────

function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

function AchievementsShimmer() {
  return (
    <div className="max-w-lg mx-auto space-y-3">
      {[...Array(7)].map((_, i) => (
        <ShimmerBlock key={i} className="h-11 w-full" />
      ))}
      <ShimmerBlock className="h-11 w-full mt-4" />
      <ShimmerBlock className="h-11 w-full mt-8" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AcademicAchievements() {
  const { studentId } = useUser();
  const router = useRouter();

  const [achievements, setAchievements] = useState<string[]>(DEFAULT_ACHIEVEMENTS);
  const [selected, setSelected] = useState<string[]>([]);
  const [initialSelected, setInitialSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);

  const showSuccessToast = (message: string) =>
    toast.success(message, { duration: 3000 });

  const waitForToast = () =>
    new Promise((resolve) => setTimeout(resolve, 700));

  useEffect(() => {
    if (!studentId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getAcademicAchievements(studentId);
        if (data && data.length > 0) {
          const existingNames = data.map((item: any) => item.achievementName);
          setAchievements((prev) => {
            const combined = [...prev, ...existingNames];
            return Array.from(new Set(combined));
          });
          setSelected(existingNames);
          setInitialSelected(existingNames);
        }
      } catch (error) {
        toast.error("Failed to load achievements.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [studentId]);

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addOtherAchievement = () => {
    const value = otherValue.trim();
    if (!value) {
      toast.error("Please enter an achievement before adding.");
      return;
    }
    if (!achievements.includes(value)) {
      setAchievements((prev) => [...prev, value]);
    }
    if (!selected.includes(value)) {
      setSelected((prev) => [...prev, value]);
    }
    setOtherValue("");
    setShowOtherInput(false);
  };

  // ── Shared save logic ───────────────────────────────────────────────────────

  const saveAchievements = async (): Promise<boolean> => {
    if (!studentId) {
      toast.error("Session expired. Please refresh.");
      return false;
    }

    const payload = selected.map((name) => ({
      studentId: studentId!,
      achievementName: name,
    }));

    const removed = initialSelected.filter((name) => !selected.includes(name));

    await Promise.all([
      upsertAcademicAchievements(payload),
      ...removed.map((name) => softDeleteAcademicAchievement(studentId!, name)),
    ]);

    setInitialSelected(selected);
    return true;
  };

  const getSuccessMessage = () => {
    const hadExistingAchievements = initialSelected.length > 0;
    const hasChanges =
      selected.length !== initialSelected.length ||
      selected.some((achievement) => !initialSelected.includes(achievement));

    if (hadExistingAchievements && hasChanges) {
      return "Academic achievements updated successfully.";
    }

    return "Academic achievements saved successfully.";
  };

  // ── Save handler ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await saveAchievements();
      if (!success) return;
      showSuccessToast(getSuccessMessage());
    } catch (error: any) {
      toast.error(error.message || "Failed to save achievements.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Next handler ────────────────────────────────────────────────────────────

  const handleNext = async () => {
    setIsNextLoading(true);
    try {
      const success = await saveAchievements();
      if (!success) return;
      showSuccessToast(getSuccessMessage());
      await waitForToast();
      const res = await fetchResumePersonalDetails(studentId!);
      const workStatus = res?.data?.workStatus?.toLowerCase();
      // router.push("/profile?resume=profile-summary&Step=11");
      if (workStatus === "fresher") {
        router.push("/profile?resume=profile-summary&Step=10");
      } else {
        router.push("/profile?resume=profile-summary&Step=11");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save achievements.");
    } finally {
      setIsNextLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="bg-white rounded-xl p-6 w-full min-h-[80vh] mt-2 mb-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-[#282828]">
            Academic Achievements
          </h2>
        </div>

        {loading ? (
          <AchievementsShimmer />
        ) : (
          <div className="max-w-lg mx-auto">
            <p className="text-sm font-medium text-[#282828] mb-4">
              Received During Academics
            </p>

            <div className="space-y-3">
              {achievements.map((item) => {
                const checked = selected.includes(item);
                return (
                  <div
                    key={item}
                    onClick={() => toggle(item)}
                    className="flex items-center gap-3 h-11 px-3 border border-[#D9D9D9] rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors
                        ${checked ? "bg-[#22C55E] border-[#22C55E]" : "border-[#CCCCCC]"}`}
                    >
                      {checked && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
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
                    <span className="text-sm text-[#525252]">{item}</span>
                  </div>
                );
              })}

              {!showOtherInput ? (
                <div
                  onClick={() => setShowOtherInput(true)}
                  className="flex items-center gap-3 h-11 px-3 border border-[#D9D9D9] rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <span className="text-lg text-[#4F4F4F]">+</span>
                  <span className="text-sm text-[#4F4F4F]">Other</span>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    autoFocus
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addOtherAchievement()}
                    placeholder="Enter achievement"
                    className="flex-1 h-11 px-3 border border-[#D9D9D9] rounded-md text-sm text-[#525252] focus:outline-none focus:border-[#43C17A]"
                  />
                  <button
                    onClick={addOtherAchievement}
                    className="px-4 h-11 cursor-pointer bg-[#43C17A] text-white text-sm font-medium rounded-md hover:bg-[#16A34A] transition"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowOtherInput(false); setOtherValue(""); }}
                    className="px-4 h-11 border border-[#CCCCCC] text-[#525252] text-sm font-medium rounded-md cursor-pointer hover:bg-[#F5F5F5] transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Save + Next buttons */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isNextLoading}
                className={`px-6 py-2 rounded-md text-sm font-medium text-white min-w-[90px] ${isSubmitting || isNextLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
                  }`}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleNext}
                disabled={isSubmitting || isNextLoading}
                className={`px-6 py-2 rounded-md text-sm font-medium text-white min-w-[90px] ${isSubmitting || isNextLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
                  }`}
              >
                {isNextLoading ? "Saving..." : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
