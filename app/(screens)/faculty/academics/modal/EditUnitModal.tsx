"use client";

import { useEffect, useState } from "react";
import { suggestTopicsAction } from "@/lib/helpers/faculty/ai/suggestTopics.server";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchFacultyContext } from "@/app/utils/context/faculty/facultyContextAPI";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getUnitsWithTopics } from "@/lib/helpers/faculty/getUnitsWithTopics";

import { AiTopicSelector } from "../components/AiTopicSelector";
import { useUnitUpdate } from "../hooks/useUnitUpdate";
import { toPascalCase, INVALID_UNIT_MESSAGE } from "../utils/addNewCardHelpers";
import { Unit } from "../components/unitCard";
import { X } from "@phosphor-icons/react";

type EditUnitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratingStart?: () => void;
  onGeneratingEnd?: () => void;
  unit: Unit | null;
  details: {
    collegeId: number;
    collegeSubjectId: number;
    collegeSectionId?: number;
    subjectTitle: string;
  };
  actorContext?: {
    facultyId: number;
    educationId?: number;
    branchId?: number | null;
    branchCode?: string | null;
    educationType?: string | null;
  };
};

export default function EditUnitModal({
  isOpen,
  onClose,
  onGeneratingStart,
  onGeneratingEnd,
  unit,
  details,
  actorContext,
}: EditUnitModalProps) {
  const [formData, setFormData] = useState({
    subjectId: details.collegeSubjectId,
    subjectName: details.subjectTitle,
    sectionIds: details.collegeSectionId ? [details.collegeSectionId] : [],
    unitName: unit?.title || "",
    unitNumber: unit ? Number(unit.unitLabel.replace("Unit - ", "")) : 1,
    startDate: "",
    endDate: "",
    educationId: undefined as number | undefined,
    branchId: undefined as number | undefined,
  });

  const { userId, collegeId, loading } = useUser();
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const {
    faculty_edu_type: facultyEducationType,
    college_branch: facultyBranchCode,
  } = useFaculty();
  const faculty_edu_type = actorContext?.educationType ?? facultyEducationType;
  const branchCode = actorContext?.branchCode ?? facultyBranchCode ?? undefined;
  const actorFacultyId = actorContext?.facultyId;
  const actorEducationId = actorContext?.educationId;
  const actorBranchId = actorContext?.branchId;

  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [initialTopicTitles, setInitialTopicTitles] = useState<string[]>(
    () => unit?.topics?.map(topic => topic.title) ?? [],
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [debouncedUnitName, setDebouncedUnitName] = useState(unit?.title || "");
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (actorFacultyId !== undefined) {
      setFacultyId(actorFacultyId);
      setFormData(prev => ({
        ...prev,
        educationId: actorEducationId,
        branchId: actorBranchId ?? undefined,
      }));
      setInitialLoadDone(true);
      return;
    }

    if (!userId || loading) return;
    fetchFacultyContext(userId).then((ctx) => {
      setFacultyId(ctx.facultyId);
      setFormData(prev => ({
        ...prev,
        educationId: ctx.collegeEducationId,
        branchId: ctx.collegeBranchId,
      }));
      setInitialLoadDone(true);
    }).catch(() => {
      toast.error("Faculty profile not found");
    });
  }, [userId, loading, actorFacultyId, actorEducationId, actorBranchId]);

  // Sync unit data when modal opens
  useEffect(() => {
    if (isOpen && unit) {
      setFormData(prev => ({
        ...prev,
        unitName: unit.title,
        unitNumber: Number(unit.unitLabel.replace("Unit - ", "")),
      }));
      setDebouncedUnitName(unit.title);
      
      const topicsList = unit.topics?.map(t => t.title) || [];
      setSelectedTopics(topicsList);
      setInitialTopicTitles(topicsList);
      setAvailableTopics([]);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setTopicsError(null);
      setSelectAll(false);
      setShowSearch(false);
    } else if (!isOpen) {
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setTopicsError(null);
      setAvailableTopics([]);
    }
  }, [isOpen, unit?.id]);

  const { data: existingUnits = [] } = useQuery({
    queryKey: ['existingUnits', collegeId, details.collegeSubjectId],
    queryFn: () => getUnitsWithTopics({ collegeId: collegeId!, collegeSubjectId: details.collegeSubjectId }),
    enabled: !!collegeId,
  });

  const { isSaving, handleSave } = useUnitUpdate({
    collegeId,
    facultyId,
    faculty_edu_type,
    educations: [],
    branches: [],
    formData,
    setFormData,
    selectedTopics,
    setSelectedTopics,
    setAvailableTopics,
    onClose,
    onGeneratingStart,
    onGeneratingEnd,
    router,
    existingUnits,
    editingUnitId: unit?.id || 0,
    initialTopicTitles,
  });

  // AI generation logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUnitName(formData.unitName || "");
    }, 900);
    return () => clearTimeout(handler);
  }, [formData.unitName]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 700);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const existingTopicsForAi = unit?.topics?.map(topic => topic.title) ?? [];
  const existingTopicsCacheKey = [...existingTopicsForAi]
    .map(topic => topic.trim().toLowerCase())
    .sort()
    .join('|');

  const { data: generatedTopics, isFetching: isFetchingTopics, isError } = useQuery({
    queryKey: ['aiTopics', 'edit', formData.subjectName, debouncedUnitName, faculty_edu_type, branchCode, existingTopicsCacheKey],
    queryFn: async () => {
      const trimmed = debouncedUnitName.replace(/[^a-zA-Z\s]/g, "").trim();
      if (trimmed.length < 3 || !formData.subjectName) return [];
      const topics = await suggestTopicsAction(
        formData.subjectName,
        debouncedUnitName,
        faculty_edu_type ?? undefined,
        branchCode,
        existingTopicsForAi,
      );
      if (!Array.isArray(topics) || topics.length === 0) throw new Error("Failed");
      return topics;
    },
    enabled: !!formData.subjectName && !!debouncedUnitName && debouncedUnitName.length >= 3,
    staleTime: Infinity,
    retry: 1,
    retryDelay: attempt => Math.min(750 * 2 ** attempt, 3000),
  });

  const { data: focusedTopics, isFetching: isFetchingFocusedTopics, isError: isFocusedTopicsError } = useQuery({
    queryKey: [
      'aiTopics',
      'edit-search-v2',
      formData.subjectName,
      debouncedUnitName,
      faculty_edu_type,
      branchCode,
      existingTopicsCacheKey,
      debouncedSearchQuery.toLowerCase(),
    ],
    queryFn: async () => {
      const excludedTopics = [...new Set([...existingTopicsForAi, ...(generatedTopics ?? [])])];
      const topics = await suggestTopicsAction(
        formData.subjectName,
        debouncedUnitName,
        faculty_edu_type ?? undefined,
        branchCode,
        excludedTopics,
        debouncedSearchQuery,
      );
      if (!Array.isArray(topics) || topics.length === 0) throw new Error("Failed");
      return topics;
    },
    enabled:
      !!formData.subjectName &&
      debouncedUnitName.length >= 3 &&
      debouncedSearchQuery.replace(/[^a-zA-Z\s]/g, "").replace(/\s+/g, "").length >= 3,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: attempt => Math.min(750 * 2 ** attempt, 3000),
  });

  useEffect(() => {
    setIsLoadingTopics(isFetchingTopics || isFetchingFocusedTopics);
  }, [isFetchingTopics, isFetchingFocusedTopics]);

  useEffect(() => {
    const combinedTopics = [...new Set([...(focusedTopics ?? []), ...(generatedTopics ?? [])])];
    if (combinedTopics.length > 0) {
       setAvailableTopics(combinedTopics.filter(t => !selectedTopics.includes(t)));
       setTopicsError(null);
    } else if (debouncedSearchQuery.length >= 3) {
       setTopicsError(
         isFocusedTopicsError && !isFetchingFocusedTopics
           ? "AI suggestions are temporarily unavailable for this topic. Please try again."
           : null,
       );
       setAvailableTopics([]);
    } else if (isError && !isFetchingTopics && selectedTopics.length === 0) {
       setTopicsError("AI suggestions are temporarily unavailable. Please try again.");
       setAvailableTopics([]);
    } else {
       setTopicsError(null);
    }
  }, [generatedTopics, focusedTopics, isError, isFocusedTopicsError, isFetchingTopics, isFetchingFocusedTopics, debouncedSearchQuery, selectedTopics]);

  useEffect(() => {
    if (availableTopics.length === 0) setSelectAll(false);
  }, [availableTopics, selectedTopics]);

  const focusedTopicSet = new Set(focusedTopics ?? []);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredAvailableTopics = availableTopics.filter(
    topic =>
      !normalizedSearchQuery ||
      topic.toLowerCase().includes(normalizedSearchQuery) ||
      focusedTopicSet.has(topic),
  );

  const getSearchState = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return { type: "empty" as const };
    if (selectedTopics.some((t) => t.toLowerCase() === q)) return { type: "selected" as const };
    if (availableTopics.some((t) => t.toLowerCase() === q)) return { type: "available" as const };
    return { type: "new" as const };
  };

  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative bg-white w-[600px] rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#282828] mb-1">Edit Unit</h2>
            <p className="text-[#525252] text-xs">Update your unit details and manage topics.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={18} weight="bold" className="cursor-pointer text-[#282828]"/>
          </button>
        </div>

        <div className="p-6 pt-4 overflow-y-auto">
          {!initialLoadDone ? (
            <div className="animate-pulse flex flex-col w-full">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-[42px] bg-gray-200 rounded w-full"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-[42px] bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              <div className="border border-green-100 bg-green-50/30 rounded-xl p-5 w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="h-8 bg-gray-200 rounded-full w-48"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-64"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-56"></div>
                </div>
                <div className="h-[42px] bg-gray-200 rounded-full w-full"></div>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="h-[44px] bg-gray-200 rounded-lg flex-1"></div>
                <div className="h-[44px] bg-gray-200 rounded-lg flex-1"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-[#282828]">Unit Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={formData.unitName}
                    onChange={(e) => {
                      const pascalValue = toPascalCase(e.target.value.replace(/[^a-zA-Z\s]/g, ""));
                      setFormData(prev => ({ ...prev, unitName: pascalValue }));
                    }}
                    placeholder="Enter unit name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#282828]">Unit Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={1}
                    value={formData.unitNumber || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: Number(e.target.value) }))}
                    placeholder="Enter unit number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
                  />
                </div>
              </div>

              <AiTopicSelector
                formData={formData as any}
                setFormData={setFormData as any}
                availableTopics={availableTopics}
                selectedTopics={selectedTopics}
                setSelectedTopics={setSelectedTopics}
                isLoadingTopics={isLoadingTopics}
                topicsError={topicsError}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                selectAll={selectAll}
                setSelectAll={setSelectAll}
                searchState={getSearchState(searchQuery)}
                filteredAvailableTopics={filteredAvailableTopics}
                isInvalidUnit={availableTopics.includes(INVALID_UNIT_MESSAGE)}
                suggestionsFirst
              />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex-1 font-semibold py-2 rounded-lg transition ${
                    isSaving ? "bg-[#43C17A] opacity-60 cursor-not-allowed text-white" : "bg-[#43C17A] hover:bg-[#3bad6d] text-white cursor-pointer"
                  }`}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-[#282828] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
