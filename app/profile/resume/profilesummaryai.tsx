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
  suggestSkillsFromJDWithDemand,
} from "@/lib/helpers/student/ai/Profilesummaryactionai";
import { createStudentResumeSkill } from "@/lib/helpers/student/Resume/resumeSkillsAPI";
import { fetchAllResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";
import { calculateATSScore } from "@/lib/helpers/student/Resume/atsScoreCalculator";

type Tab = "personal" | "keyskills";

interface JDSkillGapBoxProps {
  jdText: string;
  matchingSkills: Array<{ name: string; demand: "high" | "medium" }>;
  missingSkills: Array<{ name: string; demand: "high" | "medium" }>;
  suggestedSkills: Array<{ name: string; resumeSkillId: number; demand: "high" | "medium" }>;
  selectedSkillIds: Set<number>;
  onToggle: (id: number) => void;
  isGenerating: boolean;
  selectedMissingSkills: Set<string>;
  onToggleMissing: (name: string) => void;
}

function JDSkillGapBox({
  jdText,
  matchingSkills,
  missingSkills,
  suggestedSkills,
  selectedSkillIds,
  onToggle,
  isGenerating,
  selectedMissingSkills,
  onToggleMissing,
}: JDSkillGapBoxProps) {
  if (!jdText.trim() && !isGenerating) return null;
  if (!isGenerating && matchingSkills.length === 0 && suggestedSkills.length === 0 && missingSkills.length === 0) return null;

  return (
    <div className="mt-5 rounded-xl border border-purple-100 bg-gradient-to-br from-[#faf7ff] to-[#f3eeff] p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303 0l-.347-.347z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#16284F]">JD Skill Analysis</p>
          <p className="text-[11px] text-purple-500 font-medium">See how your skills match and what to add</p>
        </div>
      </div>

      {isGenerating ? (
        <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
          <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Analysing your skills against the JD…
        </div>
      ) : (
        <>
          {matchingSkills.length > 0 && (
            <div className="mb-4 bg-white rounded-xl p-4 border border-green-100">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[9px]">✓</span>
                Your Skills — Already Strong for This JD
              </p>
              <div className="flex flex-wrap gap-2">
                {matchingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 cursor-default ${skill.demand === "high"
                      ? "bg-green-50 text-green-700 border-2 border-green-400"
                      : "bg-green-50 text-green-600 border border-green-200"
                      }`}
                  >
                    ✓ {skill.name}
                    {skill.demand === "high" && (
                      <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full ml-1">
                        Key
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
          {suggestedSkills.length > 0 && (
            <div className="mb-4 bg-white rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <span className="text-base">➕</span>
                Add to Your Resume — You Have These Skills
              </p>
              <p className="text-[11px] text-gray-400 mb-3">
                These are in your skill master but not yet on your resume. Select to add them.
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.filter(s => s.demand === "high").length > 0 && (
                  <>
                    <p className="w-full text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
                      🔥 High Demand
                    </p>
                    {suggestedSkills.filter(s => s.demand === "high").map((skill) => {
                      const isSelected = selectedSkillIds.has(skill.resumeSkillId);
                      return (
                        <button
                          key={skill.resumeSkillId}
                          onClick={() => onToggle(skill.resumeSkillId)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1 cursor-pointer ${isSelected
                            ? "bg-[#16284F] text-white border-[#16284F]"
                            : "bg-white text-red-600 border-red-300 hover:border-red-500"
                            }`}
                        >
                          {isSelected ? "✓" : "+"} {skill.name}
                        </button>
                      );
                    })}
                  </>
                )}
                {suggestedSkills.filter(s => s.demand === "medium").length > 0 && (
                  <>
                    <p className="w-full text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 mt-2">
                      ⭐ Recommended
                    </p>
                    {suggestedSkills.filter(s => s.demand === "medium").map((skill) => {
                      const isSelected = selectedSkillIds.has(skill.resumeSkillId);
                      return (
                        <button
                          key={skill.resumeSkillId}
                          onClick={() => onToggle(skill.resumeSkillId)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1 cursor-pointer ${isSelected
                            ? "bg-[#16284F] text-white border-[#16284F]"
                            : "bg-white text-amber-700 border-amber-300 hover:border-amber-500"
                            }`}
                        >
                          {isSelected ? "✓" : "+"} {skill.name}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
          {missingSkills.length > 0 && (
            <div className="mb-4 bg-white rounded-xl p-4 border border-orange-100">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <span className="text-base">🎯</span>
                Skills to Learn — Not Yet in Your Profile
              </p>
              <p className="text-[11px] text-gray-400 mb-3">
                The JD demands these. Consider learning them to strengthen your profile.
              </p>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, i) => {
                  const isSelected = selectedMissingSkills.has(skill.name);
                  return (
                    <button
                      key={i}
                      onClick={() => onToggleMissing(skill.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 flex items-center gap-1 cursor-pointer transition-all ${isSelected
                        ? "bg-[#16284F] text-white border-[#16284F]"
                        : skill.demand === "high"
                          ? "bg-orange-50 text-orange-600 border-orange-300 hover:border-orange-500"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:border-yellow-400"
                        }`}
                    >
                      {isSelected ? "✓" : "🎯"} {skill.name}
                      {skill.demand === "high" && !isSelected && (
                        <span className="text-[9px] bg-orange-400 text-white px-1.5 py-0.5 rounded-full ml-1">
                          Must Have
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-[11px] text-purple-600 font-semibold mt-2 bg-purple-50 rounded-lg px-3 py-2 border border-purple-100">
            💼 Select skills from the blue section above and hit <strong>Save Skills</strong> to update your resume.
          </p>
        </>
      )}
    </div>
  );
}

export default function ProfileSummaryCard() {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { studentId } = useUser();

  const [showTemplates, setShowTemplates] = useState(searchParams.get("view") === "templates");
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setShowTemplates(searchParams.get("view") === "templates");
  }, [searchParams]);

  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummaries, setAiSummaries] = useState<string[]>([]);
  const [selectedSummaryIdx, setSelectedSummaryIdx] = useState<number | null>(null);
  const [resumeSummaryId, setResumeSummaryId] = useState<number | null>(null);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [existingSummary, setExistingSummary] = useState("");
  const [editableSummary, setEditableSummary] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const [groupedSkills, setGroupedSkills] = useState<GroupedSkills[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<number>>(new Set());
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [skillsJD, setSkillsJD] = useState("");

  
  const [jdMatchingSkills, setJdMatchingSkills] = useState<Array<{ name: string; demand: "high" | "medium" }>>([]);
  const [jdSuggestedSkills, setJdSuggestedSkills] = useState<Array<{ name: string; resumeSkillId: number; demand: "high" | "medium" }>>([]);
  const [jdMissingSkills, setJdMissingSkills] = useState<Array<{ name: string; demand: "high" | "medium" }>>([]);
  const [isGeneratingGap, setIsGeneratingGap] = useState(false);
  const [selectedMissingSkills, setSelectedMissingSkills] = useState<Set<string>>(new Set());

  const [jdMatchingSkillsTab, setJdMatchingSkillsTab] = useState<Array<{ name: string; demand: "high" | "medium" }>>([]);
  const [jdSuggestedSkillsTab, setJdSuggestedSkillsTab] = useState<Array<{ name: string; resumeSkillId: number; demand: "high" | "medium" }>>([]);
  const [jdMissingSkillsTab, setJdMissingSkillsTab] = useState<Array<{ name: string; demand: "high" | "medium" }>>([]);
  const [isGeneratingGapTab, setIsGeneratingGapTab] = useState(false);
  const [selectedMissingSkillsTab, setSelectedMissingSkillsTab] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!studentId) return;
    setSummaryLoading(true);
    getProfileSummary(studentId)
      .then(async (data) => {
        if (data?.summary) {
          setExistingSummary(data.summary);
          setEditableSummary(data.summary);
          setResumeSummaryId(data.resumeSummaryId);
          setAtsLoading(true);
          fetch("/api/ai/ats-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, summary: data.summary }),
          })
            .then((r) => r.json())
            .then((json) => { if (typeof json.score === "number") setAtsScore(json.score); })
            .catch(() => { })
            .finally(() => setAtsLoading(false));
        }
      })
      .catch(() => { toast.error("Failed to load profile summary."); })
      .finally(() => setSummaryLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    if (!sessionStorage.getItem("ats_before_score")) {
      fetchAllResumeData(studentId).then((data) => {
        const score = calculateATSScore(data);
        sessionStorage.setItem("ats_before_score", JSON.stringify(score));
      }).catch(() => { });
    }
  }, [studentId]);

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

  const processSkillGap = async (
    jd: string,
    setMatching: (v: Array<{ name: string; demand: "high" | "medium" }>) => void,
    setSuggested: (v: Array<{ name: string; resumeSkillId: number; demand: "high" | "medium" }>) => void,
    setMissing: (v: Array<{ name: string; demand: "high" | "medium" }>) => void,
    setGenerating: (v: boolean) => void
  ) => {
    if (!jd.trim() || groupedSkills.length === 0) return;
    setGenerating(true);
    setMatching([]);
    setSuggested([]);
    setMissing([]);

    try {
      const allSkillNames = groupedSkills.flatMap((g) =>
        g.skills.map((s) => `${s.name} - ${g.category.name}`)
      );

      const { matching, missing } = await suggestSkillsFromJDWithDemand(jd, allSkillNames);

      const nameToSkill = new Map(
        groupedSkills.flatMap((g) =>
          g.skills.map((s) => [s.name.toLowerCase(), s])
        )
      );

      const matchingOnResume = matching
        .map(({ name, demand }) => {
          const clean = name.replace(/\s*[-\(].*$/, "").trim();
          const skill = nameToSkill.get(clean.toLowerCase());
          if (!skill || !selectedSkillIds.has(skill.resumeSkillId)) return null;
          return { name: skill.name, demand };
        })
        .filter(Boolean) as Array<{ name: string; demand: "high" | "medium" }>;

      const toAdd = matching
        .map(({ name, demand }) => {
          const clean = name.replace(/\s*[-\(].*$/, "").trim();
          const skill = nameToSkill.get(clean.toLowerCase());
          if (!skill || selectedSkillIds.has(skill.resumeSkillId)) return null;
          return { name: skill.name, resumeSkillId: skill.resumeSkillId, demand };
        })
        .filter(Boolean) as Array<{ name: string; resumeSkillId: number; demand: "high" | "medium" }>;

      setMatching(matchingOnResume);
      setSuggested(toAdd);
      setMissing(missing);

      if (matchingOnResume.length > 0 || toAdd.length > 0) {
        toast.success(`Skill analysis complete! ${toAdd.length} skills to add, ${matchingOnResume.length} already strong.`);
      } else if (missing.length > 0) {
        toast.success(`Analysis complete! ${missing.length} skills to learn for this JD.`);
      } else {
        toast.success("You already have all skills for this JD! 🎉");
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  };

  
  const handleGenerateSummaries = async () => {
    if (!studentId) return;
    setIsGenerating(true);
    setAiSummaries([]);
    setSelectedSummaryIdx(null);

    try {
      const [summaries] = await Promise.all([
        generateFiveProfileSummaries(studentId, jobDescription),
        processSkillGap(
          jobDescription,
          setJdMatchingSkills,
          setJdSuggestedSkills,
          setJdMissingSkills,
          setIsGeneratingGap
        ),
      ]);

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
      setEditableSummary(summary);
      toast.success("Profile summary saved!");
      setAtsLoading(true);
      fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, summary }),
      })
        .then((r) => r.json())
        .then((json) => { if (typeof json.score === "number") setAtsScore(json.score); })
        .catch(() => { })
        .finally(() => setAtsLoading(false));
    } catch {
      toast.error("Failed to save summary.");
    } finally {
      setIsSavingSummary(false);
    }
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      next.has(skillId) ? next.delete(skillId) : next.add(skillId);
      return next;
    });
  };

  const toggleMissingSkill = (name: string) => {
    setSelectedMissingSkills((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleMissingSkillTab = (name: string) => {
    setSelectedMissingSkillsTab((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleSaveSkills = async () => {
    if (!studentId) return;
    setIsSavingSkills(true);
    try {
      await saveStudentResumeSkills(studentId, Array.from(selectedSkillIds));

      if (selectedMissingSkills.size > 0) {
        await Promise.all(
          Array.from(selectedMissingSkills).map((name) =>
            createStudentResumeSkill(studentId, "technical", name)
          )
        );
        setSelectedMissingSkills(new Set());
      }

      if (selectedMissingSkillsTab.size > 0) {
        await Promise.all(
          Array.from(selectedMissingSkillsTab).map((name) =>
            createStudentResumeSkill(studentId, "technical", name)
          )
        );
        setSelectedMissingSkillsTab(new Set());
      }

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
    await processSkillGap(
      skillsJD,
      setJdMatchingSkillsTab,
      setJdSuggestedSkillsTab,
      setJdMissingSkillsTab,
      setIsGeneratingGapTab
    );
    setIsGeneratingSkills(false);
  };

  return (
    <div className="p-6 bg-[#FFFFFF] min-h-screen rounded-xl">
      <button
        onClick={() => router.back()}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors mb-4"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "personal" ? "bg-[#16284F] text-white" : "bg-[#eef1f7] text-gray-600 hover:bg-[#e2e6f0]"}`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab("keyskills")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "keyskills" ? "bg-[#16284F] text-white" : "bg-[#eef1f7] text-gray-600 hover:bg-[#e2e6f0]"}`}
        >
          Key Skills
        </button>
      </div>
      {activeTab === "personal" && (
        <div className="bg-white rounded-2xl p-6 max-w-4xl">
          <div className="mb-4">
            <div
              style={{ background: "linear-gradient(90deg, #F1E7FE 0%, #D4BEFF 100%)" }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#6b5cff]"
            >
              <Image src="/AI Robot.png" alt="AI" width={40} height={40} />
              AI Assistance
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <div className="mb-5 pb-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#16284F] uppercase tracking-widest">Current Summary</p>
                {atsScore !== null && !atsLoading && (
                  <div className={"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 " + (
                    atsScore >= 75 ? "bg-green-50 text-green-700 border-green-300" :
                      atsScore >= 50 ? "bg-amber-50 text-amber-700 border-amber-300" :
                        "bg-red-50 text-red-600 border-red-300"
                  )}>
                    <span>ATS Score</span>
                    <span className="text-sm font-black">{atsScore}/100</span>
                    <span>{atsScore >= 75 ? "✅" : atsScore >= 50 ? "⚠️" : "❌"}</span>
                  </div>
                )}
                {atsLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Calculating ATS…
                  </div>
                )}
              </div>

              <textarea
                value={editableSummary}
                onChange={(e) => setEditableSummary(e.target.value)}
                placeholder="Write your profile summary here, or use AI to generate one below…"
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none text-sm text-gray-600 resize-none placeholder-gray-400 focus:border-[#16284F] transition-colors"
              />

              <div className="flex justify-end mt-3">
                <button
                  onClick={async () => {
                    if (!editableSummary.trim() || !studentId) return;
                    setIsSavingSummary(true);
                    setSelectedSummaryIdx(-1);
                    try {
                      if (resumeSummaryId) {
                        await updateProfileSummary(studentId, editableSummary.trim());
                      } else {
                        const result = await insertProfileSummary(studentId, editableSummary.trim());
                        setResumeSummaryId(result.resumeSummaryId);
                      }
                      setExistingSummary(editableSummary.trim());
                      toast.success("Profile summary saved!");
                      setAtsLoading(true);
                      fetch("/api/ai/ats-score", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ studentId, summary: editableSummary.trim() }),
                      })
                        .then((r) => r.json())
                        .then((json) => { if (typeof json.score === "number") setAtsScore(json.score); })
                        .catch(() => { })
                        .finally(() => setAtsLoading(false));
                    } catch {
                      toast.error("Failed to save summary.");
                    } finally {
                      setIsSavingSummary(false);
                    }
                  }}
                  disabled={isSavingSummary || !editableSummary.trim()}
                  className="text-white text-sm font-semibold px-6 py-2.5 rounded-lg bg-[#2ecc8a] hover:bg-[#27b87a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 transition-all"
                >
                  {isSavingSummary && selectedSummaryIdx === -1 ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving…
                    </>
                  ) : "Save Summary"}
                </button>
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="💡 Paste a job description to get a targeted summary + skill recommendations."
              className="w-full min-h-[80px] bg-transparent outline-none text-sm text-gray-600 resize-none placeholder-gray-400"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleGenerateSummaries}
                disabled={isGenerating}
                className="text-[#282828] text-sm font-semibold px-6 py-2.5 rounded-lg shadow bg-[linear-gradient(to_right,#EDE1FE_5%,#D5BFFF_95%)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating...
                  </>
                ) : "Generate with AI"}
              </button>
            </div>
          </div>
          {aiSummaries.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-[#EDE1FE] border border-[#c4a8fc] rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-[#6b5cff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-[#4c3d9e] font-semibold">
                   <span className="font-black text-[#16284F]">These are 5 AI-Suggested Profile Summaries Select the one that best fits you.</span>
                </p>
              </div>
              {atsScore !== null && (
                <div className="flex items-center gap-3 flex-wrap bg-gradient-to-r from-[#faf7ff] to-[#f0fdf7] border border-purple-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 font-semibold">Before AI</span>
                    <span className={"text-sm font-black px-2.5 py-1 rounded-full " + (
                      atsScore >= 75 ? "bg-green-100 text-green-700" :
                        atsScore >= 50 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-600"
                    )}>{atsScore}/100</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-purple-600 font-semibold">After AI</span>
                    <span className="text-sm font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                      {selectedSummaryIdx !== null && selectedSummaryIdx >= 0 ? "Score updated ✓" : "Select a summary ↓"}
                    </span>
                  </div>
                  <span className="ml-auto text-[10px] text-gray-400">Pick one below to replace your current summary</span>
                </div>
              )}

              {aiSummaries.map((summary, idx) => (
                <div
                  key={idx}
                  className={"rounded-xl p-5 border-2 transition-all " + (selectedSummaryIdx === idx ? "border-[#2ecc8a] bg-[#f0fdf7]" : "border-gray-100 bg-white shadow-sm")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2 items-start flex-1">
                      <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-[#16284F] text-white text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
                    </div>
                    <button
                      onClick={() => handleUseSummary(summary, idx)}
                      disabled={isSavingSummary}
                      className={"shrink-0 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed " + (selectedSummaryIdx === idx ? "bg-[#16a85a]" : "bg-[#2ecc8a] hover:bg-[#27b87a]") + " disabled:opacity-60"}
                    >
                      {isSavingSummary && selectedSummaryIdx === idx ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Saving...
                        </span>
                      ) : selectedSummaryIdx === idx ? "✓ Saved" : "Use this Summary"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
      {activeTab === "keyskills" && (
        <div className="bg-white rounded-2xl p-6 max-w-4xl">

          <div className="mb-5">
            <div
              style={{ background: "linear-gradient(90deg, #F1E7FE 0%, #D4BEFF 100%)" }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#6b5cff]"
            >
              <Image src="/AI Robot.png" alt="AI" width={40} height={40} />
              AI Assistance
            </div>
          </div>

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
                className="text-[#282828] text-sm font-semibold px-6 py-2.5 rounded-lg shadow bg-[linear-gradient(to_right,#EDE1FE_5%,#D5BFFF_95%)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                {isGeneratingSkills ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Suggesting...
                  </>
                ) : "Suggest Skills from JD"}
              </button>
            </div>
            <JDSkillGapBox
              jdText={skillsJD}
              matchingSkills={jdMatchingSkillsTab}
              missingSkills={jdMissingSkillsTab}
              suggestedSkills={jdSuggestedSkillsTab}
              selectedSkillIds={selectedSkillIds}
              onToggle={toggleSkill}
              isGenerating={isGeneratingGapTab}
              selectedMissingSkills={selectedMissingSkillsTab}
              onToggleMissing={toggleMissingSkillTab}
            />
            {jdSuggestedSkillsTab.some(s => selectedSkillIds.has(s.resumeSkillId)) && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSaveSkills}
                  disabled={isSavingSkills}
                  className="bg-[#16284F] text-white text-sm font-semibold px-8 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#1d3566] transition-all flex items-center gap-2"
                >
                  {isSavingSkills ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving...
                    </>
                  ) : "Save Selected Skills"}
                </button>
              </div>
            )}
          </div>

          {skillsLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-6">
              <svg className="animate-spin h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading skills...
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {groupedSkills.map(({ category, skills }) => (
                <div key={category.resumeSkillCategoryId}>
                  <h3 className="text-sm font-bold text-[#16284F] mb-3">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isSelected = selectedSkillIds.has(skill.resumeSkillId);
                      return (
                        <button
                          key={skill.resumeSkillId}
                          onClick={() => toggleSkill(skill.resumeSkillId)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSelected ? "bg-[#16284F] text-white border-[#16284F]" : "bg-white text-gray-600 border-gray-200 hover:border-[#16284F] hover:text-[#16284F]"}`}
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

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {selectedSkillIds.size} skill{selectedSkillIds.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleSaveSkills}
              disabled={isSavingSkills || selectedSkillIds.size === 0}
              className="bg-[#16284F] text-white text-sm font-semibold px-8 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#1d3566] transition-all flex items-center gap-2"
            >
              {isSavingSkills ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </>
              ) : "Save Skills"}
            </button>
          </div>
        </div>
      )}
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
          className="bg-[#16284F] text-white text-sm font-semibold px-12 py-3 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed hover:bg-[#1d3566] transition-all"
        >
          {isNavigating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Opening...
            </>
          ) : "View Resume Template"}
        </button>
      </div>

    </div>
  );
}