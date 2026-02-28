"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { suggestTopicsAction } from "@/lib/helpers/faculty/ai/suggestTopics.server";
import { FaChevronDown } from "react-icons/fa6";
import { CardProps } from "./subjectCards";
// import { upsertFacultyAcademics } from "@/lib/helpers/faculty/upsertFacultyAcademics";
import { supabase } from "@/lib/supabaseClient";
// import { suggestTopicsAI } from "@/lib/helpers/faculty/ai/suggestTopics.client";
// import { suggestTopicsAction } from "@/lib/helpers/faculty/ai/suggestTopics.server";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { useUser } from "@/app/utils/context/UserContext";
// import { fetchFacultyContext } from "@/lib/helpers/faculty/fetchFacultyContext";
import { upsertCollegeSubjectUnitWithTopics } from "@/lib/helpers/faculty/upsertCollegeSubjectUnitWithTopics";
import toast from "react-hot-toast";
import { fetchFacultyContext } from "@/app/utils/context/faculty/facultyContextAPI";
import { saveAcademicUnit } from "@/lib/helpers/faculty/saveAcademicUnit";
import { getInternalUserId } from "@/lib/helpers/getInternalUserId";

type AddNewCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CardProps) => void;

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
  section?: string;
  sectionId?: number;
  unitName: string;
  unitNumber: number;
  startDate: string;
  endDate: string;
  topics: string[];
};



// // 🔹 AI unit name suggestion helper
// function suggestUnitName(subject: string, unitNumber: number) {
//   if (!subject) return "";
//   return `Unit ${unitNumber}: Introduction to ${subject}`;
// }



export default function AddNewCardModal({
  isOpen,
  onClose,
  onSave,
  facultySubjects,
  defaultSubjectId,
  facultySections,
}: AddNewCardModalProps) {

  const [formData, setFormData] = useState<FacultyAcademicForm>({
    educationId: undefined,
    branchId: undefined,
    academicYearId: undefined,
    semester: undefined,
    collegeSubjectId: undefined,

    subjectName: "",
    subjectId: undefined,   // ✅ CORRECT
    unitName: "",
    unitNumber: 1,
    startDate: "",
    endDate: "",
    topics: [],
  });


  const [facultyId, setFacultyId] = useState<number | null>(null);;
  const [isSemesterAuto, setIsSemesterAuto] = useState(false);
  // const [formData, setFormData] = useState({
  //   facultyAcademicsId: undefined as number | undefined,
  //   facultyId: 0,
  //   subjectName: "",
  //   degree: "",
  //   department: "",
  //   academicYear: "",
  //   section: "",
  //   semester: "",

  //   unitName: "",
  //   unitNumber: 1,
  //   topics: [] as string[],
  // });




  const [educations, setEducations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);






  const [aiTopics, setAiTopics] = useState<string[]>([]);
  // const [facultyId, setFacultyId] = useState<number | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPending, startTransition] = useTransition();
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { userId, collegeId, loading } = useUser();
  const [facultyCtx, setFacultyCtx] = useState<any>(null);


  // const [subjectId, setSubjectId] = useState<number | null>(
  //   defaultSubjectId
  // );

  // useEffect(() => {
  //   if (defaultSubjectId) {
  //     setSubjectId(defaultSubjectId);
  //   }
  // }, [defaultSubjectId]);

  const filteredSections = sections;

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


  useEffect(() => {
    if (!facultyCtx) return;

    const yearIds = facultyCtx.academicYearIds ?? [];

    // ✅ Auto-fill year ONLY if exactly one
    if (yearIds.length === 1) {
      setFormData(prev => ({
        ...prev,
        academicYearId: yearIds[0],
      }));
    }
  }, [facultyCtx]);



  useEffect(() => {
    if (facultySubjects.length === 1) {
      const only = facultySubjects[0];

      setFormData(prev => ({
        ...prev,
        subjectId: only.collegeSubjectId,
        subjectName: only.subjectName,
      }));
    }
  }, [facultySubjects]);



  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      topics: selectedTopics,
    }));
  }, [selectedTopics]);

  useEffect(() => {
    if (availableTopics.length === 0 && selectedTopics.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [availableTopics, selectedTopics]);



  // const handleAddTopicFromAI = (topic: string) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     topics: prev.topics.includes(topic)
  //       ? prev.topics
  //       : [...prev.topics, topic],
  //   }));
  //   setAiTopics(prev => prev.filter(t => t !== topic));
  // };

  const getSearchState = (query: string) => {
    const q = query.trim().toLowerCase();

    if (!q) return { type: "empty" as const };

    if (selectedTopics.some(t => t.toLowerCase() === q)) {
      return { type: "selected" as const };
    }

    if (availableTopics.some(t => t.toLowerCase() === q)) {
      return { type: "available" as const };
    }

    return { type: "new" as const };
  };

  const searchState = getSearchState(searchQuery);

  useEffect(() => {
    if (!isOpen) return;
    if (!collegeId || loading) return;
    if (!facultyCtx) return;

    let cancelled = false;

    const loadAcademics = async () => {
      try {
        // 1) Education list (for display)
        const edu = await fetchAcademicDropdowns({
          type: "education",
          collegeId,
        });
        if (cancelled) return;
        setEducations(edu ?? []);

        // 2) Branch list (for display)
        const br = await fetchAcademicDropdowns({
          type: "branch",
          collegeId,
          educationId: facultyCtx.collegeEducationId,
        });
        if (cancelled) return;
        setBranches(br ?? []);

        // 3) Academic years (for display)
        const years = await fetchAcademicDropdowns({
          type: "academicYear",
          collegeId,
          educationId: facultyCtx.collegeEducationId,
          branchId: facultyCtx.collegeBranchId,
        });
        if (cancelled) return;
        setAcademicYears(years ?? []);

        // ensure year is set if only one
        const selectedYearId =
          facultyCtx.academicYearIds?.length === 1 ? facultyCtx.academicYearIds[0] : formData.academicYearId;

        if (selectedYearId && selectedYearId !== formData.academicYearId) {
          setFormData((prev) => ({ ...prev, academicYearId: selectedYearId }));
        }

        // 4) Semesters
        if (selectedYearId) {
          const sems = await fetchAcademicDropdowns({
            type: "semester",
            collegeId,
            educationId: facultyCtx.collegeEducationId,
            branchId: facultyCtx.collegeBranchId,
            academicYearId: selectedYearId,
          });
          if (cancelled) return;
          setSemesters(sems ?? []);

          // auto semester if only one
          if ((sems ?? []).length === 1) {
            setFormData((prev) => ({ ...prev, semester: sems[0].collegeSemesterId }));
            setIsSemesterAuto(true);
          } else {
            setIsSemesterAuto(false);
          }

          // 5) Sections (FETCH then FILTER by facultyCtx.sectionIds)
          const secs = await fetchAcademicDropdowns({
            type: "section",
            collegeId,
            educationId: facultyCtx.collegeEducationId,
            branchId: facultyCtx.collegeBranchId,
            academicYearId: selectedYearId,
          });

          const filteredSections = (secs ?? []).filter((s: any) =>
            Array.isArray(facultyCtx.sectionIds) && facultyCtx.sectionIds.includes(s.collegeSectionsId)
          );

          if (cancelled) return;
          setSections(filteredSections);

          // auto pick section if only one
          if (filteredSections.length === 1) {
            setFormData((prev) => ({ ...prev, sectionId: filteredSections[0].collegeSectionsId }));
          }

          // 6) Subjects (FETCH then FILTER by facultyCtx.subjectIds)
          const { data: subjectRows, error } = await supabase
            .from("college_subjects")
            .select("collegeSubjectId, subjectName")
            .eq("collegeId", collegeId)
            .eq("collegeEducationId", facultyCtx.collegeEducationId)
            .eq("collegeBranchId", facultyCtx.collegeBranchId)
            .eq("collegeAcademicYearId", selectedYearId)
            .in("collegeSubjectId", facultyCtx.subjectIds ?? [])
            .eq("isActive", true)
            .is("deletedAt", null);

          if (error) {
          }

          if (cancelled) return;

          const filteredSubjects = subjectRows ?? [];
          setSubjects(filteredSubjects);

          // if only 1 subject -> autofill
          if (filteredSubjects.length === 1) {
            setFormData((prev) => ({
              ...prev,
              subjectId: filteredSubjects[0].collegeSubjectId,
              subjectName: filteredSubjects[0].subjectName,
            }));
          }
        }
      } catch (err) {

      }
    };

    loadAcademics();

    return () => {
      cancelled = true;
    };
  }, [isOpen, collegeId, loading, facultyCtx]);

  useEffect(() => {
    if (subjects.length === 1) {
      const onlySubject = subjects[0];
      setFormData(prev => ({
        ...prev,
        subjectId: onlySubject.collegeSubjectId,
        subjectName: onlySubject.subjectName,
      }));
    }
  }, [subjects]);

  useEffect(() => {
    if (
      filteredSections.length === 1 &&
      !formData.sectionId
    ) {
      const only = filteredSections[0];
      setFormData(prev => ({
        ...prev,
        sectionId: only.collegeSectionsId,
      }));
    }
  }, [filteredSections, formData.sectionId]);

  if (!isOpen) return null;

  const filteredAvailableTopics = availableTopics.filter(topic =>
    topic.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleSave = async () => {
    if (loading) return;
    if (!collegeId) {
      toast.error("College not found");
      return;
    }

    if (!facultyId) {
      toast.error("Faculty not authenticated");
      return;
    }

    if (!formData.subjectId) {
      toast.error("Please select subject");
      return;
    }

    if (!formData.sectionId) {
      toast.error("Please select section");
      return;
    }

    if (!formData.unitName.trim()) {
      toast.error("Please enter unit name");
      return;
    }

    if (!formData.unitNumber || formData.unitNumber < 1) {
      toast.error("Please enter a valid unit number");
      return;
    }

    if (selectedTopics.length === 0) {
      toast.error("Please add at least one topic");
      return;
    }
    try {
      // 1️⃣ Unit + Topics
      const unitResult = await upsertCollegeSubjectUnitWithTopics({
        collegeId,
        collegeSubjectId: formData.subjectId,
        createdBy: facultyId,
        unitNumber: formData.unitNumber,
        unitTitle: formData.unitName,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        topics: selectedTopics,
      });

      const collegeSubjectUnitId = unitResult.collegeSubjectUnitId;

      // 2️⃣ Academics mapping
      await saveAcademicUnit({
        collegeId,
        collegeEducationId: formData.educationId!,
        collegeBranchId: formData.branchId!,
        collegeAcademicYearId: formData.academicYearId!,
        collegeSemesterId: formData.semester!,
        collegeSubjectId: formData.subjectId!,
        collegeSectionId: formData.sectionId!,
        collegeSubjectUnitId,
        createdBy: facultyId,
      });
      toast.success("Unit saved successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save unit");
    }
  };

  const uniqueSections = Array.from(
    new Map(
      sections.map((s) => [s.collegeSections, s])
    ).values()
  );



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-6 overflow-y-auto">
          {/* Header */}
          <h2 className="text-xl font-bold text-[#282828] mb-1">
            Add Unit
          </h2>
          <p className="text-[#525252] text-xs mb-6">
            Track progress, add lessons, and manage course content across all your batches.
          </p>

          {/* Form */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">

            {/* shared select style */}
            {/*
    placeholder → text-gray-400
    selected → text-gray-900
  */}

            {/* 1️⃣ Education */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Education</label>

              <input
                type="text"
                value={
                  educations.find(
                    e => e.collegeEducationId === formData.educationId
                  )?.collegeEducationType || ""
                }
                readOnly
                className="
      w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
      text-gray-900
      focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    "
              />
            </div>

            {/* 2️⃣ Branch */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Branch</label>

              <input
                type="text"
                value={
                  branches.find(
                    b => b.collegeBranchId === formData.branchId
                  )?.collegeBranchCode || ""
                }
                readOnly
                placeholder="Branch"
                className="
      w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
      text-gray-900 placeholder:text-gray-400
      focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    "
              />
            </div>

            {/* 3️⃣ Year */}
            {/* 3️⃣ Year (Auto from faculty context, NOT editable) */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Year</label>

              <input
                type="text"
                value={
                  academicYears.find(
                    y => y.collegeAcademicYearId === formData.academicYearId
                  )?.collegeAcademicYear || ""
                }
                readOnly
                placeholder="Year"
                className="
      w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
      text-gray-900 placeholder:text-gray-400
      focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    "
              />
            </div>

            {/* 4️⃣ Semester */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Semester</label>
              <select
                value={formData.semester ?? ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    semester: e.target.value === ""
                      ? undefined
                      : Number(e.target.value),
                    // subjectName: "",          // 🔥 reset subject
                  }))
                }

                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.semester ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="" disabled hidden>
                  Choose semester
                </option>

                {semesters.map((s) => (
                  <option
                    key={s.collegeSemesterId}
                    value={s.collegeSemesterId}   // ✅ ID goes here
                  >
                    Semester {s.collegeSemester}
                  </option>
                ))}
              </select>

            </div>

            {/* 5️⃣ Subject Name */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Subject Name</label>

              <input
                type="text"
                value={formData.subjectName || ""}
                readOnly
                placeholder="Subject"
                className="
      w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
      text-gray-900 placeholder:text-gray-400
      focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    "
              />
            </div>
            {/* 6️⃣ Section */}
            {/* 6️⃣ Section */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Section
              </label>

              <select
                value={formData.sectionId ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;

                  setFormData(prev => ({
                    ...prev,
                    sectionId: Number(value),
                  }));
                }}
                className={`
      w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
      focus:ring-2 focus:ring-[#43C17A] focus:outline-none
      ${formData.sectionId ? "text-gray-900" : "text-gray-400"}
    `}
              >
                <option value="" disabled hidden>
                  Select section
                </option>

                {filteredSections.map(s => (
                  <option
                    key={s.collegeSectionsId}
                    value={s.collegeSectionsId}
                  >
                    {s.collegeSections}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#282828]">Unit Name</label>
              <input
                type="text"
                value={formData.unitName}
                onChange={(e) => {
                  const value = e.target.value;
                  const subject = formData.subjectName;
                  setFormData(prev => ({ ...prev, unitName: value }));

                  if (!value || !subject) {
                    setAvailableTopics([]);
                    return;
                  }

                  if (aiTimeoutRef.current) {
                    clearTimeout(aiTimeoutRef.current);
                  }

                  aiTimeoutRef.current = setTimeout(async () => {
                    try {
                      const suggestions = await suggestTopicsAction(subject, value);
                      setAvailableTopics(suggestions);
                    } catch (err) {
                    }
                  }, 1500);
                }}
                placeholder="Enter unit name" className=" w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              />
              {(availableTopics.length > 0 || selectedTopics.length > 0) && (
                <div className="mt-3 border border-[#BBF7D0] bg-[#F0FDF4] rounded-lg p-3 col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#43C17A]">
                      AI Suggested Topics
                    </p>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-[#43C17A]">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectAll(checked);

                            if (checked) {
                              setSelectedTopics(prev => [
                                ...new Set([...prev, ...availableTopics]),
                              ]);
                              setAvailableTopics([]);
                            }
                          }}
                          className="accent-[#43C17A]"
                        />
                        Select All
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowSearch(prev => !prev)}
                        className="p-1 rounded-md hover:bg-white/70"
                      >
                        <MagnifyingGlass size={16} className="text-[#43C17A]" />
                      </button>
                    </div>
                  </div>
                  {showSearch && (
                    <input
                      type="text"
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className=" w-full rounded-lg px-3 py-2 text-xs border border-[#BBF7D0]   bg-[#ECFDF5]   text-[#065F46]   placeholder:text-[#86EFAC]   focus:ring-2 focus:ring-[#43C17A] "
                    />
                  )}

                  {searchQuery && searchState.type === "new" && (
                    <button
                      type="button"
                      onClick={() => {
                        const newTopic = searchQuery.trim();
                        if (!newTopic) return;
                        setSelectedTopics(prev =>
                          prev.includes(newTopic) ? prev : [...prev, newTopic]
                        );
                        setAvailableTopics(prev =>
                          prev.filter(t => t.toLowerCase() !== newTopic.toLowerCase())
                        );
                        setSearchQuery("");
                        setSelectAll(false);
                      }}
                      className=" mt-2 text-xs font-semibold text-[#43C17A  flex items-center gap-1"
                    >
                      + Add “{searchQuery}”
                    </button>
                  )}
                  {selectedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedTopics.map(topic => (
                        <div
                          key={topic}
                          className="flex items-center gap-2 bg-white border border-[#D1FAE5]rounded-full px-3 py-1 text-xs  text-[#065F46]"
                        >
                          <span>{topic}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTopics(prev => prev.filter(t => t !== topic));
                              setAvailableTopics(prev => [...prev, topic]);
                              setSelectAll(false);
                            }}
                            className="text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {availableTopics
                      .filter(t =>
                        t.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(topic => (
                        <div
                          key={topic}
                          className="flex items-center gap-2 bg-white border border-[#D1FAE5]rounded-full px-3 py-1 text-xs  text-[#065F46]"
                        >
                          <span>{topic}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTopics(prev => [...prev, topic]);
                              setAvailableTopics(prev => prev.filter(t => t !== topic));
                              setSelectAll(false);
                            }}
                            className="text-[#43C17A] font-bold"
                          >
                            +
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
            <div>
              <label className="text-sm font-semibold text-[#282828]">Unit</label>
              <input
                type="number"
                min={1}
                value={formData.unitNumber || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    unitNumber: Number(e.target.value),
                  }))
                }
                placeholder="Enter unit number"
                className=" w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#43C17A] focus:outline-none "
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, startDate: e.target.value }))
                }
                className=" w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm  text-gray-900  focus:ring-2 focus:ring-[#43C17A] focus:outline-none "
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, endDate: e.target.value }))
                }
                className="  w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm  text-gray-900  focus:ring-2 focus:ring-[#43C17A] focus:outline-none  "
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#43C17A] text-white font-semibold py-1.5 rounded-xl hover:bg-[#3bad6d]"
            >
              Save
            </button>

            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 py-1.5 rounded-xl text-[#282828] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div >
  );
}