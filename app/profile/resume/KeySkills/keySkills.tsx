"use client";

import { useEffect, useState, useRef } from "react";
import { MagnifyingGlass, X, Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchStudentResumeSkills,
  createStudentResumeSkill,
  deleteStudentResumeSkill,
} from "@/lib/helpers/student/Resume/resumeSkillsAPI";
import { KeySkillsShimmer } from "./KeySkillsShimmer";
import SuggestedPill from "./SuggestedPill";
import { suggestSkillsAction } from "@/lib/helpers/student/ai/suggestSkillsAction";
import AddSkillModal from "./addSkillModel";
import { resumeMastersEducationAPI, resumePhdEducationAPI, resumePrimaryEducationAPI, resumeSecondaryEducationAPI, resumeUndergraduateEducationAPI } from "@/lib/helpers/student/Resume/Resumeeducationapi";


type Skill = { resumeSkillId: number; name: string };
type Suggestions = { technical: string[]; soft: string[]; tools: string[] };
type Section = "technical" | "soft" | "tools";
type SectionSearch = { query: string; results: string[]; loading: boolean; open: boolean };

export default function KeySkillsWithModal() {
  const [technical, setTechnical] = useState<Skill[]>([]);
  const [soft, setSoft] = useState<Skill[]>([]);
  const [tools, setTools] = useState<Skill[]>([]);
  const [initialSkills, setInitialSkills] = useState<Record<Section, Skill[]>>({
    technical: [],
    soft: [],
    tools: [],
  });
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loading, setLoading] = useState(true);

  // ← NEW: stores student's actual education rows
  const [educationDetails, setEducationDetails] = useState<Record<string, any>[]>([]);

  const [suggestions, setSuggestions] = useState<Suggestions>({
    technical: [],
    soft: [],
    tools: [],
  });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [sectionSearch, setSectionSearch] = useState<Record<Section, SectionSearch>>({
    technical: { query: "", results: [], loading: false, open: false },
    soft: { query: "", results: [], loading: false, open: false },
    tools: { query: "", results: [], loading: false, open: false },
  });

  const searchDebounceRef = useRef<Record<Section, ReturnType<typeof setTimeout> | undefined>>({
    technical: undefined,
    soft: undefined,
    tools: undefined,
  });
  const tempSkillIdRef = useRef(-1);

  const dropdownRefs = useRef<Record<Section, HTMLDivElement | null>>({
    technical: null,
    soft: null,
    tools: null,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      (["technical", "soft", "tools"] as Section[]).forEach((section) => {
        if (
          dropdownRefs.current[section] &&
          !dropdownRefs.current[section]!.contains(e.target as Node)
        ) {
          setSectionSearch((prev) => ({
            ...prev,
            [section]: { ...prev[section], open: false },
          }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const router = useRouter();
  const { studentId } = useUser(); // ← removed collegeEducationType, collegeBranchCode

  // ── Fetch skills + all education levels in one shot ───────────────────────
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      fetchStudentResumeSkills(studentId),
      resumePrimaryEducationAPI.fetch(studentId),
      resumeSecondaryEducationAPI.fetch(studentId),
      resumeUndergraduateEducationAPI.fetch(studentId),
      resumeMastersEducationAPI.fetch(studentId),
      resumePhdEducationAPI.fetch(studentId),
    ])
      .then(([skillsData, primary, secondary, undergrad, masters, phd]) => {
        const nextTechnical = skillsData.filter((d) => d.category === "Technical Skills");
        const nextSoft = skillsData.filter((d) => d.category === "Soft Skills");
        const nextTools = skillsData.filter((d) => d.category === "Tools & Frameworks");

        setTechnical(nextTechnical);
        setSoft(nextSoft);
        setTools(nextTools);
        setInitialSkills({
          technical: nextTechnical,
          soft: nextSoft,
          tools: nextTools,
        });

        // Only keep levels the student has actually filled in
        const edu = [primary, secondary, undergrad, masters, phd]
          .filter((e) => e.success && e.data)
          .map((e) => e.data);
        setEducationDetails(edu);
      })
      .catch(() => toast.error("Failed to load skills"))
      .finally(() => setLoading(false));
  }, [studentId]);

  // ── Trigger AI suggestions once education data is ready ───────────────────
  useEffect(() => {
    if (!educationDetails.length) return;
    setLoadingSuggestions(true);
    Promise.all([
      suggestSkillsAction(educationDetails, "technical"),
      suggestSkillsAction(educationDetails, "soft"),
      suggestSkillsAction(educationDetails, "tools"),
    ])
      .then(([tech, s, t]) => setSuggestions({ technical: tech, soft: s, tools: t }))
      .catch(() => {})
      .finally(() => setLoadingSuggestions(false));
  }, [educationDetails]);

  const handleSearchChange = (section: Section, query: string) => {
    setSectionSearch((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        query,
        open: true,
        results: query ? prev[section].results : [],
      },
    }));

    if (searchDebounceRef.current[section]) {
      clearTimeout(searchDebounceRef.current[section]);
    }

    if (!query.trim()) return;

    searchDebounceRef.current[section] = setTimeout(async () => {
      setSectionSearch((prev) => ({
        ...prev,
        [section]: { ...prev[section], loading: true },
      }));
      try {
        const strictContext = `IMPORTANT: The student typed "${query}". 
Return ONLY skills whose name contains or is directly related to "${query}". 
Do NOT return random branch skills. Every single skill in the array must be related to "${query}".
Category must stay as ${section === "technical" ? "Technical Skills only" : section === "soft" ? "Soft Skills only" : "Tools & Frameworks only"}.`;

        // ← now passes educationDetails instead of educationType + branchCode
        const results = await suggestSkillsAction(
          educationDetails,
          section,
          strictContext
        );

        const filtered = results.filter((r) =>
          r.toLowerCase().includes(query.toLowerCase())
        );

        setSectionSearch((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            results: filtered.length > 0 ? filtered : results,
            loading: false,
            open: true,
          },
        }));
      } catch {
        setSectionSearch((prev) => ({
          ...prev,
          [section]: { ...prev[section], loading: false },
        }));
      }
    }, 500);
  };

  const handleAdd = async (section: Section, value: string): Promise<boolean> => {
    const trimmed = value.trim();
    if (!trimmed) return false;

    const existing = section === "technical" ? technical : section === "soft" ? soft : tools;
    if (existing.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Skill already added");
      return false;
    }

    const newSkill = {
      resumeSkillId: tempSkillIdRef.current--,
      name: trimmed,
    };

    if (section === "technical") setTechnical((p) => [...p, newSkill]);
    if (section === "soft") setSoft((p) => [...p, newSkill]);
    if (section === "tools") setTools((p) => [...p, newSkill]);
    return true;
  };

  const handleAddKeyword = async (section: Section) => {
    const query = sectionSearch[section].query.trim();
    if (!query) return;
    const success = await handleAdd(section, query);
    if (success) {
      setSectionSearch((prev) => ({
        ...prev,
        [section]: { query: "", results: [], loading: false, open: false },
      }));
    }
  };

  const handleAddFromSearch = async (section: Section, name: string) => {
    setSectionSearch((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        results: prev[section].results.filter((r) => r !== name),
        open: false,
        query: "",
      },
    }));
    setSuggestions((prev) => ({
      ...prev,
      [section]: prev[section].filter((s) => s !== name),
    }));
    await handleAdd(section, name);
  };

  const handleRemove = (section: Section, resumeSkillId: number, name: string) => {
    if (section === "technical") setTechnical((p) => p.filter((s) => s.resumeSkillId !== resumeSkillId));
    if (section === "soft") setSoft((p) => p.filter((s) => s.resumeSkillId !== resumeSkillId));
    if (section === "tools") setTools((p) => p.filter((s) => s.resumeSkillId !== resumeSkillId));

    setSuggestions((prev) => ({
      ...prev,
      [section]: prev[section].includes(name) ? prev[section] : [name, ...prev[section]],
    }));
  };

  const handleAddSuggestion = async (section: Section, name: string) => {
    setSuggestions((prev) => ({
      ...prev,
      [section]: prev[section].filter((s) => s !== name),
    }));
    setAddingSuggestion(name);
    const success = handleAdd(section, name);
    if (!success) {
      setSuggestions((prev) => ({ ...prev, [section]: [name, ...prev[section]] }));
    }
    setAddingSuggestion(null);
  };

  const reloadSkills = async () => {
    if (!studentId) return;
    const skillsData = await fetchStudentResumeSkills(studentId);
    const nextTechnical = skillsData.filter((d) => d.category === "Technical Skills");
    const nextSoft = skillsData.filter((d) => d.category === "Soft Skills");
    const nextTools = skillsData.filter((d) => d.category === "Tools & Frameworks");

    setTechnical(nextTechnical);
    setSoft(nextSoft);
    setTools(nextTools);
    setInitialSkills({
      technical: nextTechnical,
      soft: nextSoft,
      tools: nextTools,
    });
  };

  const syncSkills = async (navigateAfterSave: boolean) => {
    if (!studentId) {
      toast.error("Student not loaded");
      return;
    }

    const sections: Section[] = ["technical", "soft", "tools"];
    const currentSkills: Record<Section, Skill[]> = {
      technical,
      soft,
      tools,
    };

    try {
      if (navigateAfterSave) {
        setIsNavigating(true);
      } else {
        setIsSavingChanges(true);
      }

      for (const section of sections) {
        const initialByName = new Map(
          initialSkills[section].map((skill) => [skill.name.toLowerCase(), skill])
        );
        const currentByName = new Map(
          currentSkills[section].map((skill) => [skill.name.toLowerCase(), skill])
        );

        const removedSkills = initialSkills[section].filter(
          (skill) => !currentByName.has(skill.name.toLowerCase())
        );
        const addedSkills = currentSkills[section].filter(
          (skill) => !initialByName.has(skill.name.toLowerCase())
        );

        await Promise.all(
          removedSkills.map((skill) =>
            deleteStudentResumeSkill(studentId, skill.resumeSkillId)
          )
        );

        await Promise.all(
          addedSkills.map((skill) =>
            createStudentResumeSkill(studentId, section, skill.name)
          )
        );
      }

      await reloadSkills();
      toast.success("Key skills saved successfully");

      if (navigateAfterSave) {
        router.push("/profile?resume=languages&Step=4");
      }
    } catch {
      toast.error("Failed to save key skills");
    } finally {
      setIsSavingChanges(false);
      setIsNavigating(false);
    }
  };

  if (loading) return <KeySkillsShimmer />;

  const addedNames = {
    technical: technical.map((s) => s.name),
    soft: soft.map((s) => s.name),
    tools: tools.map((s) => s.name),
  };

  const renderSection = (section: Section, label: string, skills: Skill[]) => {
    const search = sectionSearch[section];
    const sectionSuggestions = suggestions[section].filter(
      (s) => !addedNames[section].includes(s)
    );
    const searchResults = search.results.filter(
      (s) => !addedNames[section].includes(s)
    );

    const keywordNotAdded =
      search.query.trim() &&
      !addedNames[section].some(
        (n) => n.toLowerCase() === search.query.trim().toLowerCase()
      );

    return (
      <section key={section} className="relative">
        <div className="mb-3">
          <h4 className="text-lg text-[#43C17A] font-medium">{label}</h4>
        </div>

        <div className="rounded-md border border-[#C0C0C0] p-3 min-h-[52px] flex flex-wrap items-center gap-2">
          {skills.map((skill) => (
            <span
              key={skill.resumeSkillId}
              className="inline-flex items-center gap-1.5 border border-[#C0C0C0] rounded-full px-3 py-1 text-sm text-[#525252]"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => handleRemove(section, skill.resumeSkillId, skill.name)}
                className="text-red-400 hover:text-red-500 transition-colors cursor-pointer leading-none"
              >
                <X size={12} weight="bold" />
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <span className="text-sm text-gray-400">
              No {label.toLowerCase()} added yet. Click a suggestion below to add.
            </span>
          )}
        </div>

        <div className="mt-2">
          <div className="flex items-center gap-3 mb-1.5">
            <p className="text-xs text-gray-400 shrink-0">✦ AI Suggestions — click to add</p>

            <div
              className="relative flex-1 max-w-xs"
              ref={(el) => { dropdownRefs.current[section] = el; }}
            >
              <div className="flex items-center gap-1.5 border border-[#A0A0A0] rounded-full px-3 py-1 bg-white focus-within:border-[#43C17A] transition-colors">
                <MagnifyingGlass size={12} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search.query}
                  onChange={(e) => handleSearchChange(section, e.target.value)}
                  onFocus={() =>
                    setSectionSearch((prev) => ({
                      ...prev,
                      [section]: { ...prev[section], open: true },
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && search.query.trim()) {
                      e.preventDefault();
                      handleAddKeyword(section);
                    }
                    if (e.key === "Escape") {
                      setSectionSearch((prev) => ({
                        ...prev,
                        [section]: { ...prev[section], open: false, query: "", results: [] },
                      }));
                    }
                  }}
                  placeholder={`Search ${label}...`}
                  className="flex-1 text-xs text-[#282828] outline-none placeholder:text-gray-300 bg-transparent"
                />
                {search.loading && (
                  <span className="text-[10px] text-[#43C17A] animate-pulse shrink-0">...</span>
                )}
                {search.query && !search.loading && (
                  <button
                    type="button"
                    onClick={() =>
                      setSectionSearch((prev) => ({
                        ...prev,
                        [section]: { query: "", results: [], loading: false, open: false },
                      }))
                    }
                    className="text-gray-300 hover:text-gray-500 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>

              {search.open && search.query.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {keywordNotAdded && (
                    <button
                      type="button"
                      onClick={() => handleAddKeyword(section)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-[#F6FDF9] text-left border-b border-gray-100 transition-colors"
                    >
                      <Plus size={13} className="text-[#43C17A] shrink-0" weight="bold" />
                      <span className="text-sm text-[#282828] font-medium">
                        Add "<span className="text-[#43C17A]">{search.query.trim()}</span>"
                      </span>
                    </button>
                  )}
                  {search.loading && searchResults.length === 0 && (
                    <div className="px-4 py-3 text-xs text-gray-400 animate-pulse">
                      Finding suggestions...
                    </div>
                  )}
                  {!search.loading && searchResults.length === 0 && !keywordNotAdded && (
                    <div className="px-4 py-3 text-xs text-gray-400">
                      No results found
                    </div>
                  )}
                  {searchResults.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={isSavingChanges || isNavigating}
                      onClick={() => handleAddFromSearch(section, s)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-[#F6FDF9] text-left transition-colors disabled:opacity-50"
                    >
                      <Plus size={13} className="text-[#43C17A] shrink-0" weight="bold" />
                      <span className="text-sm text-[#525252]">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!search.query && sectionSuggestions.length > 0 && (
            <div className="flex flex-wrap">
              {sectionSuggestions.map((s) => (
                <SuggestedPill
                  key={s}
                  label={s}
                  disabled={addingSuggestion === s || isSavingChanges || isNavigating}
                  onAdd={() => handleAddSuggestion(section, s)}
                />
              ))}
            </div>
          )}

          {loadingSuggestions && suggestions[section].length === 0 && !search.query && (
            <p className="text-xs text-[#43C17A] animate-pulse font-medium">Loading Suggestions...</p>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="mt-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {renderSection("technical", "Technical Skills", technical)}
          {renderSection("soft", "Soft Skills", soft)}
          {renderSection("tools", "Tools & Frameworks", tools)}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => syncSkills(false)}
            disabled={isSavingChanges || isNavigating}
            className={`bg-[#43C17A] text-white px-5 py-1.5 rounded-md text-sm ${isSavingChanges || isNavigating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isSavingChanges ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => syncSkills(true)}
            disabled={isSavingChanges || isNavigating}
            className={`bg-[#43C17A] text-white px-5 py-1.5 rounded-md text-sm ${isSavingChanges || isNavigating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isNavigating ? "Saving..." : "Next"}
          </button>
        </div>
      </div>

      <AddSkillModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        isLoading={isSavingChanges || isNavigating}
        defaultSection="technical"
      />
    </div>
  );
}
