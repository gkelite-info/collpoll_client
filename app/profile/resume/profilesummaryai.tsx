"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ResumeTemplateSelector from "../resume/Resumetemplateselector ";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";

import {
  getProfileSummary,
  insertProfileSummary,
  updateProfileSummary,
} from "@/lib/helpers/student/Resume/profileSummaryAPI";
import {
  getGroupedSkills,
  getStudentResumeSkillIds,
  GroupedSkills,
  saveStudentResumeSkills,
} from "@/lib/helpers/student/Resume/Studentresumeskillsapi ";
import {
  generateFiveProfileSummaries,
  suggestSkillsFromJD,
} from "@/lib/helpers/student/ai/Profilesummaryactionai";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "personal" | "keyskills";

// ─── ATS Score Component ──────────────────────────────────────────────────────

function ATSScoreBox({ score, loading }: { score: number | null; loading: boolean }) {
  const getScoreColor = (s: number) => {
    if (s >= 75) return { ring: "#22c55e", text: "#16a34a", label: "Excellent", bg: "#f0fdf4" };
    if (s >= 50) return { ring: "#f59e0b", text: "#b45309", label: "Good", bg: "#fffbeb" };
    return { ring: "#ef4444", text: "#b91c1c", label: "Needs Work", bg: "#fef2f2" };
  };

  const colors = score !== null ? getScoreColor(score) : { ring: "#d1d5db", text: "#6b7280", label: "", bg: "#f9fafb" };
  const circumference = 2 * Math.PI * 36;
  const dashOffset = score !== null ? circumference - (score / 100) * circumference : circumference;

  return (
    <div
      className="rounded-2xl p-5 mb-6 flex items-center gap-6"
      style={{ background: colors.bg, border: `1.5px solid ${colors.ring}22` }}
    >
      {/* Circular progress */}
      <div className="relative flex-shrink-0 w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke={colors.ring}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={loading ? circumference : dashOffset}
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <>
              <span className="text-xl font-black leading-none" style={{ color: colors.text }}>
                {score ?? "--"}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 mt-0.5">/ 100</span>
            </>
          )}
        </div>
      </div>

      {/* Text info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-black text-[#16284F]">ATS Resume Score</span>
          {!loading && score !== null && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: colors.ring + "22", color: colors.text }}
            >
              {colors.label}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          {loading
            ? "Analysing your resume against ATS criteria…"
            : score === null
            ? "Complete your profile to get your ATS score."
            : score >= 75
            ? "Great job! Your resume is well-optimised for applicant tracking systems."
            : score >= 50
            ? "Your resume passes most ATS filters. A few improvements can push it higher."
            : "Your resume may get filtered out by ATS. Add more relevant keywords and structure."}
        </p>
        {!loading && score !== null && (
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {score < 100 && (
              <span className="text-[10px] bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                💡 Add a strong summary
              </span>
            )}
            {score < 75 && (
              <span className="text-[10px] bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                🔑 Use more keywords
              </span>
            )}
            {score < 50 && (
              <span className="text-[10px] bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                📋 Add work experience
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── JD Skill Gap Box ─────────────────────────────────────────────────────────

interface JDSkillGapBoxProps {
  jdText: string;
  suggestedSkills: Array<{ name: string; resumeSkillId: number; demand: "high" | "medium" }>;
  selectedSkillIds: Set<number>;
  onToggle: (id: number) => void;
  isGenerating: boolean;
}

function JDSkillGapBox({ jdText, suggestedSkills, selectedSkillIds, onToggle, isGenerating }: JDSkillGapBoxProps) {
  if (!jdText.trim() || (suggestedSkills.length === 0 && !isGenerating)) return null;

  return (
    <div className="mt-5 rounded-xl border border-purple-100 bg-gradient-to-br from-[#faf7ff] to-[#f3eeff] p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303 0l-.347-.347z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#16284F]">Skills to Boost Your Resume for This JD</p>
          <p className="text-[11px] text-purple-500 font-medium">Select the skills below to add them to your resume</p>
        </div>
      </div>

      {isGenerating ? (
        <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
          <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Analysing job description for skill gaps…
        </div>
      ) : (
        <>
          {/* High demand */}
          {suggestedSkills.filter(s => s.demand === "high").length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                🔥 High Demand Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.filter(s => s.demand === "high").map((skill) => {
                  const isSelected = selectedSkillIds.has(skill.resumeSkillId);
                  return (
                    <button
                      key={skill.resumeSkillId}
                      onClick={() => onToggle(skill.resumeSkillId)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#16284F] text-white border-[#16284F]"
                          : "bg-white text-red-600 border-red-300 hover:border-red-500"
                      }`}
                    >
                      {isSelected ? "✓" : "+"} {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Medium demand */}
          {suggestedSkills.filter(s => s.demand === "medium").length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                ⭐ Recommended Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.filter(s => s.demand === "medium").map((skill) => {
                  const isSelected = selectedSkillIds.has(skill.resumeSkillId);
                  return (
                    <button
                      key={skill.resumeSkillId}
                      onClick={() => onToggle(skill.resumeSkillId)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#16284F] text-white border-[#16284F]"
                          : "bg-white text-amber-700 border-amber-300 hover:border-amber-500"
                      }`}
                    >
                      {isSelected ? "✓" : "+"} {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA message */}
          <p className="text-[11px] text-purple-600 font-semibold mt-4 bg-purple-50 rounded-lg px-3 py-2 border border-purple-100">
            💼 Adding these skills can significantly increase your resume's match rate for this role. Select them above and hit <strong>Save Skills</strong> to update your resume.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ProfileSummaryCard() {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { studentId } = useUser();

  // ── Template view ──
  const [showTemplates, setShowTemplates] = useState(
    searchParams.get("view") === "templates"
  );
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setShowTemplates(searchParams.get("view") === "templates");
  }, [searchParams]);

  // ── Personal / Summary tab ──
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummaries, setAiSummaries] = useState<string[]>([]);
  const [selectedSummaryIdx, setSelectedSummaryIdx] = useState<number | null>(null);
  const [resumeSummaryId, setResumeSummaryId] = useState<number | null>(null);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [existingSummary, setExistingSummary] = useState("");

  // ── ATS Score ──
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsLoading, setAtsLoading] = useState(true);

  // ── Key Skills tab ──
  const [groupedSkills, setGroupedSkills] = useState<GroupedSkills[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<number>>(new Set());
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [skillsJD, setSkillsJD] = useState("");

  // ── JD Skill Gap ──
  const [jdSuggestedSkills, setJdSuggestedSkills] = useState<
    Array<{ name: string; resumeSkillId: number; demand: "high" | "medium" }>
  >([]);
  const [isGeneratingGap, setIsGeneratingGap] = useState(false);

  // ─── Load existing summary + compute ATS score ─────────────────────────────

  useEffect(() => {
    if (!studentId) return;
    setSummaryLoading(true);
    setAtsLoading(true);
    getProfileSummary(studentId)
      .then(async (data) => {
        if (data?.summary) {
          setExistingSummary(data.summary);
          setResumeSummaryId(data.resumeSummaryId);
          // ── Compute ATS score via AI ──────────────────────────────────────
          try {
            const res = await fetch("/api/ai/ats-score", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentId, summary: data.summary }),
            });
            const json = await res.json();
            if (typeof json.score === "number") setAtsScore(json.score);
          } catch {
            // silently fail — score stays null
          } finally {
            setAtsLoading(false);
          }
        } else {
          setAtsLoading(false);
        }
      })
      .catch(() => {
        toast.error("Failed to load profile summary.");
        setAtsLoading(false);
      })
      .finally(() => setSummaryLoading(false));
  }, [studentId]);

  // ─── Load skills ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!studentId) return;
    setSkillsLoading(true);
    Promise.all([getGroupedSkills(), getStudentResumeSkillIds(studentId)])
      .then(([grouped, savedIds]) => {
        setGroupedSkills(grouped);
        setSelectedSkillIds(new Set(savedIds));
      })
      .catch(() => toast.error("Failed to load skills."))
      .finally(() => setSkillsLoading(false));
  }, [studentId]);

  // ─── Template redirect ─────────────────────────────────────────────────────

  if (showTemplates) {
    return (
      <ResumeTemplateSelector
        onBack={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("view");
          router.push(`?${params.toString()}`);
        }}
      />
    );
  }

  // ─── Handlers: Summary ────────────────────────────────────────────────────

  const handleGenerateSummaries = async () => {
    if (!studentId) return;
    setIsGenerating(true);
    setAiSummaries([]);
    setSelectedSummaryIdx(null);
    try {
      const summaries = await generateFiveProfileSummaries(studentId, jobDescription);
      if (summaries.length === 0) {
        toast.error("Could not generate summaries. Try again.");
      } else {
        setAiSummaries(summaries);
      }
    } catch {
      toast.error("AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSummary = async (summary: string, idx: number) => {
    if (!studentId) return;
    setSelectedSummaryIdx(idx);
    setIsSavingSummary(true);
    try {
      if (resumeSummaryId) {
        await updateProfileSummary(studentId, summary);
      } else {
        const result = await insertProfileSummary(studentId, summary);
        setResumeSummaryId(result.resumeSummaryId);
      }
      setExistingSummary(summary);
      toast.success("Profile summary saved!");

      // ── Recompute ATS score after saving new summary ──────────────────────
      setAtsLoading(true);
      try {
        const res = await fetch("/api/ai/ats-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, summary }),
        });
        const json = await res.json();
        if (typeof json.score === "number") setAtsScore(json.score);
      } catch {
        // silently fail
      } finally {
        setAtsLoading(false);
      }
    } catch {
      toast.error("Failed to save summary.");
    } finally {
      setIsSavingSummary(false);
    }
  };

  // ─── Handlers: Skills ─────────────────────────────────────────────────────

  const toggleSkill = (skillId: number) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      next.has(skillId) ? next.delete(skillId) : next.add(skillId);
      return next;
    });
  };

  const handleSaveSkills = async () => {
    if (!studentId) return;
    setIsSavingSkills(true);
    try {
      await saveStudentResumeSkills(studentId, Array.from(selectedSkillIds));
      toast.success("Skills saved successfully!");
    } catch {
      toast.error("Failed to save skills.");
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleSuggestSkillsFromJD = async () => {
    if (!skillsJD.trim()) {
      toast.error("Please paste a job description first.");
      return;
    }
    setIsGeneratingSkills(true);
    setIsGeneratingGap(true);
    setJdSuggestedSkills([]);
    try {
      const allSkillNames = groupedSkills.flatMap((g) =>
        g.skills.map((s) => s.name)
      );
      const suggested = await suggestSkillsFromJD(skillsJD, allSkillNames);
      if (suggested.length === 0) {
        toast.error("No matching skills found from JD.");
        return;
      }

      // Build name → skill map
      const nameToSkill = new Map(
        groupedSkills.flatMap((g) =>
          g.skills.map((s) => [s.name.toLowerCase(), s])
        )
      );

      // Determine high vs medium demand (first 40% = high, rest = medium)
      const highCount = Math.ceil(suggested.length * 0.4);
      const gapSkills = suggested
        .map((name, i) => {
          const skill = nameToSkill.get(name.toLowerCase());
          if (!skill) return null;
          return {
            name: skill.name,
            resumeSkillId: skill.resumeSkillId,
            demand: (i < highCount ? "high" : "medium") as "high" | "medium",
          };
        })
        .filter(Boolean) as Array<{ name: string; resumeSkillId: number; demand: "high" | "medium" }>;

      setJdSuggestedSkills(gapSkills);

      // Auto-select all suggested skills
      setSelectedSkillIds((prev) => {
        const next = new Set(prev);
        suggested.forEach((name) => {
          const id = nameToSkill.get(name.toLowerCase())?.resumeSkillId;
          if (id) next.add(id);
        });
        return next;
      });

      toast.success(`${suggested.length} skills suggested from JD!`);
    } catch {
      toast.error("Failed to suggest skills.");
    } finally {
      setIsGeneratingSkills(false);
      setIsGeneratingGap(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-[#FFFFFF] min-h-screen rounded-xl">

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === "personal"
              ? "bg-[#16284F] text-white"
              : "bg-[#eef1f7] text-gray-600"
          }`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab("keyskills")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === "keyskills"
              ? "bg-[#16284F] text-white"
              : "bg-[#eef1f7] text-gray-600"
          }`}
        >
          Key Skills
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PERSONAL TAB
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-2xl p-6 max-w-4xl">

          {/* ── ATS Score Box ── */}
          <ATSScoreBox score={atsScore} loading={atsLoading} />

          {/* AI Assistance badge */}
          <div className="mb-5">
            <div
              style={{ background: "linear-gradient(90deg, #F1E7FE 0%, #D4BEFF 100%)" }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#6b5cff]"
            >
              <Image src="/AI Robot.png" alt="AI" width={40} height={40} />
              AI Assistance
            </div>
          </div>

          {/* ── Single combined box: Current Summary + JD textarea + Generate ── */}
          <div className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">

            {/* Current summary — shown only when it exists and no AI results yet */}
            {existingSummary && aiSummaries.length === 0 && (
              <>
                <p className="text-xs font-semibold text-[#16284F] mb-1">
                  Current Summary
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 pb-5 border-b border-gray-100">
                  {existingSummary}
                </p>
              </>
            )}

            {/* JD textarea */}
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="💡 Paste a job description to get more targeted results."
              className="w-full min-h-[80px] bg-transparent outline-none text-sm text-gray-600 resize-none placeholder-gray-400"
            />

            {/* Generate button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleGenerateSummaries}
                disabled={isGenerating}
                className="text-[#282828] text-sm font-semibold px-6 py-2.5 rounded-lg shadow bg-[linear-gradient(to_right,#EDE1FE_5%,#D5BFFF_95%)] disabled:opacity-60 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate with AI"
                )}
              </button>
            </div>
          </div>

          {/* 5 AI Summary Cards */}
          {aiSummaries.length > 0 && (
            <div className="flex flex-col gap-4">
              {aiSummaries.map((summary, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-5 border-2 transition-all ${
                    selectedSummaryIdx === idx
                      ? "border-[#2ecc8a] bg-[#f0fdf7]"
                      : "border-gray-100 bg-white shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2 items-start flex-1">
                      <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#16284F] text-white text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
                    </div>
                    <button
                      onClick={() => handleUseSummary(summary, idx)}
                      disabled={isSavingSummary}
                      className={`flex-shrink-0 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                        selectedSummaryIdx === idx
                          ? "bg-[#16a85a]"
                          : "bg-[#2ecc8a] hover:bg-[#27b87a]"
                      } disabled:opacity-60`}
                    >
                      {isSavingSummary && selectedSummaryIdx === idx
                        ? "Saving..."
                        : selectedSummaryIdx === idx
                        ? "✓ Saved"
                        : "Use this Summary"}
                    </button>
                  </div>
                </div>
              ))}

              {/* Regenerate */}
              <div className="flex justify-end mt-1">
                <button
                  onClick={handleGenerateSummaries}
                  disabled={isGenerating}
                  className="border border-[#dde1eb] text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          KEY SKILLS TAB
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "keyskills" && (
        <div className="bg-white rounded-2xl p-6 max-w-4xl">

          {/* AI Assistance badge */}
          <div className="mb-5">
            <div
              style={{ background: "linear-gradient(90deg, #F1E7FE 0%, #D4BEFF 100%)" }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#6b5cff]"
            >
              <Image src="/AI Robot.png" alt="AI" width={40} height={40} />
              AI Assistance
            </div>
          </div>

          {/* JD input for skill suggestion */}
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
            <textarea
              value={skillsJD}
              onChange={(e) => setSkillsJD(e.target.value)}
              placeholder="💡 Paste a job description to get AI-suggested skills."
              className="w-full min-h-[80px] bg-transparent outline-none text-sm text-gray-600 resize-none placeholder-gray-400"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSuggestSkillsFromJD}
                disabled={isGeneratingSkills}
                className="text-[#282828] text-sm font-semibold px-6 py-2.5 rounded-lg shadow bg-[linear-gradient(to_right,#EDE1FE_5%,#D5BFFF_95%)] disabled:opacity-60 flex items-center gap-2"
              >
                {isGeneratingSkills ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Suggesting...
                  </>
                ) : (
                  "Suggest Skills from JD"
                )}
              </button>
            </div>

            {/* ── JD Skill Gap Box (NEW) ── shown below the generate button */}
            <JDSkillGapBox
              jdText={skillsJD}
              suggestedSkills={jdSuggestedSkills}
              selectedSkillIds={selectedSkillIds}
              onToggle={toggleSkill}
              isGenerating={isGeneratingGap}
            />
          </div>

          {/* Skills grouped by category */}
          {skillsLoading ? (
            <div className="text-sm text-gray-400 py-6 text-center">Loading skills...</div>
          ) : (
            <div className="flex flex-col gap-6">
              {groupedSkills.map(({ category, skills }) => (
                <div key={category.resumeSkillCategoryId}>
                  <h3 className="text-sm font-bold text-[#16284F] mb-3">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isSelected = selectedSkillIds.has(skill.resumeSkillId);
                      return (
                        <button
                          key={skill.resumeSkillId}
                          onClick={() => toggleSkill(skill.resumeSkillId)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-[#16284F] text-white border-[#16284F]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#16284F] hover:text-[#16284F]"
                          }`}
                        >
                          {isSelected ? `✓ ${skill.name}` : `+ ${skill.name}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected count + Save */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {selectedSkillIds.size} skill{selectedSkillIds.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleSaveSkills}
              disabled={isSavingSkills || selectedSkillIds.size === 0}
              className="bg-[#16284F] text-white text-sm font-semibold px-8 py-2.5 rounded-lg disabled:opacity-50 hover:bg-[#1d3566] transition-all"
            >
              {isSavingSkills ? "Saving..." : "Save Skills"}
            </button>
          </div>
        </div>
      )}

      {/* ─── View Resume Template button ──────────────────────────────────── */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => {
            setIsNavigating(true);
            setTimeout(() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", "templates");
              router.push(`?${params.toString()}`);
              setIsNavigating(false);
            }, 300);
          }}
          disabled={isNavigating}
          className="bg-[#16284F] text-white text-sm font-semibold px-12 py-3 rounded-xl shadow-sm flex items-center gap-2"
        >
          {isNavigating ? "Opening..." : "View Resume Template"}
        </button>
      </div>
    </div>
  );
}