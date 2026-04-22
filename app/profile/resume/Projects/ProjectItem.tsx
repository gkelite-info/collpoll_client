"use client";

import { useState, useRef, useEffect } from "react";
import { Trash, MagnifyingGlass, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import Field from "./Field";
import { upsertResumeProject } from "@/lib/helpers/student/Resume/resumeProjectsAPI";

import { useUser } from "@/app/utils/context/UserContext";
import { useRouter } from "next/navigation";
import { suggestProjectToolsAction } from "@/lib/helpers/student/ai/Suggestprojecttoolsaction ";

export interface ProjectData {
  projectName: string;
  domain: string;
  startDate: string;
  endDate: string;
  tools: string[];
  projectLink: string;
  description: string;
  isSubmitted: boolean;
  dbId?: number;
}

interface Props {
  index: number;
  data: ProjectData;
  onUpdate: (data: ProjectData) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  onClose?: () => void;
}

// ── Sanitizers ────────────────────────────────────────────────────────────────

const sanitizeProjectName = (value: string) =>
  value.replace(/[^a-zA-Z0-9\s\-_().'"]/g, "");

const sanitizeProjectUrl = (value: string) =>
  value.replace(/[^a-zA-Z0-9:/._\-~?#[\]@!$&'()*+,;=%]/g, "");

const sanitizeDate = (value: string): string => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const cappedYear = (year || "").slice(0, 4);
  return [cappedYear, month, day].join("-");
};

// ── Validators ────────────────────────────────────────────────────────────────

const isValidDateString = (val: string): boolean => {
  if (!val || val.trim() === "") return false;
  const parts = val.split("-");
  if (parts.length !== 3) return false;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (yearStr.length !== 4) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const PROJECT_DOMAINS = [
  "Web Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile App Development",
  "Android Development",
  "iOS Development",
  "Data Science",
  "Data Analytics",
  "Machine Learning",
  "Artificial Intelligence",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "DevOps & Cloud",
  "Cloud Computing",
  "Cybersecurity",
  "Software Testing & QA",
  "Embedded Systems",
  "Internet of Things (IoT)",
  "Blockchain",
  "Game Development",
  "Database Administration",
  "Networking & IT Infrastructure",
  "AR / VR Development",
  "UI/UX Design",
  "Graphic Design",
  "Product Design",
  "Motion Graphics",
  "Video Editing",
  "Digital Marketing",
  "Social Media Marketing",
  "Content Marketing",
  "SEO / SEM",
  "Performance Marketing",
  "Finance & Accounting",
  "Financial Analysis",
  "Business Analysis",
  "Product Management",
  "Project Management",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Electronics & Communication",
  "Chemical Engineering",
  "Biotechnology",
  "Research & Development",
  "Education & Teaching",
  "Healthcare",
  "Architecture",
  "Agriculture",
  "Content Writing",
  "Event Management",
];

const isValidUrl = (val: string): boolean => {
  try {
    const url = new URL(val);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// ── FieldLabel ────────────────────────────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="form-label font-medium text-[#282828]">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ── AI Suggestion Loading Skeleton ────────────────────────────────────────────

function AISuggestionSkeleton() {
  const skeletonWidths = [88, 72, 96, 64, 104, 80, 68, 92, 76, 84, 70, 98];
  return (
    <div className="mt-3 p-3 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-4 h-4 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
        </div>
        <div className="h-3 w-36 rounded-full bg-purple-200 animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-2">
        {skeletonWidths.map((w, i) => (
          <div
            key={i}
            className="h-7 rounded-full bg-gradient-to-r from-purple-200 via-violet-200 to-purple-200 animate-pulse"
            style={{ width: `${w}px`, animationDelay: `${i * 80}ms`, animationDuration: "1.4s" }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: "300ms" }} />
        <div className="h-2 w-24 rounded-full bg-purple-200 animate-pulse ml-1" />
      </div>
    </div>
  );
}

// ── Search Skeleton (smaller, for inline search results) ──────────────────────

function SearchSkeleton() {
  const widths = [80, 64, 96, 72, 88, 68];
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-7 rounded-full bg-gradient-to-r from-purple-200 via-violet-200 to-purple-200 animate-pulse"
          style={{ width: `${w}px`, animationDelay: `${i * 70}ms`, animationDuration: "1.2s" }}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProjectItem({
  index,
  data,
  onUpdate,
  onDelete,
  isDeleting,
  onClose,
}: Props) {
  const { studentId } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showOtherDomain, setShowOtherDomain] = useState(false);
  const [otherDomainValue, setOtherDomainValue] = useState("");
  const [openDomain, setOpenDomain] = useState(false);
  const domainRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── AI suggestion state ─────────────────────────────────────────────────────
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // ── Search-inside-suggestions state ────────────────────────────────────────
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dismissedSearchResults, setDismissedSearchResults] = useState<Set<string>>(new Set());

  const canSuggest =
    data.projectName.trim().length >= 2 && data.domain.trim().length >= 2;


  // Auto-close suggestions box when projectName or domain is cleared
  useEffect(() => {
    if (!canSuggest) {
      setAiSuggestions([]);
      setDismissedSuggestions(new Set());
      setShowSearchBar(false);
      setSearchQuery("");
      setSearchResults([]);
      setDismissedSearchResults(new Set());
    }
  }, [canSuggest]);

  const visibleSuggestions = aiSuggestions.filter(
    (s) => !dismissedSuggestions.has(s) && !data.tools.includes(s)
  );

  const visibleSearchResults = searchResults.filter(
    (s) => !dismissedSearchResults.has(s) && !data.tools.includes(s)
  );

  // ── Auto-capitalize each word as user types ─────────────────────────────────
  const toTitleCase = (val: string) =>
    val.replace(/\b\w/g, (c) => c.toUpperCase());

  // ── Trigger search when user stops typing (debounce 600ms) ─────────────────
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      handleSearch(searchQuery.trim());
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Focus search input when search bar opens ────────────────────────────────
  useEffect(() => {
    if (showSearchBar) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSearchBar]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAISuggest = async () => {
    if (!canSuggest) return;
    setIsLoadingAI(true);
    setAiSuggestions([]);
    setDismissedSuggestions(new Set());
    // Reset search state on fresh suggest
    setShowSearchBar(false);
    setSearchQuery("");
    setSearchResults([]);
    setDismissedSearchResults(new Set());
    try {
      const suggestions = await suggestProjectToolsAction(
        data.projectName.trim(),
        data.domain.trim()
      );
      setAiSuggestions(suggestions);
    } catch {
      toast.error("AI suggestions failed. Please try again.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSearch = async (keyword: string) => {
    if (!keyword) return;
    setIsSearching(true);
    setDismissedSearchResults(new Set());
    try {
      // Reuse the same action — pass keyword + domain as context
      const results = await suggestProjectToolsAction(
        keyword,
        data.domain.trim() || "Software Development"
      );
      // Filter out already-suggested or already-added tools
      const fresh = results.filter(
        (s) => !aiSuggestions.includes(s) && !data.tools.includes(s)
      );
      setSearchResults(fresh);
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSuggestion = (tool: string) => {
    if (!data.tools.includes(tool)) {
      onUpdate({ ...data, tools: [...data.tools, tool], isSubmitted: false });
    }
  };

  const handleDismissSuggestion = (tool: string) => {
    setDismissedSuggestions((prev) => new Set([...prev, tool]));
  };

  const handleDismissSearchResult = (tool: string) => {
    setDismissedSearchResults((prev) => new Set([...prev, tool]));
  };

  const handleAddSearchedKeyword = () => {
    const val = searchQuery.trim();
    if (val && !data.tools.includes(val)) {
      onUpdate({ ...data, tools: [...data.tools, val], isSubmitted: false });
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleCloseSearch = () => {
    setShowSearchBar(false);
    setSearchQuery("");
    setSearchResults([]);
    setDismissedSearchResults(new Set());
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const trimmedName = data.projectName.trim();
    const trimmedDomain = data.domain.trim();
    const trimmedLink = data.projectLink.trim();

    if (!trimmedName) { toast.error("Please fill all required fields"); return false; }
    if (trimmedName.length < 2) { toast.error("Project name must be at least 2 characters"); return false; }
    if (trimmedName.length > 100) { toast.error("Project name must not exceed 100 characters"); return false; }
    if (!trimmedDomain) { toast.error("Please fill all required fields"); return false; }
    if (trimmedDomain.length < 2) { toast.error("Domain must be at least 2 characters"); return false; }
    if (!data.startDate) { toast.error("Please fill all required fields"); return false; }
    if (!isValidDateString(data.startDate)) { toast.error("Enter a valid start date (day 1–31, month 1–12, 4-digit year)"); return false; }
    if (data.endDate) {
      if (!isValidDateString(data.endDate)) { toast.error("Enter a valid end date (day 1–31, month 1–12, 4-digit year)"); return false; }
      if (new Date(data.endDate) <= new Date(data.startDate)) { toast.error("End date must be after start date"); return false; }
    }
    if (!data.tools.length) { toast.error("Please fill all required fields"); return false; }
    if (!trimmedLink) { toast.error("Please fill all required fields"); return false; }
    if (!isValidUrl(trimmedLink)) { toast.error("Enter a valid project URL starting with http:// or https://"); return false; }
    return true;
  };

  // ── API Call ────────────────────────────────────────────────────────────────
  const callApi = async (): Promise<boolean> => {
    if (!studentId) { toast.error("Student ID not found. Please refresh."); return false; }
    setIsSaving(true);
    try {
      const result = await upsertResumeProject({
        resumeProjectId: data.dbId,
        studentId,
        projectName: data.projectName.trim(),
        domain: data.domain.trim(),
        startDate: data.startDate,
        endDate: data.endDate || null,
        projectUrl: data.projectLink.trim(),
        toolsAndTechnologies: data.tools,
        description: data.description.trim() || null,
      });
      onUpdate({ ...data, isSubmitted: true, dbId: result.resumeProjectId });
      toast.success(data.dbId ? `Project ${index + 1} updated` : `Project ${index + 1} saved`);
      return true;
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message || "Unknown error"}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await callApi();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving the project.");
    }
  };

  const handleNext = async () => {
    try {
      const isFormEmpty =
        !data.projectName.trim() && !data.domain.trim() && !data.startDate &&
        !data.endDate && !data.tools.length && !data.projectLink.trim() && !data.description.trim();
      if (isFormEmpty) { router.push("/profile?resume=accomplishments&Step=7"); return; }
      if (isFormEmpty) { router.push("/profile?resume=accomplishments"); return; }
      if (!validate()) return;
      const success = await callApi();
      if (success) router.push("/profile?resume=accomplishments&Step=7");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving the project.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (domainRef.current && !domainRef.current.contains(e.target as Node)) {
        setOpenDomain(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-[#282828]">Project {index + 1}</h3>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash size={18} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Project Name | Domain */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <FieldLabel label="Project Name" required />
          <input
            type="text"
            value={data.projectName}
            placeholder="Enter Project Name"
            maxLength={100}
            onChange={(e) =>
              onUpdate({ ...data, projectName: sanitizeProjectName(e.target.value), isSubmitted: false })
            }
            className="border border-[#CCCCCC] text-[#525252] rounded-md px-3 h-10 py-1 focus:outline-none mt-1"
          />
        </div>

        {/* Domain dropdown */}
        <div className="flex flex-col">
          <FieldLabel label="Domain" required />
          <div className="relative mt-1" ref={domainRef}>
            {data.domain && !PROJECT_DOMAINS.includes(data.domain) && !showOtherDomain ? (
              <div className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 flex items-center justify-between min-h-[40px]">
                <div className="flex items-center gap-2 px-2 py-0.5 bg-green-50 border border-[#43C17A] rounded-md">
                  <span className="text-sm text-[#282828]">{data.domain}</span>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...data, domain: "", isSubmitted: false })}
                    className="text-gray-400 hover:text-red-500 text-xs cursor-pointer"
                  >✕</button>
                </div>
                <span className="text-[#525252]">▾</span>
              </div>
            ) : (
              <>
                <div
                  onClick={() => !isSaving && setOpenDomain((prev) => !prev)}
                  className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 text-sm flex justify-between cursor-pointer"
                >
                  <span className="text-[#525252]">{data.domain || "Select domain"}</span>
                  <span className="text-[#525252]">▾</span>
                </div>
                {openDomain && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-52 overflow-y-auto">
                    <div
                      onClick={() => { onUpdate({ ...data, domain: "", isSubmitted: false }); setShowOtherDomain(false); setOpenDomain(false); }}
                      className="px-3 py-2 text-gray-400 hover:bg-gray-100 cursor-pointer"
                    >Select domain</div>
                    {PROJECT_DOMAINS.map((d) => (
                      <div
                        key={d}
                        onClick={() => { onUpdate({ ...data, domain: d, isSubmitted: false }); setShowOtherDomain(false); setOpenDomain(false); }}
                        className={`px-3 py-2 cursor-pointer transition ${data.domain === d ? "bg-green-100 text-green-700 font-medium" : "text-gray-700 hover:bg-gray-100"}`}
                      >{d}</div>
                    ))}
                    <div
                      onClick={() => { setShowOtherDomain(true); setOpenDomain(false); }}
                      className="px-3 py-2 text-green-600 hover:bg-green-50 cursor-pointer font-medium"
                    >+ Other</div>
                  </div>
                )}
              </>
            )}
          </div>
          {showOtherDomain && (
            <div className="flex gap-2 items-center mt-2">
              <input
                autoFocus
                value={otherDomainValue}
                onChange={(e) => setOtherDomainValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = otherDomainValue.trim();
                    if (!val) { toast.error("Please enter a domain before adding."); return; }
                    onUpdate({ ...data, domain: val, isSubmitted: false });
                    setOtherDomainValue(""); setShowOtherDomain(false);
                  }
                }}
                placeholder="Enter domain"
                className="flex-1 h-10 px-3 border border-[#D9D9D9] rounded-md text-sm text-[#525252] focus:outline-none focus:border-[#43C17A]"
              />
              <button
                type="button"
                onClick={() => {
                  const val = otherDomainValue.trim();
                  if (!val) { toast.error("Please enter a domain before adding."); return; }
                  onUpdate({ ...data, domain: val, isSubmitted: false });
                  setOtherDomainValue(""); setShowOtherDomain(false);
                }}
                className="px-4 h-10 bg-[#43C17A] text-white text-sm rounded-md hover:bg-[#16A34A]"
              >Add</button>
              <button
                type="button"
                onClick={() => { setShowOtherDomain(false); setOtherDomainValue(""); }}
                className="px-4 h-10 border border-[#CCCCCC] text-[#525252] text-sm rounded-md hover:bg-[#F5F5F5]"
              >Cancel</button>
            </div>
          )}
        </div>

        {/* Row 2: Start Date | End Date */}
        <div className="flex flex-col">
          <FieldLabel label="Start Date" required />
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => onUpdate({ ...data, startDate: sanitizeDate(e.target.value), isSubmitted: false })}
            className="border border-[#CCCCCC] text-[#525252] rounded-md px-3 h-10 py-1 focus:outline-none cursor-pointer mt-1"
          />
        </div>
        <div className="flex flex-col">
          <FieldLabel label="End Date" />
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => onUpdate({ ...data, endDate: sanitizeDate(e.target.value), isSubmitted: false })}
            disabled={!data.startDate}
            min={data.startDate}
            className={`border border-[#CCCCCC] text-[#525252] rounded-md px-3 h-10 py-1 focus:outline-none cursor-pointer mt-1 ${!data.startDate ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </div>
      </div>

      {/* Row 3: Tools | Project Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col" ref={containerRef}>

          {/* Tools label + AI button */}
          <div className="flex items-center justify-between">
            <FieldLabel label="Tools & Technologies Used" required />
            {canSuggest && (
              <button
                type="button"
                onClick={handleAISuggest}
                disabled={isLoadingAI}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all
                  ${isLoadingAI
                    ? "bg-purple-50 border-purple-200 text-purple-400 cursor-not-allowed"
                    : "bg-white border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 cursor-pointer"
                  }`}
              >
                {isLoadingAI ? (
                  <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <span className="text-purple-500 text-xs">✦</span>
                )}
                {isLoadingAI ? "Suggesting..." : "Suggest with AI"}
              </button>
            )}
          </div>

          {/* Tools input */}
          <div
            className="flex items-center flex-wrap gap-2 border border-[#CCCCCC] rounded-md px-3 py-2 min-h-[40px] cursor-text mt-1"
            onClick={() => containerRef.current?.querySelector("input")?.focus()}
          >
            {data.tools.map((tool) => (
              <span
                key={tool}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm text-[#525252] whitespace-nowrap"
              >
                {tool}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ ...data, tools: data.tools.filter((t) => t !== tool), isSubmitted: false });
                  }}
                  className="text-gray-400 hover:text-black ml-1"
                >✕</button>
              </span>
            ))}
            <input
              className="flex-1 outline-none text-sm min-w-[120px] text-[#525252]"
              placeholder={data.tools.length ? "" : "Type and press Enter to add"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === ",") && search.trim()) {
                  e.preventDefault();
                  const val = search.trim().replace(/,$/, "");
                  if (val && !data.tools.includes(val)) {
                    onUpdate({ ...data, tools: [...data.tools, val], isSubmitted: false });
                  }
                  setSearch("");
                }
                if (e.key === "Backspace" && !search && data.tools.length) {
                  onUpdate({ ...data, tools: data.tools.slice(0, -1), isSubmitted: false });
                }
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add a technology</p>

          {/* ── AI Loading Skeleton ── */}
          {isLoadingAI && <AISuggestionSkeleton />}

          {/* ── AI Suggestion Box (after load) ── */}
          {!isLoadingAI && (visibleSuggestions.length > 0) && (
            <div className="mt-3 p-3 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">

              {/* Header row: title + search icon */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-purple-500 font-medium flex items-center gap-1.5">
                  <span>✦</span>
                  AI suggestions — click to add
                </p>
                <button
                  type="button"
                  onClick={() => setShowSearchBar((prev) => !prev)}
                  title="Search for more tools"
                  className={`p-1 rounded-md transition-colors cursor-pointer ${showSearchBar
                      ? "bg-purple-200 text-purple-700"
                      : "text-purple-400 hover:text-purple-600 hover:bg-purple-100"
                    }`}
                >
                  <MagnifyingGlass size={14} weight="bold" />
                </button>
              </div>

              {/* AI suggestion chips */}
              <div className="flex flex-wrap gap-1.5">
                {visibleSuggestions.map((tool) => (
                  <span
                    key={tool}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-purple-200 text-xs text-purple-700 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => handleAddSuggestion(tool)}
                      className="hover:text-purple-900 transition-colors cursor-pointer"
                    >+ {tool}</button>
                    <button
                      type="button"
                      onClick={() => handleDismissSuggestion(tool)}
                      className="text-purple-300 hover:text-purple-600 transition-colors ml-0.5 cursor-pointer"
                    >✕</button>
                  </span>
                ))}
              </div>

              {/* ── Search Bar (shown when search icon clicked) ── */}
              {showSearchBar && (
                <div className="mt-3 border-t border-purple-100 pt-3">

                  {/* Search input row */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 border border-purple-200 rounded-lg px-3 py-1.5 bg-white focus-within:border-purple-400 transition-colors">
                      <MagnifyingGlass size={13} className="text-purple-400 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(toTitleCase(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && searchQuery.trim()) {
                            e.preventDefault();
                            handleSearch(searchQuery.trim());
                          }
                          if (e.key === "Escape") handleCloseSearch();
                        }}
                        placeholder="Search tools, e.g. React, Docker..."
                        className="flex-1 text-xs text-[#525252] outline-none bg-transparent placeholder-purple-300"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                          className="text-purple-300 hover:text-purple-500 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseSearch}
                      className="text-purple-400 hover:text-purple-600 p-1 rounded cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Search loading skeleton */}
                  {isSearching && <SearchSkeleton />}

                  {/* Search results */}
                  {!isSearching && searchQuery.trim().length >= 2 && (
                    <div className="mt-2">

                      {/* "Add searched name" chip — always first */}
                      {searchQuery.trim() && !data.tools.includes(searchQuery.trim()) && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600 text-white text-xs shadow-sm">
                            <button
                              type="button"
                              onClick={handleAddSearchedKeyword}
                              className="cursor-pointer font-medium"
                            >+ Add "{searchQuery.trim()}"</button>
                          </span>
                        </div>
                      )}

                      {/* AI-generated search result chips */}
                      {visibleSearchResults.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {visibleSearchResults.map((tool) => (
                            <span
                              key={tool}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-purple-200 text-xs text-purple-700 shadow-sm"
                            >
                              <button
                                type="button"
                                onClick={() => handleAddSuggestion(tool)}
                                className="hover:text-purple-900 transition-colors cursor-pointer"
                              >+ {tool}</button>
                              <button
                                type="button"
                                onClick={() => handleDismissSearchResult(tool)}
                                className="text-purple-300 hover:text-purple-600 transition-colors ml-0.5 cursor-pointer"
                              >✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <FieldLabel label="Project Link / GitHub" required />
          <input
            type="text"
            value={data.projectLink}
            placeholder="https://github.com/your-project"
            onChange={(e) => onUpdate({ ...data, projectLink: sanitizeProjectUrl(e.target.value), isSubmitted: false })}
            className="border border-[#CCCCCC] text-[#525252] rounded-md px-3 h-10 py-1 focus:outline-none mt-1"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 flex flex-col">
        <FieldLabel label="Short Description" />
        <textarea
          rows={4}
          maxLength={500}
          className="border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-1 focus:outline-none resize-none mt-1"
          value={data.description}
          onChange={(e) => onUpdate({ ...data, description: e.target.value, isSubmitted: false })}
        />
        <div className="text-right text-xs text-gray-400">{data.description.length}/500</div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-1.5 rounded-md text-sm font-medium text-white bg-[#43C17A] ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isSaving ? "Saving..." : data.isSubmitted ? "Saved ✓" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSaving}
          className={`px-6 py-1.5 rounded-md text-sm font-medium text-white bg-[#43C17A] ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isSaving ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
}
