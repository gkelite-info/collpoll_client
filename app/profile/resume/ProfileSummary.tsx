"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getProfileSummary,
  insertProfileSummary,
  updateProfileSummary,
} from "@/lib/helpers/student/Resume/profileSummaryAPI";
import ProfileSummaryShimmer from "../shimmers/ProfileSummaryShimmer";
import { generateProfileSummaryAction } from "@/lib/helpers/student/ai/profileSummaryAction";

export default function ProfileSummary() {
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resumeSummaryId, setResumeSummaryId] = useState<number | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  const { studentId } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);

    getProfileSummary(studentId)
      .then((data) => {
        if (data?.summary) {
          setDescription(data.summary);
          setResumeSummaryId(data.resumeSummaryId);
        }
      })
      .catch(() => toast.error("Failed to load summary."))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleNext = () => {
    router.push("/profile?resume=accomplishments&Step=8");
  };

  const handleSubmit = async () => {
    if (!studentId) return;

    const trimmed = description.trim();
    if (!trimmed) {
      toast.error("Please write a summary before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (resumeSummaryId) {
        await updateProfileSummary(studentId, trimmed);
      } else {
        const result = await insertProfileSummary(studentId, trimmed);
        setResumeSummaryId(result.resumeSummaryId);
      }
      toast.success("Profile Summary Saved Successfully");
    } catch (error) {
      toast.error("Failed to submit summary. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!studentId) return;

    setIsGenerating(true);

    try {
      const summary = await generateProfileSummaryAction(studentId);

      if (summary) {
        setDescription(summary); // ✅ ONLY SET (toast removed)
      } else {
        toast.error("Failed to generate summary");
      }
    } catch (err) {
      toast.error("AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <ProfileSummaryShimmer />;

  return (
    <div className="min-h-[58vh] bg-gray-100 flex justify-center rounded-xl mt-2 mb-5">
      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-[#282828]">
            Profile Summary
          </h2>
          <button
            onClick={handleNext}
            className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Next
          </button>
        </div>

        <div>
          <h3 className="text-base font-medium text-[#282828] mb-1">
            Write Your Professional Summary
          </h3>

          {/* AI BUTTON */}
          <div className="flex justify-end mb-2">
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
                isGenerating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate with AI"}
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={10}
              required
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A passionate Computer Science student with a strong interest in software development and problem-solving. Eager to apply technical skills to real-world projects and grow as a developer."
              className="w-full border border-[#CCCCCC] rounded-lg p-4 text-sm text-[#525252] focus:outline-none resize-none"
            />
            <span className="absolute bottom-3 right-4 text-xs text-gray-400">
              {description.length}/1000
            </span>
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`bg-[#43C17A] text-white px-5 py-1.5 rounded-md text-sm font-medium transition-all ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-[#3bad6d]"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}