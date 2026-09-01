"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { suggestTopicsAction } from "@/lib/helpers/faculty/ai/suggestTopics.server";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchFacultyContext } from "@/app/utils/context/faculty/facultyContextAPI";
import { CardProps } from "@/lib/types/faculty";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getUnitsWithTopics } from "@/lib/helpers/faculty/getUnitsWithTopics";

import { CustomDropdown } from "@/app/components/CustomDropdown";
import { AiTopicSelector } from "./AiTopicSelector";
import { useAcademicsDropdowns } from "../hooks/useAcademicsDropdowns";
import { useUnitSave } from "../hooks/useUnitSave";
import { toPascalCase, INVALID_UNIT_MESSAGE } from "../utils/addNewCardHelpers";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

type AddNewCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CardProps) => void;
  onGeneratingStart?: () => void;
  onGeneratingEnd?: () => void;
  facultySubjects: {
    collegeSubjectId: number;
    subjectName: string;
  }[];
  facultySections: any[];
  defaultSubjectId: number | null;
};

type FacultyAcademicForm = {
  educationId?: number;
  branchId?: number;
  academicYearId?: number;
  semester?: number;
  subjectName: string;
  subjectId?: number;
  collegeSubjectId?: number;
  sectionIds: number[];
  unitName: string;
  unitNumber: number | "";
  startDate: string;
  endDate: string;
  topics: string[];
};

export default function AddNewCardModal({
  isOpen,
  onClose,
  onGeneratingStart,
  onGeneratingEnd,
  facultySubjects,
}: AddNewCardModalProps) {
  const [formData, setFormData] = useState<FacultyAcademicForm>({
    educationId: undefined,
    branchId: undefined,
    academicYearId: undefined,
    semester: undefined,
    collegeSubjectId: undefined,
    subjectName: "",
    subjectId: undefined,
    sectionIds: [],
    unitName: "",
    unitNumber: "",
    startDate: "",
    endDate: "",
    topics: [],
  });

  const [facultyId, setFacultyId] = useState<number | null>(null);
  const { userId, collegeId, loading } = useUser();
  const [facultyCtx, setFacultyCtx] = useState<any>(null);
  const { faculty_edu_type } = useFaculty();

  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [debouncedUnitName, setDebouncedUnitName] = useState("");
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!userId || loading) return;

    fetchFacultyContext(userId)
      .then((ctx) => {
        setFacultyId(ctx.facultyId);
        setFacultyCtx(ctx);

        setFormData((prev) => ({
          ...prev,
          educationId: ctx.collegeEducationId,
          branchId: ctx.collegeBranchId,
          academicYearId: ctx.academicYearIds?.length === 1 ? ctx.academicYearIds[0] : prev.academicYearId,
        }));
      })
      .catch((err) => {
        console.error("Failed to fetch faculty context", err);
        toast.error("Faculty profile not found");
      });
  }, [userId, loading]);

  const { educations, branches, academicYears, semesters, sections, subjects, isDropdownsLoading } = useAcademicsDropdowns({
    isOpen,
    collegeId,
    loading,
    facultyCtx,
    formData,
    setFormData,
    facultySubjects,
  });

  const { data: existingUnits = [] } = useQuery({
    queryKey: ['existingUnits', collegeId, formData.subjectId],
    queryFn: async () => {
      if (!collegeId || !formData.subjectId) return [];
      return await getUnitsWithTopics({ collegeId, collegeSubjectId: formData.subjectId });
    },
    enabled: !!collegeId && !!formData.subjectId,
  });

  const { isSaving, handleSave } = useUnitSave({
    collegeId,
    facultyId,
    faculty_edu_type,
    educations,
    branches,
    formData,
    setFormData,
    facultySubjects,
    facultyCtx,
    selectedTopics,
    setSelectedTopics,
    setAvailableTopics,
    onClose,
    onGeneratingStart,
    onGeneratingEnd,
    router,
    existingUnits,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      topics: selectedTopics,
    }));
  }, [selectedTopics]);

  useEffect(() => {
    if (isOpen) {
      if (!isDropdownsLoading) {
        setInitialLoadDone(true);
      }
    } else {
      setInitialLoadDone(false);
    }
  }, [isOpen, isDropdownsLoading]);

  useEffect(() => {
    if (availableTopics.length === 0 && selectedTopics.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [availableTopics, selectedTopics]);

  const currentEducation = educations.find((e) => e.collegeEducationId === formData.educationId)?.collegeEducationType;
  const isSchool = isSchoolEducation(currentEducation);


  const educationType = educations.find((e: any) => e.collegeEducationId === formData.educationId)?.collegeEducationType;
  const branchCode = branches.find((b: any) => b.collegeBranchId === formData.branchId)?.collegeBranchCode;



  useEffect(() => {
    if (formData.unitNumber && existingUnits.length > 0) {
      const exists = existingUnits.find(u => Number(u.unitLabel?.replace("Unit - ", "")) === Number(formData.unitNumber));
      if (exists) {
        toast.error(`Unit ${formData.unitNumber} is already added for this subject!`);
      }
    }
  }, [formData.unitNumber, existingUnits]);

  useEffect(() => {
    if (formData.unitName && existingUnits.length > 0) {
      const exists = existingUnits.find(u => u.title?.toLowerCase().trim() === formData.unitName.toLowerCase().trim());
      if (exists) {
        toast.error(`Unit "${formData.unitName}" is already added for this subject!`);
      }
    }
  }, [formData.unitName, existingUnits]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUnitName(formData.unitName || "");
    }, 900);
    return () => clearTimeout(handler);
  }, [formData.unitName]);

  useEffect(() => {
    if (formData.unitName !== debouncedUnitName) {
      setAvailableTopics([]);
      setTopicsError(null);
    }
  }, [formData.unitName, debouncedUnitName]);

  const { data: generatedTopics, isFetching: isFetchingTopics, isError } = useQuery({
    queryKey: ['aiTopics', formData.subjectName, debouncedUnitName, educationType, branchCode],
    queryFn: async () => {
      const pascalValue = debouncedUnitName;
      const subject = formData.subjectName;

      const trimmed = pascalValue.replace(/[^a-zA-Z\s]/g, "").trim();
      const letterCount = trimmed.replace(/\s+/g, "").length;

      if (letterCount < 3 || !subject) return [];
      
      const topics = await suggestTopicsAction(subject, pascalValue, educationType, branchCode);
      if (!Array.isArray(topics) || topics.length === 0) {
         throw new Error("Failed to generate topics");
      }
      return topics;
    },
    enabled: !!formData.subjectName && !!debouncedUnitName && debouncedUnitName.replace(/[^a-zA-Z\s]/g, "").trim().replace(/\s+/g, "").length >= 3,
    staleTime: Infinity,
    retry: 2,
    retryDelay: attempt => Math.min(750 * 2 ** attempt, 3000),
  });

  useEffect(() => {
    setIsLoadingTopics(isFetchingTopics);
  }, [isFetchingTopics]);

  useEffect(() => {
    if (generatedTopics && generatedTopics.length > 0) {
       setAvailableTopics(generatedTopics.filter(t => !selectedTopics.includes(t)));
       setTopicsError(null);
    } else if (isError) {
       setTopicsError("Failed to generate topics");
       setAvailableTopics([]);
    } else if (debouncedUnitName.replace(/[^a-zA-Z\s]/g, "").trim().replace(/\s+/g, "").length < 3) {
       setTopicsError(null);
       setAvailableTopics([]);
    }
  }, [generatedTopics, isError, debouncedUnitName, selectedTopics]);

  const filteredAvailableTopics = availableTopics.filter((topic) =>
    topic.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const getSearchState = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return { type: "empty" as const };
    if (selectedTopics.some((t) => t.toLowerCase() === q)) return { type: "selected" as const };
    if (availableTopics.some((t) => t.toLowerCase() === q)) return { type: "available" as const };
    return { type: "new" as const };
  };

  const isInvalidUnit = availableTopics.includes(INVALID_UNIT_MESSAGE);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative bg-white w-[600px] rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Sticky Header Container */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#282828] mb-1">Add Unit</h2>
            <p className="text-[#525252] text-xs">
              Track progress, add lessons, and manage course content across all your batches.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="p-6 pt-4 overflow-y-auto">
          {!initialLoadDone ? (
            <div className="animate-pulse flex flex-col gap-y-4 w-full">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-[42px] bg-gray-200 rounded w-full"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-[42px] bg-gray-200 rounded w-full"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-[42px] bg-gray-200 rounded w-full"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-[42px] bg-gray-200 rounded w-full"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-[42px] bg-gray-200 rounded w-full"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-[42px] bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex flex-col gap-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                  <div className="h-[120px] bg-gray-100 rounded-xl w-full border border-gray-200"></div>
                </div>
                <div className="h-[44px] bg-gray-200 rounded-lg w-full mt-2"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Education */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Education</label>
              {educations.length === 1 ? (
                <input
                  type="text"
                  value={
                    educations.find((e) => e.collegeEducationId === formData.educationId)?.collegeEducationType || ""
                  }
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none cursor-not-allowed"
                />
              ) : (
                <CustomDropdown
                  value={formData.educationId ?? ""}
                  options={educations.map((e) => ({ value: e.collegeEducationId, label: e.collegeEducationType }))}
                  onChange={(val: any) => setFormData((prev) => ({ ...prev, educationId: Number(val), sectionIds: [] }))}
                  placeholder="Select Education"
                  className="w-full h-[42px]"
                />
              )}
            </div>

            {/* Branch */}
            {!isSchoolEducation(educationType) && (
              <div>
                <label className="text-sm font-semibold text-[#282828]">
                  {facultyCtx?.faculty_edu_type === "Inter" ? "Group" : "Branch"}
                </label>
                {branches.length === 1 ? (
                  <input
                    type="text"
                    value={branches.find((b) => b.collegeBranchId === formData.branchId)?.collegeBranchCode || ""}
                    readOnly
                    placeholder={facultyCtx?.faculty_edu_type === "Inter" ? "Group" : "Branch"}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-gray-50 placeholder:text-gray-400 focus:outline-none cursor-not-allowed"
                  />
                ) : (
                  <CustomDropdown
                    value={formData.branchId ?? ""}
                    options={branches.map((b) => ({ value: b.collegeBranchId, label: b.collegeBranchCode }))}
                    onChange={(val: any) => setFormData((prev) => ({ ...prev, branchId: Number(val), sectionIds: [] }))}
                    placeholder={facultyCtx?.faculty_edu_type === "Inter" ? "Select Group" : "Select Branch"}
                    className="w-full h-[42px]"
                    disabled={!formData.educationId}
                  />
                )}
              </div>
            )}

            {/* Year */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Year</label>
              {academicYears.length === 1 ? (
                <input
                  type="text"
                  value={
                    academicYears.find((y) => y.collegeAcademicYearId === formData.academicYearId)
                      ?.collegeAcademicYear || ""
                  }
                  readOnly
                  placeholder="Year"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-gray-50 placeholder:text-gray-400 focus:outline-none cursor-not-allowed"
                />
              ) : (
                <CustomDropdown
                  value={formData.academicYearId ?? ""}
                  options={academicYears.map((y) => ({ value: y.collegeAcademicYearId, label: y.collegeAcademicYear }))}
                  onChange={(val: any) => setFormData((prev) => ({ ...prev, academicYearId: Number(val), sectionIds: [] }))}
                  placeholder="Select Year"
                  className="w-full h-[42px]"
                  disabled={isSchoolEducation(educationType) ? !formData.educationId : !formData.branchId}
                />
              )}
            </div>

            {/* Semester */}
            {!(isSchoolEducation(educationType) || facultyCtx?.faculty_edu_type === "Inter") && (
              <div>
                <label className="text-sm font-semibold text-[#282828]">Semester</label>
                {semesters.length === 1 ? (
                  <input
                    type="text"
                    value={`Semester ${semesters[0].collegeSemester}`}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none cursor-not-allowed"
                  />
                ) : (
                  <CustomDropdown
                    value={formData.semester ?? ""}
                    options={semesters.map((s) => ({ value: s.collegeSemesterId, label: `Semester ${s.collegeSemester}` }))}
                    onChange={(val: any) => setFormData((prev) => ({ ...prev, semester: Number(val) }))}
                    placeholder="Choose semester"
                    className="w-full h-[42px]"
                    disabled={!formData.academicYearId}
                  />
                )}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Subject Name</label>
              {subjects.length === 1 ? (
                <input
                  type="text"
                  value={formData.subjectName || ""}
                  readOnly
                  placeholder="Subject"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-gray-50 placeholder:text-gray-400 focus:outline-none cursor-not-allowed"
                />
              ) : (
                <CustomDropdown
                  value={formData.subjectId ?? ""}
                  options={subjects.map((s) => ({ value: s.collegeSubjectId, label: s.subjectName }))}
                  onChange={(val: any) => {
                    const subj = subjects.find((s) => s.collegeSubjectId === Number(val));
                    setFormData((prev) => ({
                      ...prev,
                      subjectId: Number(val),
                      subjectName: subj?.subjectName || "",
                    }));
                  }}
                  placeholder="Select Subject"
                  className="w-full h-[42px]"
                  disabled={(isSchoolEducation(educationType) || facultyCtx?.faculty_edu_type === "Inter") ? !formData.academicYearId : !formData.semester}
                />
              )}
            </div>

            {/* Section */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Section <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center flex-wrap gap-2 min-h-[42px] border border-gray-300 rounded-lg px-2 py-1 bg-white focus-within:ring-2 focus-within:ring-[#43C17A] focus-within:border-transparent">
                {formData.sectionIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.sectionIds.map((id) => {
                      const section = sections.find((s:any) => s.collegeSectionsId === id);
                      if (!section) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1 bg-[#ECFDF5] text-[#065F46] px-2 py-0.5 rounded-md text-[12px] font-medium border border-[#A7F3D0]"
                        >
                          {section?.collegeSections}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                sectionIds: prev.sectionIds.filter((sid) => sid !== id),
                              }))
                            }
                            className="text-[#065F46]/60 hover:text-red-600 cursor-pointer text-base leading-none"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex-1 min-w-[80px]">
                    <CustomDropdown
                      value=""
                      onChange={(val: any) => {
                        const value = Number(val);
                        if (!value) return;
                        setFormData((prev) => ({
                          ...prev,
                          sectionIds: prev.sectionIds.includes(value) 
                            ? prev.sectionIds.filter((id) => id !== value) 
                            : [...prev.sectionIds, value],
                        }));
                      }}
                      options={sections.map((s: any) => ({ value: s.collegeSectionsId, label: s.collegeSections }))}
                      placeholder="Select"
                      className="!border-none !ring-0 !shadow-none !bg-transparent !py-0 !pl-1 w-full"
                      isMultiSelect={true}
                      selectedValues={formData.sectionIds}
                      disabled={!formData.academicYearId}
                    />
                </div>
              </div>
            </div>

            {/* Unit Name */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Unit Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.unitName}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const pascalValue = toPascalCase(rawValue.replace(/[^a-zA-Z\s]/g, ""));
                  setFormData((prev) => ({ ...prev, unitName: pascalValue }));
                }}
                placeholder="Enter unit name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              />
            </div>

            {/* Unit Number */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.unitNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    unitNumber: val === "" ? "" : Number(val),
                  }));
                }}
                placeholder="Enter unit number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              />
            </div>
          </div>

          <AiTopicSelector
            formData={formData}
            setFormData={setFormData}
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
            isInvalidUnit={isInvalidUnit}
          />

          <div className="mt-5 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-xs font-medium text-[#15803d]">
            Note: Along with the topic name, a PDF is also generated.
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex-1 font-semibold py-1.5 rounded-sm transition ${
                isSaving
                  ? "bg-[#43C17A] opacity-60 cursor-not-allowed text-white"
                  : "bg-[#43C17A] hover:bg-[#3bad6d] text-white cursor-pointer"
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 py-1.5 rounded-sm text-[#282828] hover:bg-gray-50 cursor-pointer"
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
