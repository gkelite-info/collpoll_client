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

type Skill = { resumeSkillId: number; name: string };
type Suggestions = { technical: string[]; soft: string[]; tools: string[] };
type Section = "technical" | "soft" | "tools";
type SectionSearch = { query: string; results: string[]; loading: boolean; open: boolean };

export default function KeySkillsWithModal() {
  const [technical, setTechnical] = useState<Skill[]>([]);
  const [soft, setSoft] = useState<Skill[]>([]);
  const [tools, setTools] = useState<Skill[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Click outside to close dropdown
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
  const { studentId, collegeEducationType, collegeBranchCode } = useUser();

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetchStudentResumeSkills(studentId)
      .then((data) => {
        setTechnical(data.filter((d) => d.category === "Technical Skills"));
        setSoft(data.filter((d) => d.category === "Soft Skills"));
        setTools(data.filter((d) => d.category === "Tools & Frameworks"));
      })
      .catch(() => toast.error("Failed to load skills"))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!collegeEducationType || !collegeBranchCode) return;
    setLoadingSuggestions(true);
    Promise.all([
      suggestSkillsAction(collegeEducationType, collegeBranchCode, "technical"),
      suggestSkillsAction(collegeEducationType, collegeBranchCode, "soft"),
      suggestSkillsAction(collegeEducationType, collegeBranchCode, "tools"),
    ])
      .then(([tech, s, t]) => setSuggestions({ technical: tech, soft: s, tools: t }))
      .catch(() => { })
      .finally(() => setLoadingSuggestions(false));
  }, [collegeEducationType, collegeBranchCode]);

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

        const results = await suggestSkillsAction(
          collegeEducationType ?? "",
          collegeBranchCode ?? "",
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
    if (!studentId) { toast.error("Student not loaded"); return false; }
    const trimmed = value.trim();
    if (!trimmed) return false;

    const existing = section === "technical" ? technical : section === "soft" ? soft : tools;
    if (existing.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Skill already added");
      return false;
    }

    try {
      setSaving(true);
      const newSkill = await createStudentResumeSkill(studentId, section, trimmed);
      if (section === "technical") setTechnical((p) => [...p, newSkill]);
      if (section === "soft") setSoft((p) => [...p, newSkill]);
      if (section === "tools") setTools((p) => [...p, newSkill]);
      return true;
    } catch {
      toast.error("Failed to add skill");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Add directly from search keyword (first option in dropdown)
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

  // Add from dropdown result
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

    if (studentId) {
      deleteStudentResumeSkill(studentId, resumeSkillId).catch(() => {
        toast.error("Failed to remove skill");
        const restoredSkill = { resumeSkillId, name };
        if (section === "technical") setTechnical((p) => [...p, restoredSkill]);
        if (section === "soft") setSoft((p) => [...p, restoredSkill]);
        if (section === "tools") setTools((p) => [...p, restoredSkill]);
        setSuggestions((prev) => ({
          ...prev,
          [section]: prev[section].filter((s) => s !== name),
        }));
      });
    }
  };

  const handleAddSuggestion = async (section: Section, name: string) => {
    setSuggestions((prev) => ({
      ...prev,
      [section]: prev[section].filter((s) => s !== name),
    }));
    setAddingSuggestion(name);
    const success = await handleAdd(section, name);
    if (!success) {
      setSuggestions((prev) => ({ ...prev, [section]: [name, ...prev[section]] }));
    }
    setAddingSuggestion(null);
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

    // Keyword option — show only if not already added and not in results
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

        {/* Pills box */}
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

        {/* AI Suggestions label + Naukri-style search */}
        <div className="mt-2">
          <div className="flex items-center gap-3 mb-1.5">
            <p className="text-xs text-gray-400 shrink-0">✦ AI Suggestions — click to add</p>

            {/* Search with dropdown */}
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

              {/* ── Naukri-style dropdown ── */}
              {search.open && search.query.trim() && (
               <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-lg z-50 max-h-15 overflow-y-auto">

                  {/* First option — add keyword directly */}
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

                  {/* AI search results below */}
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
                      disabled={saving}
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

          {/* Default AI suggestions pills — shown when not searching */}
          {!search.query && sectionSuggestions.length > 0 && (
            <div className="flex flex-wrap">
              {sectionSuggestions.map((s) => (
                <SuggestedPill
                  key={s}
                  label={s}
                  disabled={addingSuggestion === s || saving}
                  onAdd={() => handleAddSuggestion(section, s)}
                />
              ))}
            </div>
          )}

          {loadingSuggestions && suggestions[section].length === 0 && !search.query && (
            <p className="text-xs text-gray-300 animate-pulse">Loading AI suggestions...</p>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="mt-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl font-semibold text-[#282828]">Skills</h3>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setModalOpen(true)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium
                ${saving ? "opacity-50 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer text-white"}`}
            >
              {saving ? "Saving..." : "Add +"}
            </button>
            <button
              onClick={() => router.push("/profile?resume=languages&Step=4")}
              className="bg-[#43C17A] cursor-pointer text-white px-5 py-1.5 rounded-md text-sm"
            >
              Next
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {renderSection("technical", "Technical Skills", technical)}
          {renderSection("soft", "Soft Skills", soft)}
          {renderSection("tools", "Tools & Frameworks", tools)}
        </div>
      </div>

      <AddSkillModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        isLoading={saving}
        defaultSection="technical"
      />
    </div>
  );
}