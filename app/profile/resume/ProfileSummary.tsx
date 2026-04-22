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
import { fetchAllResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";
import { calculateATSScore, ATSResult } from "@/lib/helpers/student/Resume/atsScoreCalculator";

// ── Types ────────────────────────────────────────────────────────────────────

interface Suggestion {
  version: string;
  label: string;
  text: string;
}

// ── Version style config ──────────────────────────────────────────────────────

const VERSION_STYLES: Record<
  string,
  { icon: string; accent: string; bg: string; border: string; badge: string }
> = {
  v1: {
    icon: "⚡",
    accent: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  v2: {
    icon: "📋",
    accent: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  v3: {
    icon: "🏆",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  v4: {
    icon: "💻",
    accent: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
  v5: {
    icon: "🤝",
    accent: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
  },
};

// ── Skeleton for suggestions ──────────────────────────────────────────────────

function SuggestionSkeleton() {
  return (
    <div className="space-y-3 mt-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 p-4 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-5 rounded-full bg-gray-200" />
            <div className="h-4 w-28 bg-gray-200 rounded-full" />
            <div className="ml-auto h-5 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProfileSummary() {
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resumeSummaryId, setResumeSummaryId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const [beforeScore, setBeforeScore] = useState<ATSResult | null>(null);
  const [scoreLoading, setScoreLoading] = useState(true);

  const { studentId } = useUser();
  const router = useRouter();

  const showSuccessToast = (message: string) =>
    toast.success(message, { duration: 3000 });

  const waitForToast = () =>
    new Promise((resolve) => setTimeout(resolve, 700));

  // ── Load saved summary ──────────────────────────────────────────────────────

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

  // ── Load ATS score ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!studentId) return;
    setScoreLoading(true);
    fetchAllResumeData(studentId)
      .then((data) => {
        const score = calculateATSScore(data);
        setBeforeScore(score);
        sessionStorage.setItem("ats_before_score", JSON.stringify(score));
      })
      .catch(() => { })
      .finally(() => setScoreLoading(false));
  }, [studentId]);

  // ── Shared save logic ───────────────────────────────────────────────────────

  const saveSummary = async (): Promise<boolean> => {
    if (!studentId) return false;
    const trimmed = description.trim();
    if (!trimmed) {
      toast.error("Please write or select a summary before submitting.");
      return false;
    }
    if (trimmed.length < 20) {
      toast.error("Summary is too short. Please write at least a few sentences.");
      return false;
    }
    const isUpdating = Boolean(resumeSummaryId);
    if (isUpdating) {
      await updateProfileSummary(studentId, trimmed);
    } else {
      const result = await insertProfileSummary(studentId, trimmed);
      setResumeSummaryId(result.resumeSummaryId);
    }
    showSuccessToast(
      isUpdating
        ? "Profile summary updated successfully!"
        : "Profile summary saved successfully!"
    );
    return true;
  };

  // ── Submit handler — saves to API then navigates ────────────────────────────

  const handleSubmit = async () => {
    if (!studentId) return;

    // Guard: textarea is empty
    if (!description.trim()) {
      toast.error("Please write or select a summary before submitting.");
      return;
    }

    // Guard: suggestions were generated but none selected yet
    if (suggestions.length > 0 && !selectedVersion) {
      toast.error("Please select one of the AI-generated summaries, or edit the text above.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await saveSummary();
      if (!success) return;
      await waitForToast();
      router.push("/profile?resume=profilesummaryai&view=templates");
    } catch {
      toast.error("Failed to submit summary. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── AI Generate 5 Suggestions from user text ────────────────────────────────

  const handleGenerateAI = async () => {
    const trimmed = description.trim();
    if (!trimmed) {
      toast.error("Please type or paste your profile summary first.");
      return;
    }
    setIsGenerating(true);
    setSuggestions([]);
    setSelectedVersion(null);
    try {
      const results = await generateProfileSummaryAction(trimmed);
      if (results.length) {
        setSuggestions(results);
      } else {
        toast.error("Failed to generate suggestions. Please try again.");
      }
    } catch {
      toast.error("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Use suggestion ──────────────────────────────────────────────────────────

  const handleUseSuggestion = (s: Suggestion) => {
    setDescription(s.text);
    setSelectedVersion(s.version);
    toast.success(`${s.label} version applied!`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  if (loading) return <ProfileSummaryShimmer />;

  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="min-h-[58vh] bg-gray-100 flex justify-center rounded-xl mt-2 mb-5">
      <div className="w-full bg-white rounded-xl shadow-sm p-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-[#282828]">Profile Summary</h2>
        </div>

        {/* ── Textarea section ─────────────────────────────────────────────── */}
        <div>
          <h3 className="text-base font-medium text-[#282828] mb-1">
            Write Your Professional Summary
          </h3>

          {/* Instruction note + Generate button — gradient banner */}
          <div className="flex items-center justify-between gap-4 mb-3 p-3.5 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 shadow-sm">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <span className="text-white text-base mt-0.5 shrink-0">💡</span>
              <p className="text-xs text-white/90 leading-relaxed">
                Type or paste your existing profile summary below, then click{" "}
                <span className="font-bold text-white">"Generate with AI"</span> to get{" "}
                <span className="font-bold text-white">5 improved versions</span> — each with
                a different tone and focus. Pick the one that best represents you!
              </p>
            </div>
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-semibold transition-all shrink-0 ${isGenerating
                  ? "bg-white/20 text-white/50 cursor-not-allowed"
                  : "bg-white text-violet-700 cursor-pointer hover:bg-violet-50 shadow-md"
                }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white/80 rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="text-violet-500 text-base leading-none">✦</span>
                  Generate with AI
                </>
              )}
            </button>
          </div>

          {/* Replace warning — only when suggestions exist */}
          {hasSuggestions && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-amber-500 text-xs">✦</span>
              <p className="text-xs text-amber-500">Clicking a version will replace current text</p>
            </div>
          )}

          {/* Textarea */}
          <div className="relative">
            <textarea
              rows={10}
              required
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste or type your current profile summary here... e.g. A passionate Computer Science student with a strong interest in software development..."
              className="w-full border border-[#CCCCCC] rounded-lg p-4 text-sm text-[#525252] focus:outline-none resize-none focus:border-violet-400 transition-colors"
            />
            {selectedVersion && (
              <div className="absolute top-3 right-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium border border-violet-200">
                  {VERSION_STYLES[selectedVersion]?.icon}{" "}
                  {suggestions.find((s) => s.version === selectedVersion)?.label}
                </span>
              </div>
            )}
            <span className="absolute bottom-3 right-4 text-xs text-gray-400">
              {description.length}/1000
            </span>
          </div>

          {/* ── ATS Score card + AI Robot card — side by side ──────────────── */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ATS Score card */}
            <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-[#faf7ff] to-[#f3eeff] p-4 flex flex-col justify-between">
              <p className="text-[11px] font-bold text-purple-500 uppercase tracking-widest mb-3">
                📊 Your Current ATS Score — Before AI
              </p>

              {scoreLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-xs text-purple-300">Calculating...</span>
                </div>
              ) : beforeScore ? (
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="28" fill="none" stroke="#e9d5ff" strokeWidth="7" />
                      <circle
                        cx="36" cy="36" r="28"
                        fill="none"
                        stroke={beforeScore.color}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={
                          2 * Math.PI * 28 - (beforeScore.total / 100) * 2 * Math.PI * 28
                        }
                        transform="rotate(-90 36 36)"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-black" style={{ color: beforeScore.color }}>
                        {beforeScore.total}
                      </span>
                      <span className="text-[8px] text-gray-400">/100</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span
                      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
                      style={{ background: `${beforeScore.color}20`, color: beforeScore.color }}
                    >
                      {beforeScore.label}
                    </span>
                    <p className="text-[11px] text-purple-500 font-semibold leading-snug">
                      ✨ Use AI to boost your score and stand out to recruiters!
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* AI Robot card */}
            <div className="rounded-xl bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 border border-purple-100 p-4 flex flex-col items-center justify-between text-center">
              <div className="flex items-center gap-3 w-full mb-3">
                <img
                  src="/AI Robot.png"
                  alt="AI Robot"
                  width={64}
                  height={64}
                  className="object-contain shrink-0"
                />
                <p className="flex-1 text-sm font-medium text-gray-700 text-left leading-snug">
                  Do you feel your current resume doesn't fully showcase your skills or match the job you're aiming for?
                  <br />
                  <span className="text-xs text-gray-500 font-normal">Want to enhance it to better fit your target role?</span>
                </p>
              </div>
              <button
                onClick={() => router.push("/profile?resume=profilesummaryai")}
                className="w-full bg-gradient-to-r from-[#1e1b4b] to-[#3730a3] text-white text-sm px-5 py-2 rounded-lg font-semibold hover:from-[#2d2a6e] hover:to-[#4338ca] transition-all cursor-pointer shadow-sm"
              >
                Click here
              </button>
            </div>
          </div>

          {/* ── AI Suggestions ──────────────────────────────────────────────── */}
          {isGenerating && <SuggestionSkeleton />}

          {!isGenerating && hasSuggestions && (
            <div className="mt-5">

              {/* Section header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-800">✦ AI-Generated Versions</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
                  5 Suggestions
                </span>
              </div>

              {/* Version note */}
              <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                <span className="text-amber-500 shrink-0 text-sm">⚠️</span>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Each version below uses a <span className="font-semibold">different writing style</span> —
                  from concise &amp; punchy to achievement-focused to leadership-oriented.
                  Click <span className="font-semibold">"Use This"</span> to apply it to your summary above.
                  Your current text will be <span className="font-semibold">replaced</span>.
                </p>
              </div>

              {/* Suggestion cards */}
              <div className="space-y-3">
                {suggestions.map((s, i) => {
                  const style = VERSION_STYLES[s.version] ?? VERSION_STYLES["v1"];
                  const isSelected = selectedVersion === s.version;

                  return (
                    <div
                      key={s.version}
                      className={`rounded-xl border-2 p-4 transition-all ${isSelected
                          ? `${style.border} ${style.bg} shadow-md`
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                        }`}
                    >
                      {/* Card header */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{style.icon}</span>
                          <span className={`text-xs font-bold ${style.accent}`}>
                            {s.label}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${style.badge}`}
                          >
                            {s.version.toUpperCase()}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 font-semibold">
                              ✓ Applied
                            </span>
                          )}
                        </div>

                        {/* Action button — Use This only */}
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleUseSuggestion(s)}
                            disabled={isSelected}
                            className={`text-[11px] px-3 py-1.5 rounded-md font-medium transition-all ${isSelected
                                ? `${style.bg} ${style.accent} border-2 ${style.border} cursor-default`
                                : `bg-gray-900 text-white hover:bg-gray-700 cursor-pointer`
                              }`}
                          >
                            {isSelected ? "✓ In Use" : "Use This"}
                          </button>
                        </div>
                      </div>

                      {/* Text */}
                      <p className="text-xs text-gray-600 leading-relaxed">{s.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Submit button ──────────────────────────────────────────────── */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-2 rounded-md text-sm font-medium text-white min-w-[110px] ${isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#43C17A] cursor-pointer hover:bg-[#3bad6d]"
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
