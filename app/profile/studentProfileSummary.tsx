"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "../utils/context/UserContext";
import {
  getUserProfileSummary,
  createProfileSummary,
  updateProfileSummary,
} from "@/lib/helpers/profile/profileProfileSummary";
import ProfileSummaryShimmer from "./shimmers/ProfileSummaryShimmer";

export default function StudentProfileSummary() {
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summaryId, setSummaryId] = useState<number | null>(null);
  const { userId } = useUser()

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    getUserProfileSummary(userId)
      .then((data) => {
        if (data?.summary) {
          setDescription(data.summary);
          setSummaryId(data.summaryId);
        }
      })
      .catch(() => {
        toast.error("Failed to load summary");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async () => {
    if (!userId) return
    const trimmed = description.trim();

    if (!trimmed) {
      toast.error("Please write a summary before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (summaryId) {
        await updateProfileSummary(userId, trimmed);
      } else {
        const result = await createProfileSummary(userId, trimmed);
        setSummaryId(result?.summaryId);
      }
      toast.success("Profile Summary Saved Successfully");
    } catch (error) {
      toast.error("Failed to submit summary. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        </div>

        <div>
          <h3 className="text-base font-medium text-[#282828] mb-1">
            Write Your Professional Summary
          </h3>
          <p className="text-sm text-[#525252] mb-4 max-w-3xl">
            Share a short overview of your education, skills, and career goals
            what drives you and where you see your future.
          </p>

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
              className={`bg-[#43C17A] text-white px-5 py-1.5 rounded-md text-sm font-medium transition-all ${isSubmitting
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
