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
import { fetchFacultyContext } from "@/app/utils/context/facultyContextAPI";
import { saveAcademicUnit } from "@/lib/helpers/faculty/saveAcademicUnit";
import { getInternalUserId } from "@/lib/helpers/getInternalUserId";



type AddNewCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCard: CardProps) => void;
};

type Branch = {
  collegeBranchId: number;
  collegeBranchType: string;
  collegeBranchCode: string;
};


type FacultyAcademicForm = {
  educationId?: number;
  branchId?: number;
  academicYearId?: number;
  semester?: number; // ✅ this is collegeSemesterId
  subjectName: string;
  subjectId?: number;   // ✅ ADD THIS
  section?: string;
  sectionId?: number;
  unitName: string;
  unitNumber: number;
  startDate: string;   // ✅ NEW
  endDate: string;     // ✅ NEW
  topics: string[];
};



// // 🔹 AI unit name suggestion helper
// function suggestUnitName(subject: string, unitNumber: number) {
//   if (!subject) return "";
//   return `Unit ${unitNumber}: Introduction to ${subject}`;
// }


export default function addNewCardModal({ isOpen, onClose }: AddNewCardModalProps) {

  const [formData, setFormData] = useState<FacultyAcademicForm>({
    educationId: undefined,
    branchId: undefined,
    academicYearId: undefined,
    semester: undefined,

    subjectName: "",
    subjectId: undefined,
    // section: "",
    unitName: "",
    unitNumber: 1,
    startDate: "",   // ✅
    endDate: "",     // ✅
    topics: [],
  });

  const [facultyId, setFacultyId] = useState<number | null>(null);






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


  useEffect(() => {
    if (!userId || loading) return;

    fetchFacultyContext(userId)
      .then((ctx) => {
        setFacultyId(ctx.facultyId);
      })
      .catch((err) => {
        console.error("Failed to fetch faculty context", err);
        toast.error("Faculty profile not found");
      });
  }, [userId, loading]);


  console.log("vamshi", facultyId);


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

  const handleSuggestTopics = async () => {
    if (!formData.subjectName || !formData.unitName) return;

    try {
      const suggestions = await suggestTopicsAction(
        formData.subjectName,
        formData.unitName
      );
      // setAiTopics(suggestions);
      setAvailableTopics(suggestions);
      setSearchQuery("");
      setSelectAll(false);

    } catch (err) {
      alert("AI limit reached. Try later.");
    }
  };


  useEffect(() => {
    if (!isOpen || loading || !collegeId) return;

    fetchAcademicDropdowns({
      type: "education",
      collegeId,
    }).then((data) => setEducations(data ?? []));
  }, [isOpen, collegeId, loading]);





  useEffect(() => {
    if (!collegeId || !formData.educationId) return;

    console.log("📘 Fetching branches for:", {
      collegeId,
      educationId: formData.educationId,
    });

    fetchAcademicDropdowns({
      type: "branch",
      collegeId,
      educationId: formData.educationId,
    }).then((data) => {
      const branchesData = (data ?? []) as Branch[];

      console.log("🌿 Branch list:", branchesData);

      branchesData.forEach((branch) => {
        console.log(
          "🏷️ Branch →",
          "ID:", branch.collegeBranchId,
          "| Code:", branch.collegeBranchCode,
          "| Type:", branch.collegeBranchType
        );
      });

      setBranches(branchesData);
    });

    // reset children
    setFormData((prev) => ({
      ...prev,
      branchId: undefined,
      academicYearId: undefined,
      semester: undefined,
      subjectName: "",
    }));
  }, [collegeId, formData.educationId]);





  useEffect(() => {
    if (!collegeId || !formData.educationId || !formData.branchId) return;

    fetchAcademicDropdowns({
      type: "academicYear",
      collegeId,
      educationId: formData.educationId,
      branchId: formData.branchId,
    }).then((data) => setAcademicYears(data ?? []));
  }, [collegeId, formData.educationId, formData.branchId]);



  useEffect(() => {
    if (
      loading ||
      !collegeId ||
      !formData.educationId ||
      !formData.academicYearId
    ) {
      return;
    }

    fetchAcademicDropdowns({
      type: "semester",
      collegeId,
      educationId: formData.educationId,
      academicYearId: formData.academicYearId,
    }).then((data) => setSemesters(data ?? []));
  }, [
    collegeId,
    loading,
    formData.educationId,
    formData.academicYearId,
  ]);


  useEffect(() => {
    // 🔥 Clear subject list & selection immediately
    setSubjects([]);
    setFormData(prev => ({
      ...prev,
      subjectName: "",
    }));
  }, [formData.academicYearId, formData.semester]);


  useEffect(() => {
    if (
      loading ||
      !collegeId ||
      !formData.educationId ||
      !formData.branchId ||
      !formData.academicYearId ||
      !formData.semester
    ) {
      return;
    }

    fetchAcademicDropdowns({
      type: "subject",
      collegeId,
      educationId: formData.educationId,
      branchId: formData.branchId,
      academicYearId: formData.academicYearId,
      semester: formData.semester, // collegeSemesterId
    }).then((data) => setSubjects(data ?? []));
  }, [
    collegeId,
    loading,
    formData.educationId,
    formData.branchId,
    formData.academicYearId,
    formData.semester,
  ]);



  // useEffect(() => {
  //   if (loading || !collegeId) return;

  //   fetchAcademicDropdowns({
  //     type: "section",
  //     collegeId,
  //   }).then((data) => {
  //     console.log("📦 Sections fetched from DB:", data);
  //     setSections(data ?? []);
  //   });
  // }, [collegeId, loading]);

  useEffect(() => {
    if (
      loading ||
      !collegeId ||
      !formData.educationId ||
      !formData.branchId ||
      !formData.academicYearId
    )
      return;

    fetchAcademicDropdowns({
      type: "section",
      collegeId,
      educationId: formData.educationId,
      branchId: formData.branchId,
      academicYearId: formData.academicYearId,
    }).then((data) => {
      console.log("📦 Filtered sections:", data);
      setSections(data ?? []);
    });
  }, [
    collegeId,
    loading,
    formData.educationId,
    formData.branchId,
    formData.academicYearId,
  ]);







  // const [formData, setFormData] = useState({
  //   subjectTitle: "",
  //   year: "",
  //   fromDate: "",
  //   toDate: "",
  //   units: "",
  //   nextLesson: "",
  // });

  if (!isOpen) return null;

  // function suggestTopics(subject: string, unitName: string): string[] {
  //   if (!subject || !unitName) return [];

  //   // 🔹 MOCK AI LOGIC (replace later with OpenAI)
  //   if (subject.toLowerCase().includes("digital")) {
  //     return [
  //       "Number Systems",
  //       "Binary Arithmetic",
  //       "Logic Gates",
  //       "Universal Gates",
  //       "XOR and XNOR Gates",
  //     ];
  //   }

  //   if (subject.toLowerCase().includes("algorithm")) {
  //     return [
  //       "Introduction to Algorithms",
  //       "Time Complexity",
  //       "Sorting Algorithms",
  //       "Searching Algorithms",
  //       "Greedy Techniques",
  //     ];
  //   }

  //   return [
  //     `Introduction to ${unitName}`,
  //     "Basic Concepts",
  //     "Core Principles",
  //     "Examples and Applications",
  //     "Summary and Review",
  //   ];
  // }

  const filteredAvailableTopics = availableTopics.filter(topic =>
    topic.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );


  // const handleSave = async () => {
  //   try {
  //     await upsertFacultyAcademics({
  //       facultyAcademicsId: formData.facultyAcademicsId,
  //       facultyId: formData.facultyId,

  //       subjectName: formData.subjectName,
  //       department: formData.department,
  //       academicYear: formData.academicYear,
  //       section: formData.section,
  //       semester: formData.semester,

  //       unitName: formData.unitName,
  //       unitNumber: formData.unitNumber,
  //       topics: formData.topics,
  //     });
  //     setAiTopics([]);
  //     setFormData(prev => ({
  //       ...prev,
  //       topics: [],
  //       unitName: "",
  //     }));

  //     onClose();
  //   } catch (error) {
  //     console.error("Failed to save academic unit", error);
  //   }
  // };

  console.log("Vamshi", facultyId);


  const handleSave = async () => {
    if (loading) return;

    /* -----------------------------
     * BASIC VALIDATIONS
     * ----------------------------- */
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

    //   /* -----------------------------
    // * RESOLVE SECTION ID (CORRECT)
    // * ----------------------------- */
    //   const sectionRow = sections.find(
    //     (s) =>
    //       s.collegeSections === formData.section &&
    //       s.collegeId === collegeId
    //   );

    //   console.log("🎯 sectionRow matched:", sectionRow);


    //   console.log("🎯 sectionRow matched:", sectionRow);

    //   if (!sectionRow) {
    //     toast.error("Section not found for selected context");
    //     return;
    //   }

    //   const sectionId = sectionRow.collegeSectionsId;

    /* -----------------------------
     * SAVE UNIT + TOPICS → THEN ACADEMICS
     * ----------------------------- */
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

      console.log("college section id", formData.sectionId)

      /* -----------------------------
       * SUCCESS
       * ----------------------------- */
      toast.success("Unit saved successfully");
      onClose();
    } catch (err: any) {
      console.error("❌ Save unit failed:", err);
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
              <select
                value={formData.educationId ?? ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    educationId: Number(e.target.value),
                    branchId: undefined,
                    academicYearId: undefined,
                    semester: undefined,
                    subjectName: "",
                  }))
                }
                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.educationId ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="" disabled hidden>
                  Select education
                </option>

                {educations.map((e) => (
                  <option
                    key={e.collegeEducationId}
                    value={e.collegeEducationId}
                  >
                    {e.collegeEducationType}
                  </option>
                ))}
              </select>

            </div>

            {/* 2️⃣ Branch */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Branch</label>
              <select
                value={formData.branchId ?? ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    branchId: Number(e.target.value),
                  }))
                }
                disabled={!formData.educationId}
                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.branchId ? "text-gray-900" : "text-gray-400"}
    ${!formData.educationId ? "bg-gray-100 cursor-not-allowed" : ""}
  `}
              >
                <option value="" disabled hidden>
                  Select branch
                </option>

                {branches.map((branch) => (
                  <option
                    key={branch.collegeBranchId}
                    value={branch.collegeBranchId}
                    title={branch.collegeBranchType}
                  >
                    {branch.collegeBranchCode}
                  </option>
                ))}
              </select>

            </div>

            {/* 3️⃣ Year */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Year</label>
              <select
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    academicYearId: Number(e.target.value),
                    semester: undefined,     // ✅ reset
                    subjectName: "",         // ✅ reset
                  }))
                }
                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.academicYearId ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="">
                  Select year
                </option>

                {academicYears.map((y) => (
                  <option
                    key={y.collegeAcademicYearId}
                    value={y.collegeAcademicYearId}
                  >
                    {y.collegeAcademicYear}
                  </option>
                ))}
              </select>

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
                    subjectName: "",          // 🔥 reset subject
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
              <select
                value={formData.subjectId ?? ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    subjectId: Number(e.target.value),
                    subjectName: subjects.find(
                      s => s.collegeSubjectId === Number(e.target.value)
                    )?.subjectName,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="" disabled hidden>
                  Select subject
                </option>

                {subjects.map((s) => (
                  <option
                    key={s.collegeSubjectId}
                    value={s.collegeSubjectId}   // ✅ ID AS VALUE
                  >
                    {s.subjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* 6️⃣ Section */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Section</label>
              {/* <select
                value={formData.section}
                onChange={(e) => {
                  console.log("🧭 Section selected from UI:", e.target.value);

                  setFormData(prev => ({
                    ...prev,
                    section: e.target.value,
                  }));
                }}

                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.section ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="" disabled hidden>
                  Select section
                </option>

                {Array.from(
                  new Set(sections.map(s => s.collegeSections))
                ).map((section) => (
                  <option
                    key={section}     // ✅ unique (A, B, C…)
                    value={section}   // ✅ string value
                  >
                    {section}
                  </option>
                ))}
              </select> */}

              <select
                value={formData.sectionId ?? ""}                 // 🔴 CHANGED
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;

                  const sectionId = Number(value);

                  console.log("🧭 Section selected:", sectionId);

                  setFormData(prev => ({
                    ...prev,
                    sectionId,                                   // 🔴 CHANGED
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

                {sections.map((s) => (
                  <option
                    key={s.collegeSectionsId}                     // 🔴 CHANGED
                    value={s.collegeSectionsId}                   // 🔴 CHANGED (ID!)
                  >
                    {s.collegeSections}                           {/* A / B / C */}
                  </option>
                ))}
              </select>

            </div>


            {/* 7️⃣ Unit Name */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">Unit Name</label>
              <input
                type="text"
                value={formData.unitName}
                onChange={(e) => {
                  const value = e.target.value;
                  const subject = formData.subjectName;

                  console.log("✏️ Unit typed:", value);
                  console.log("📘 Subject:", subject);

                  setFormData(prev => ({ ...prev, unitName: value }));

                  if (!value || !subject) {
                    console.warn("❌ AI blocked: missing subject or unit");
                    setAvailableTopics([]);
                    return;
                  }

                  if (aiTimeoutRef.current) {
                    clearTimeout(aiTimeoutRef.current);
                  }

                  aiTimeoutRef.current = setTimeout(async () => {
                    try {
                      console.log("🤖 Calling AI with:", { subject, unit: value });

                      const suggestions = await suggestTopicsAction(subject, value);

                      console.log("✅ AI returned:", suggestions);

                      setAvailableTopics(suggestions);
                    } catch (err) {
                      console.error("❌ AI error:", err);
                    }
                  }, 1500);
                }}


                placeholder="Enter unit name"
                className="
        w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
        text-gray-900 placeholder:text-gray-400
        focus:ring-2 focus:ring-[#43C17A] focus:outline-none
      "
              />
              {(availableTopics.length > 0 || selectedTopics.length > 0) && (
                <div className="mt-3 border border-[#BBF7D0] bg-[#F0FDF4] rounded-lg p-3 col-span-2">

                  {/* Header */}
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

                  {/* Search */}
                  {showSearch && (
                    <input
                      type="text"
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="
          w-full rounded-lg px-3 py-2 text-xs
          border border-[#BBF7D0]
          bg-[#ECFDF5]
          text-[#065F46]
          placeholder:text-[#86EFAC]
          focus:ring-2 focus:ring-[#43C17A]
        "
                    />
                  )}

                  {/* Selected Topics */}
                  {selectedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedTopics.map(topic => (
                        <div
                          key={topic}
                          className="flex items-center gap-2 bg-white border border-[#D1FAE5]
              rounded-full px-3 py-1 text-xs  text-[#065F46]"
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

                  {/* Available Topics */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {availableTopics
                      .filter(t =>
                        t.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(topic => (
                        <div
                          key={topic}
                          className="flex items-center gap-2 bg-white border border-[#D1FAE5]
              rounded-full px-3 py-1 text-xs  text-[#065F46]"
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

            {/* 8️⃣ Unit */}
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
                className="
        w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
        text-gray-900 placeholder:text-gray-400
        focus:ring-2 focus:ring-[#43C17A] focus:outline-none
      "
              />
            </div>
            {/* 9️⃣ Start Date */}
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
                className="
      w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
      text-gray-900
      focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    "
              />
            </div>

            {/* 🔟 End Date */}
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
                className="
      w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
      text-gray-900
      focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    "
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