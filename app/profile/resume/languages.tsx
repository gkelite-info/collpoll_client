"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, X, Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchResumeLanguages, upsertResumeLanguages } from "@/lib/helpers/student/Resume/resumeLanguagesAPI";
import ResumeLanguagesShimmer from "./ResumeLanguagesShimmer";
import { suggestLanguagesAction, searchLanguagesAction } from "@/lib/helpers/student/ai/Suggestlanguagesaction";
import SuggestedPill from "./KeySkills/SuggestedPill";

const toPascalCase = (str: string) =>
  str.trim().split(" ").filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

type LangSearch = { query: string; results: string[]; loading: boolean; open: boolean };

export default function ResumeLanguages() {
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [initialSelected, setInitialSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { studentId, collegeEducationType, collegeBranchCode } = useUser();

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const [langSearch, setLangSearch] = useState<LangSearch>({
    query: "", results: [], loading: false, open: false,
  });

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangSearch((prev) => ({ ...prev, open: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetchResumeLanguages(studentId)
      .then((langs) => {
        setSelected(langs);
        setInitialSelected(langs);
      })
      .catch(() => toast.error("Failed to load languages"))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!collegeEducationType || !collegeBranchCode) return;
    setLoadingSuggestions(true);
    suggestLanguagesAction(collegeEducationType, collegeBranchCode)
      .then((langs) => setSuggestions(langs))
      .catch(() => { })
      .finally(() => setLoadingSuggestions(false));
  }, [collegeEducationType, collegeBranchCode]);

  const handleSearchChange = (query: string) => {
    setLangSearch((prev) => ({
      ...prev, query, open: true,
      results: query ? prev.results : [],
    }));

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!query.trim()) return;

    searchDebounceRef.current = setTimeout(async () => {
      setLangSearch((prev) => ({ ...prev, loading: true }));
      try {
        const matched = await searchLanguagesAction(query);
        const filtered = matched.filter((s) => !selected.includes(s));
        setLangSearch((prev) => ({
          ...prev, results: filtered, loading: false, open: true,
        }));
      } catch {
        setLangSearch((prev) => ({ ...prev, loading: false }));
      }
    }, 300);
  };

  const addLanguage = (name: string) => {
    const formatted = toPascalCase(name);
    if (selected.includes(formatted)) {
      toast.error("Language already added");
      return;
    }
    setSelected((prev) => [...prev, formatted]);
    setSuggestions((prev) => prev.filter((s) => s !== name && s !== formatted));
    setDismissed((prev) => prev.filter((s) => s !== name && s !== formatted));
  };

  const handleAddFromSearch = (name: string) => {
    addLanguage(name);
    setLangSearch({ query: "", results: [], loading: false, open: false });
  };

  const remove = (lang: string) => {
    setSelected((s) => s.filter((x) => x !== lang));
    setSuggestions((prev) => prev.includes(lang) ? prev : [lang, ...prev]);
    setDismissed((prev) => prev.filter((s) => s !== lang));
  };

  const getSuccessMessage = (nextSelected: string[]) => {
    const hadExistingLanguages = initialSelected.length > 0;
    const hasChanges =
      nextSelected.length !== initialSelected.length ||
      nextSelected.some((lang) => !initialSelected.includes(lang));

    if (hadExistingLanguages && hasChanges) {
      return "Languages updated successfully!";
    }

    return "Languages saved successfully!";
  };

  const persistLanguages = async (): Promise<boolean> => {
    if (!studentId) return false;
    if (selected.length === 0) { toast.error("Select at least one language"); return false; }

    await upsertResumeLanguages(studentId, selected);
    setInitialSelected(selected);
    toast.success(getSuccessMessage(selected));
    return true;
  };

  const saveLanguages = async () => {
    if (isSaving || isNavigating || !studentId) return;
    try {
      setIsSaving(true);
      await persistLanguages();
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSuggestion = (name: string) => {
    setAddingSuggestion(name);
    addLanguage(name);
    setAddingSuggestion(null);
  };

  const handleDismissSuggestion = (name: string) => {
    setSuggestions((prev) => prev.filter((s) => s !== name));
    setDismissed((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  const handleRestoreDismissed = (name: string) => {
    setDismissed((prev) => prev.filter((s) => s !== name));
    setSuggestions((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  if (loading) return <ResumeLanguagesShimmer />;

  const searchResults = langSearch.results.filter((s) => !selected.includes(s));

  return (
    <div className="mt-3 min-h-screen pb-10">
      <div className="bg-white rounded-lg shadow-sm p-8 pb-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#282828] lowercase">languages</h3>
        </div>

        <div className="max-w-xl mx-auto flex flex-col gap-4">
          <div className="border border-[#C0C0C0] rounded-md px-3 py-3 min-h-[50px]">
            <div className="flex flex-wrap gap-2">
              {selected.length === 0 ? (
                <span className="text-sm text-gray-400 italic">No languages selected.</span>
              ) : (
                selected.map((lang) => (
                  <div key={lang} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm text-[#525252]">
                    <span>{lang}</span>
                    <button onClick={() => remove(lang)} className="text-red-500 cursor-pointer">
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-medium text-gray-500 shrink-0">✦ AI Suggestions — click to add</p>
              <div
                className="relative flex-1 max-w-xs"
                ref={dropdownRef}
              >
                <div className="flex items-center gap-1.5 border border-[#C0C0C0] rounded-full px-3 py-1 bg-white focus-within:border-[#43C17A] transition-colors">
                  <MagnifyingGlass size={12} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={langSearch.query}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setLangSearch((prev) => ({ ...prev, open: true }))}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setLangSearch({ query: "", results: [], loading: false, open: false });
                      }
                    }}
                    placeholder="Search languages..."
                    className="flex-1 text-xs text-[#282828] outline-none placeholder:text-gray-300 bg-transparent"
                  />
                  {langSearch.loading && (
                    <span className="text-[10px] text-[#43C17A] animate-pulse shrink-0">...</span>
                  )}
                  {langSearch.query && !langSearch.loading && (
                    <button
                      type="button"
                      onClick={() => setLangSearch({ query: "", results: [], loading: false, open: false })}
                      className="text-gray-300 hover:text-gray-500 cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
                {langSearch.open && langSearch.query.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-lg z-50 max-h-[5.5rem] overflow-y-auto">
                    {langSearch.loading && searchResults.length === 0 && (
                      <div className="px-4 py-3 text-xs text-gray-400 animate-pulse">Finding suggestions...</div>
                    )}
                    {!langSearch.loading && searchResults.length === 0 && (
                      <div className="px-4 py-3 text-xs text-gray-400">No results found</div>
                    )}
                    {searchResults.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddFromSearch(s)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-[#F6FDF9] text-left transition-colors"
                      >
                        <Plus size={13} className="text-[#43C17A] shrink-0" weight="bold" />
                        <span className="text-sm text-[#525252]">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {!langSearch.query && suggestions.filter((s) => !selected.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {suggestions
                  .filter((s) => !selected.includes(s))
                  .map((s) => (
                    <SuggestedPill
                      key={s}
                      label={s}
                      disabled={addingSuggestion === s}
                      onAdd={() => handleAddSuggestion(s)}
                      onDismiss={() => handleDismissSuggestion(s)}
                    />
                  ))}
              </div>
            )}

            {loadingSuggestions && suggestions.length === 0 && (
              <p className="text-xs text-gray-300 animate-pulse">Loading AI suggestions...</p>
            )}
          </div>
          {dismissed.filter((s) => !selected.includes(s)).length > 0 && (
            <div className="mt-2 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-400 mb-2">Dismissed — click to restore</p>
              <div className="flex flex-wrap gap-2">
                {dismissed
                  .filter((s) => !selected.includes(s))
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => handleRestoreDismissed(s)}
                      className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span>+ {s}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={saveLanguages}
              disabled={isSaving || isNavigating}
              className={`px-8 py-2 rounded-md text-sm font-semibold text-white cursor-pointer 
      ${isSaving || isNavigating ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] hover:bg-[#3ba869]"}`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={async () => {
                if (isSaving || isNavigating || !studentId) return;
                if (selected.length === 0) { toast.error("Select at least one language"); return; }
                try {
                  setIsNavigating(true);
                  const success = await persistLanguages();
                  if (!success) return;
                  router.push("/profile?resume=internships&Step=5");
                } catch {
                  toast.error("Something went wrong!");
                } finally {
                  setIsNavigating(false);
                }
              }}
              disabled={isSaving || isNavigating}
              className={`px-5 py-2 rounded-md text-sm font-medium text-white cursor-pointer
      ${isSaving || isNavigating ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A]"}`}
            >
              {isNavigating ? "Saving..." : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
