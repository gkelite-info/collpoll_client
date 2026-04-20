"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ResumeTemplateSelector from "../resume/Resumetemplateselector ";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";

import {
  upsertProfileSummary,
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
import { fetchAllResumeData, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";
import { calculateATSScore } from "@/lib/helpers/student/Resume/atsScoreCalculator";

type Tab = "personal" | "keyskills";

function buildProfileParagraphFromResumeData(data: ResumeData): string {
  const parts: string[] = [];

  if (data.summary?.trim()) {
    parts.push(data.summary.trim());
  }

  if (data.personal) {
    const workStatus =
      data.personal.workStatus === "experienced"
        ? "an experienced professional"
        : "a fresher";
    parts.push(
      `${data.personal.fullName} is ${workStatus} based in ${data.personal.currentCity}.`
    );
  }

  if (data.education.length > 0) {
    const eduLevels = data.education
      .map((e) => {
        if (e.educationLevel === "primary") return `schooling at ${e.institutionName}`;
        if (e.educationLevel === "secondary") return `intermediate at ${e.institutionName}`;
        if (e.educationLevel === "undergraduate") {
          return `${e.courseName || "UG"} from ${e.institutionName}${e.cgpa ? ` (CGPA: ${e.cgpa})` : e.percentage ? ` (${e.percentage}%)` : ""}`;
        }
        if (e.educationLevel === "masters") {
          return `${e.courseName || "Masters"} from ${e.institutionName}${e.cgpa ? ` (CGPA: ${e.cgpa})` : ""}`;
        }
        if (e.educationLevel === "phd") {
          return `PhD from ${e.institutionName}${e.specialization ? ` in ${e.specialization}` : ""}`;
        }
        return null;
      })
      .filter(Boolean);

    if (eduLevels.length > 0) {
      parts.push(`Educational background includes ${eduLevels.join(", ")}.`);
    }
  }

  if (data.languages.length > 0) {
    parts.push(`Proficient in ${data.languages.join(", ")}.`);
  }

  if (data.internships.length > 0) {
    const internshipList = data.internships
      .map((internship) => `${internship.role} at ${internship.organizationName.trim()}${internship.domain ? ` (${internship.domain})` : ""}`)
      .join("; ");
    parts.push(`Internship experience includes ${internshipList}.`);
  }

  if (data.projects.length > 0) {
    const projectList = data.projects
      .map((project) => `${project.projectName}${project.toolsAndTechnologies?.length ? ` (${project.toolsAndTechnologies.join(", ")})` : ""}`)
      .join("; ");
    parts.push(`Projects include ${projectList}.`);
  }

  if (data.certifications.length > 0) {
    parts.push(
      `Certified in ${data.certifications.map((certification) => certification.certificationName).join(", ")}.`
    );
  }

  if (data.awards.length > 0) {
    parts.push(
      `Accomplishments include ${data.awards.map((award) => `${award.awardName} (by ${award.issuedBy.trim()})`).join(", ")}.`
    );
  }

  if (data.clubs.length > 0) {
    parts.push(`Active in ${data.clubs.map((club) => `${club.clubName} as ${club.role}`).join(", ")}.`);
  }

  if (data.exams.length > 0) {
    parts.push(`Competitive exams: ${data.exams.map((exam) => `${exam.examName} - ${exam.score}`).join(", ")}.`);
  }

  if (data.achievements.length > 0) {
    parts.push(
      `Academic achievements include ${data.achievements.map((achievement) => achievement.achievementName).join(", ")}.`
    );
  }

  if (data.employment.length > 0) {
    parts.push(
      `Employment experience includes ${data.employment.map((job) => `${job.designation} at ${job.companyName}`).join(", ")}.`
    );
  }

  return Array.from(new Set(parts.filter(Boolean))).join(" ");
}

// ─── Build paragraph from all 16 tables data ──────────────────────────────────
function buildProfileParagraphFromAllData(data: any): string {
  const parts: string[] = [];

  // Personal details
  if (data?.personalDetails) {
    const p = data.personalDetails;
    const workStatus = p.workStatus === "experienced" ? "an experienced professional" : "a fresher";
    parts.push(`${p.fullName} is ${workStatus} based in ${p.currentCity}.`);
  }

  // Education
  if (data?.education?.length > 0) {
    const eduLevels = data.education
      .filter((e: any) => !e.is_deleted)
      .map((e: any) => {
        if (e.educationLevel === "primary") return `schooling at ${e.institutionName}`;
        if (e.educationLevel === "secondary") return `intermediate at ${e.institutionName}`;
        if (e.educationLevel === "undergraduate") return `${e.courseName || "UG"} from ${e.institutionName}${e.cgpa ? ` (CGPA: ${e.cgpa})` : e.percentage ? ` (${e.percentage}%)` : ""}`;
        if (e.educationLevel === "masters") return `${e.courseName || "Masters"} from ${e.institutionName}${e.cgpa ? ` (CGPA: ${e.cgpa})` : ""}`;
        if (e.educationLevel === "phd") return `PhD from ${e.institutionName}${e.researchArea ? ` in ${e.researchArea}` : ""}`;
        return null;
      })
      .filter(Boolean);
    if (eduLevels.length > 0) {
      parts.push(`Educational background includes ${eduLevels.join(", ")}.`);
    }
  }

  // Technical skills
  if (data?.skills?.technical?.length > 0) {
    parts.push(`Technical skills include ${data.skills.technical.map((s: any) => s.name).join(", ")}.`);
  }

  // Tools & Frameworks
  if (data?.skills?.tools?.length > 0) {
    parts.push(`Tools and frameworks expertise covers ${data.skills.tools.map((s: any) => s.name).join(", ")}.`);
  }

  // Soft skills
  if (data?.skills?.soft?.length > 0) {
    parts.push(`Soft skills encompass ${data.skills.soft.map((s: any) => s.name).join(", ")}.`);
  }

  // Languages
  if (data?.languages?.languageNames?.length > 0) {
    parts.push(`Proficient in ${data.languages.languageNames.join(", ")}.`);
  }

  // Internships
  if (data?.internships?.length > 0) {
    const active = data.internships.filter((i: any) => !i.is_deleted);
    if (active.length > 0) {
      const list = active.map((i: any) => `${i.role} at ${i.organizationName.trim()}${i.domain ? ` (${i.domain})` : ""}`).join("; ");
      parts.push(`Internship experience includes ${list}.`);
    }
  }

  // Projects
  if (data?.projects?.length > 0) {
    const active = data.projects.filter((p: any) => !p.isdeleted);
    if (active.length > 0) {
      const list = active.map((p: any) => `${p.projectName}${p.toolsAndTechnologies?.length > 0 ? ` (${p.toolsAndTechnologies.join(", ")})` : ""}`).join("; ");
      parts.push(`Projects include ${list}.`);
    }
  }

  // Certifications
  if (data?.certifications?.length > 0) {
    const active = data.certifications.filter((c: any) => !c.is_deleted);
    if (active.length > 0) {
      parts.push(`Certified in ${active.map((c: any) => c.certificationName).join(", ")}.`);
    }
  }

  // Awards
  if (data?.awards?.length > 0) {
    const active = data.awards.filter((a: any) => !a.is_deleted);
    if (active.length > 0) {
      parts.push(`Accomplishments include ${active.map((a: any) => `${a.awardName} (by ${a.issuedBy.trim()})`).join(", ")}.`);
    }
  }

  // Clubs & Committees
  if (data?.clubs?.length > 0) {
    const active = data.clubs.filter((c: any) => !c.is_deleted);
    if (active.length > 0) {
      parts.push(`Active in ${active.map((c: any) => `${c.clubName} as ${c.role}`).join(", ")}.`);
    }
  }

  // Competitive Exams
  if (data?.competitiveExams?.length > 0) {
    const active = data.competitiveExams.filter((e: any) => !e.is_deleted);
    if (active.length > 0) {
      parts.push(`Competitive exams: ${active.map((e: any) => `${e.examName} — ${e.score}`).join(", ")}.`);
    }
  }

  // Academic Achievements
  if (data?.academicAchievements?.length > 0) {
    const active = data.academicAchievements.filter((a: any) => !a.is_deleted);
    if (active.length > 0) {
      parts.push(`Academic achievements include ${active.map((a: any) => a.achievementName).join(", ")}.`);
    }
  }

  return parts.join(" ");
}

// ─── JD Skill Gap Box ─────────────────────────────────────────────────────────
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
                  <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 cursor-default ${skill.demand === "high" ? "bg-green-50 text-green-700 border-2 border-green-400" : "bg-green-50 text-green-600 border border-green-200"}`}>
                    ✓ {skill.name}
                    {skill.demand === "high" && <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full ml-1">Key</span>}
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
              <p className="text-[11px] text-gray-400 mb-3">These are in your skill master but not yet on your resume. Select to add them.</p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.filter(s => s.demand === "high").length > 0 && (
                  <>
                    <p className="w-full text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">🔥 High Demand</p>
                    {suggestedSkills.filter(s => s.demand === "high").map((skill) => {
                      const isSelected = selectedSkillIds.has(skill.resumeSkillId);
                      return (
                        <button key={skill.resumeSkillId} onClick={() => onToggle(skill.resumeSkillId)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1 cursor-pointer ${isSelected ? "bg-[#16284F] text-white border-[#16284F]" : "bg-white text-red-600 border-red-300 hover:border-red-500"}`}>
                          {isSelected ? "✓" : "+"} {skill.name}
                        </button>
                      );
                    })}
                  </>
                )}
                {suggestedSkills.filter(s => s.demand === "medium").length > 0 && (
                  <>
                    <p className="w-full text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 mt-2">⭐ Recommended</p>
                    {suggestedSkills.filter(s => s.demand === "medium").map((skill) => {
                      const isSelected = selectedSkillIds.has(skill.resumeSkillId);
                      return (
                        <button key={skill.resumeSkillId} onClick={() => onToggle(skill.resumeSkillId)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1 cursor-pointer ${isSelected ? "bg-[#16284F] text-white border-[#16284F]" : "bg-white text-amber-700 border-amber-300 hover:border-amber-500"}`}>
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
              <p className="text-[11px] text-gray-400 mb-3">The JD demands these. Consider learning them to strengthen your profile.</p>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, i) => {
                  const isSelected = selectedMissingSkills.has(skill.name);
                  return (
                    <button key={i} onClick={() => onToggleMissing(skill.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 flex items-center gap-1 cursor-pointer transition-all ${isSelected ? "bg-[#16284F] text-white border-[#16284F]" : skill.demand === "high" ? "bg-orange-50 text-orange-600 border-orange-300 hover:border-orange-500" : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:border-yellow-400"}`}>
                      {isSelected ? "✓" : "🎯"} {skill.name}
                      {skill.demand === "high" && !isSelected && (
                        <span className="text-[9px] bg-orange-400 text-white px-1.5 py-0.5 rounded-full ml-1">Must Have</span>
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

// ─── Profile Summary Box (shows 16 tables paragraph) ─────────────────────────
interface ProfileSummaryBoxProps {
  editableSummary: string;
  onChange: (v: string) => void;
  onSave: () => void;
  isSaving: boolean;
  atsScore: number | null;
  atsLoading: boolean;
  selectedSummaryIdx: number | null;
  profileDataLoading: boolean;
  // NEW: Generate with AI button props
  onGenerate: () => void;
  isGenerating: boolean;
}

function ProfileSummaryBox({
  editableSummary,
  onChange,
  onSave,
  isSaving,
  atsScore,
  atsLoading,
  selectedSummaryIdx,
  profileDataLoading,
  onGenerate,
  isGenerating,
}: ProfileSummaryBoxProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-[#16284F] uppercase tracking-widest">
            Profile Data — 16 Tables
          </p>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
            Fetched
          </span>
          {atsLoading && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Calculating ATS…
            </div>
          )}
          {atsScore !== null && !atsLoading && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
              atsScore >= 75 ? "bg-green-50 text-green-700 border-green-300"
              : atsScore >= 50 ? "bg-amber-50 text-amber-700 border-amber-300"
              : "bg-red-50 text-red-600 border-red-300"
            }`}>
              <span>ATS Score</span>
              <span className="text-sm font-black">{atsScore}/100</span>
              <span>{atsScore >= 75 ? "✅" : atsScore >= 50 ? "⚠️" : "❌"}</span>
            </div>
          )}
        </div>

        {/* Generate with AI button — moved here from JDSummaryBox */}
        <button
          onClick={onGenerate}
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
          ) : "Generate with AI ↗"}
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {profileDataLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <svg className="animate-spin h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading profile data from 16 tables…
          </div>
        ) : (
          <textarea
            value={editableSummary}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your profile data from 16 tables will appear here…"
            rows={6}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none text-sm text-gray-600 resize-none placeholder-gray-400 focus:border-[#16284F] transition-colors"
          />
        )}
        <div className="flex justify-end mt-3">
          <button
            onClick={onSave}
            disabled={isSaving || !editableSummary.trim() || profileDataLoading}
            className="text-white text-sm font-semibold px-6 py-2.5 rounded-lg bg-[#2ecc8a] hover:bg-[#27b87a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 transition-all"
          >
            {isSaving && selectedSummaryIdx === -1 ? (
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
    </div>
  );
}

// ─── JD-Based Summary Suggestions Box ────────────────────────────────────────
interface JDSummaryBoxProps {
  jobDescription: string;
  onJDChange: (v: string) => void;
  isGenerating: boolean;
  aiSummaries: string[];
  selectedSummaryIdx: number | null;
  isSavingSummary: boolean;
  atsScore: number | null;
  onUseSummary: (summary: string, idx: number) => void;
}

function JDSummaryBox({
  jobDescription,
  onJDChange,
  isGenerating,
  aiSummaries,
  selectedSummaryIdx,
  isSavingSummary,
  atsScore,
  onUseSummary,
}: JDSummaryBoxProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-[#16284F] uppercase tracking-widest">JD-Based Summary Suggestions</p>
          <span className="text-[10px] bg-[#EEEDFE] text-[#3C3489] px-2 py-0.5 rounded-full font-semibold border border-purple-200">AI Powered</span>
        </div>
      </div>
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-gray-500 font-medium mb-2">Paste job description</p>
        <textarea
          value={jobDescription}
          onChange={(e) => onJDChange(e.target.value)}
          placeholder="💡 Paste a job description to get a targeted summary + skill recommendations."
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none text-sm text-gray-600 resize-none placeholder-gray-400 focus:border-[#16284F] transition-colors"
        />
        <p className="text-[11px] text-gray-400 mt-1">{jobDescription.length} characters</p>
        {/* Generate button removed from here — now lives in ProfileSummaryBox header */}
      </div>

      {aiSummaries.length > 0 && (
        <div className="px-5 pb-5 flex flex-col gap-3 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 bg-[#EDE1FE] border border-[#c4a8fc] rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-[#6b5cff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-[#4c3d9e] font-semibold">
              <span className="font-black text-[#16284F]">5 AI-Suggested Summaries — Select the one that best fits you.</span>
            </p>
          </div>

          {atsScore !== null && (
            <div className="flex items-center gap-3 flex-wrap bg-gradient-to-r from-[#faf7ff] to-[#f0fdf7] border border-purple-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-semibold">Before AI</span>
                <span className={`text-sm font-black px-2.5 py-1 rounded-full ${atsScore >= 75 ? "bg-green-100 text-green-700" : atsScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>{atsScore}/100</span>
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
            <div key={idx} className={`rounded-xl p-5 border-2 transition-all ${selectedSummaryIdx === idx ? "border-[#2ecc8a] bg-[#f0fdf7]" : "border-gray-100 bg-white shadow-sm"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2 items-start flex-1">
                  <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-[#16284F] text-white text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
                </div>
                <button
                  onClick={() => onUseSummary(summary, idx)}
                  disabled={isSavingSummary}
                  className={`shrink-0 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed ${selectedSummaryIdx === idx ? "bg-[#16a85a]" : "bg-[#2ecc8a] hover:bg-[#27b87a]"} disabled:opacity-60`}
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
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
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

  // ── State ──
  const [profileDataLoading, setProfileDataLoading] = useState(true);
  const [editableSummary, setEditableSummary] = useState("");
  const [resumeSummaryId, setResumeSummaryId] = useState<number | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummaries, setAiSummaries] = useState<string[]>([]);
  const [selectedSummaryIdx, setSelectedSummaryIdx] = useState<number | null>(null);
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  const [groupedSkills, setGroupedSkills] = useState<GroupedSkills[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<number>>(new Set());
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [skillsJD, setSkillsJD] = useState("");
  const [hasEditedSkillsJD, setHasEditedSkillsJD] = useState(false);

  const showSuccessToast = (message: string) =>
    toast.success(message, { duration: 3000 });

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

  // ── Fetch all 16 tables → build paragraph ──
  useEffect(() => {
    if (!studentId) return;
    setProfileDataLoading(true);

    Promise.all([
      fetchAllResumeData(studentId),
      getStudentResumeSkillIds(studentId),
    ])
      .then(([resumeData, savedIds]) => {
        // ATS score from full profile
        const score = calculateATSScore(resumeData);
        sessionStorage.setItem("ats_before_score", JSON.stringify(score));
        setAtsScore(score?.total ?? score ?? null);

        // Build paragraph from all 16 tables and set it as the editable summary
        const paragraph = buildProfileParagraphFromResumeData(resumeData);
        setEditableSummary(paragraph);

        // Capture existing resume summary row if available
        if (resumeData.resumeSummaryId) {
          setResumeSummaryId(resumeData.resumeSummaryId);
        }

        setSelectedSkillIds(new Set(savedIds));
      })
      .catch(() => toast.error("Failed to load profile data."))
      .finally(() => setProfileDataLoading(false));
  }, [studentId]);

  // ── Load grouped skills for Key Skills tab ──
  useEffect(() => {
    if (!studentId) return;
    setSkillsLoading(true);
    getGroupedSkills()
      .then((grouped) => setGroupedSkills(grouped))
      .catch(() => toast.error("Failed to load skills."))
      .finally(() => setSkillsLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (hasEditedSkillsJD) return;

    const nextSkillsText = jobDescription.trim() ? jobDescription : editableSummary;
    setSkillsJD(nextSkillsText);
  }, [jobDescription, editableSummary, hasEditedSkillsJD]);

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

  // ── Skill gap helper ──
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
        groupedSkills.flatMap((g) => g.skills.map((s) => [s.name.toLowerCase(), s]))
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

  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);

    if (!hasEditedSkillsJD) {
      setSkillsJD(value.trim() ? value : editableSummary);
    }
  };

  // ── Generate summaries ──
  const handleGenerateSummaries = async () => {
    if (!studentId) return;
    setIsGenerating(true);
    setAiSummaries([]);
    setSelectedSummaryIdx(null);
    try {
      const [summaries] = await Promise.all([
        generateFiveProfileSummaries(studentId, jobDescription),
        processSkillGap(jobDescription, setJdMatchingSkillsTab, setJdSuggestedSkillsTab, setJdMissingSkillsTab, setIsGeneratingGapTab),
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

  // ── Use AI summary ──
  const handleUseSummary = async (summary: string, idx: number) => {
    if (!studentId) return;
    setSelectedSummaryIdx(idx);
    setIsSavingSummary(true);
    try {
      const isUpdating = Boolean(resumeSummaryId);
      if (isUpdating) {
        await updateProfileSummary(studentId, summary);
      } else {
        const result = await upsertProfileSummary(studentId, summary);
        setResumeSummaryId(result.resumeSummaryId);
      }
      setEditableSummary(summary);
      showSuccessToast(
        isUpdating
          ? "Profile summary updated successfully!"
          : "Profile summary saved successfully!"
      );
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

  // ── Manual save ──
  const handleManualSave = async () => {
    if (!editableSummary.trim() || !studentId) return;
    setIsSavingSummary(true);
    setSelectedSummaryIdx(-1);
    try {
      const isUpdating = Boolean(resumeSummaryId);
      if (isUpdating) {
        await updateProfileSummary(studentId, editableSummary.trim());
      } else {
        const result = await upsertProfileSummary(studentId, editableSummary.trim());
        setResumeSummaryId(result.resumeSummaryId);
      }
      showSuccessToast(
        isUpdating
          ? "Profile summary updated successfully!"
          : "Profile summary saved successfully!"
      );
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
        await Promise.all(Array.from(selectedMissingSkills).map((name) => createStudentResumeSkill(studentId, "technical", name)));
        setSelectedMissingSkills(new Set());
      }
      if (selectedMissingSkillsTab.size > 0) {
        await Promise.all(Array.from(selectedMissingSkillsTab).map((name) => createStudentResumeSkill(studentId, "technical", name)));
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
    const sourceText = skillsJD.trim() || jobDescription.trim() || editableSummary.trim();

    if (!sourceText) {
      toast.error("Please paste a job description first.");
      return;
    }

    if (skillsJD !== sourceText) {
      setSkillsJD(sourceText);
    }

    setIsGeneratingSkills(true);
    await processSkillGap(sourceText, setJdMatchingSkillsTab, setJdSuggestedSkillsTab, setJdMissingSkillsTab, setIsGeneratingGapTab);
    setIsGeneratingSkills(false);
  };

  // ── RENDER ──
  return (
    <div className="p-6 bg-[#FFFFFF] min-h-screen rounded-xl">
      {/* Back button */}
      <button
        onClick={() => router.push("/profile?resume=profile-summary&Step=10")}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors mb-4"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Tab buttons */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setActiveTab("personal")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "personal" ? "bg-[#16284F] text-white" : "bg-[#eef1f7] text-gray-600 hover:bg-[#e2e6f0]"}`}>
          Personal Details
        </button>
        <button onClick={() => setActiveTab("keyskills")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "keyskills" ? "bg-[#16284F] text-white" : "bg-[#eef1f7] text-gray-600 hover:bg-[#e2e6f0]"}`}>
          Key Skills
        </button>
      </div>

      {/* ── PERSONAL DETAILS TAB ── */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-2xl p-6 max-w-4xl">
          <div className="mb-5">
            <div style={{ background: "linear-gradient(90deg, #F1E7FE 0%, #D4BEFF 100%)" }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#6b5cff]">
              <Image src="/AI Robot.png" alt="AI" width={40} height={40} />
              AI Assistance
            </div>
          </div>

          {/* Profile Data 16 Tables → paragraph in textarea + Generate with AI button in header */}
          <ProfileSummaryBox
            editableSummary={editableSummary}
            onChange={setEditableSummary}
            onSave={handleManualSave}
            isSaving={isSavingSummary}
            atsScore={atsScore}
            atsLoading={atsLoading}
            selectedSummaryIdx={selectedSummaryIdx}
            profileDataLoading={profileDataLoading}
            onGenerate={handleGenerateSummaries}
            isGenerating={isGenerating}
          />

          {/* JD-Based Summary Suggestions — Generate button removed from here */}
          <JDSummaryBox
            jobDescription={jobDescription}
            onJDChange={handleJobDescriptionChange}
            isGenerating={isGenerating}
            aiSummaries={aiSummaries}
            selectedSummaryIdx={selectedSummaryIdx}
            isSavingSummary={isSavingSummary}
            atsScore={atsScore}
            onUseSummary={handleUseSummary}
          />

        </div>
      )}

      {/* ── KEY SKILLS TAB ── */}
      {activeTab === "keyskills" && (
        <div className="bg-white rounded-2xl p-6 max-w-4xl">
          <div className="mb-5">
            <div style={{ background: "linear-gradient(90deg, #F1E7FE 0%, #D4BEFF 100%)" }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#6b5cff]">
              <Image src="/AI Robot.png" alt="AI" width={40} height={40} />
              AI Assistance
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
            <textarea
              value={skillsJD}
              onChange={(e) => {
                setHasEditedSkillsJD(true);
                setSkillsJD(e.target.value);
              }}
              placeholder="💡 Paste a job description to get AI-suggested skills."
              className="w-full min-h-[80px] bg-transparent outline-none text-sm text-gray-600 resize-none placeholder-gray-400"
            />
            <p className="text-[11px] text-gray-400 mt-2">
              JD text from Personal Details auto-fills here. If no JD is added, your current professional summary is used.
            </p>
            <div className="flex justify-end mt-4">
              <button onClick={handleSuggestSkillsFromJD} disabled={isGeneratingSkills}
                className="text-[#282828] text-sm font-semibold px-6 py-2.5 rounded-lg shadow bg-[linear-gradient(to_right,#EDE1FE_5%,#D5BFFF_95%)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 hover:opacity-90 transition-opacity">
                {isGeneratingSkills ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Suggesting...</>
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
                <button onClick={handleSaveSkills} disabled={isSavingSkills}
                  className="bg-[#16284F] text-white text-sm font-semibold px-8 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#1d3566] transition-all flex items-center gap-2">
                  {isSavingSkills ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving...</>
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
                        <button key={skill.resumeSkillId} onClick={() => toggleSkill(skill.resumeSkillId)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSelected ? "bg-[#16284F] text-white border-[#16284F]" : "bg-white text-gray-600 border-gray-200 hover:border-[#16284F] hover:text-[#16284F]"}`}>
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
            <button onClick={handleSaveSkills} disabled={isSavingSkills || selectedSkillIds.size === 0}
              className="bg-[#16284F] text-white text-sm font-semibold px-8 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#1d3566] transition-all flex items-center gap-2">
              {isSavingSkills ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving...</>
              ) : "Save Skills"}
            </button>
          </div>
        </div>
      )}

      {/* View Resume Template button */}
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
            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Opening...</>
          ) : "View Resume Template"}
        </button>
      </div>
    </div>
  );
}
