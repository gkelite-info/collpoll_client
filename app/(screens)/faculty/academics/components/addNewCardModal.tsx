"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { suggestTopicsAction } from "@/lib/helpers/faculty/ai/suggestTopics.server";
import { FaChevronDown } from "react-icons/fa6";
import { CardProps } from "./subjectCards";
import { upsertFacultyAcademics } from "@/lib/helpers/faculty/upsertFacultyAcademics";
import { supabase } from "@/lib/supabaseClient";
// import { suggestTopicsAI } from "@/lib/helpers/faculty/ai/suggestTopics.client";
// import { suggestTopicsAction } from "@/lib/helpers/faculty/ai/suggestTopics.server";
import { MagnifyingGlass } from "@phosphor-icons/react";


type AddNewCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCard: CardProps) => void;
};

// // 🔹 AI unit name suggestion helper
// function suggestUnitName(subject: string, unitNumber: number) {
//   if (!subject) return "";
//   return `Unit ${unitNumber}: Introduction to ${subject}`;
// }


export default function addNewCardModal({ isOpen, onClose }: AddNewCardModalProps) {


  const [formData, setFormData] = useState({
    facultyAcademicsId: undefined as number | undefined,
    facultyId: 0,
    subjectName: "",
    degree: "",
    department: "",
    academicYear: "",
    section: "",
    semester: "",

    unitName: "",
    unitNumber: 1,
    topics: [] as string[],
  });








  const [aiTopics, setAiTopics] = useState<string[]>([]);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPending, startTransition] = useTransition();
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showSearch, setShowSearch] = useState(false);


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
    const loadFaculty = async () => {
      const { data } = await supabase.auth.getUser();
      // fetch faculty profile using userId
      setFacultyId(12); // example
    };

    loadFaculty();
  }, []);



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


  const handleSave = async () => {
    try {
      await upsertFacultyAcademics({
        facultyAcademicsId: formData.facultyAcademicsId,
        facultyId: formData.facultyId,

        subjectName: formData.subjectName,
        department: formData.department,
        academicYear: formData.academicYear,
        section: formData.section,
        semester: formData.semester,

        unitName: formData.unitName,
        unitNumber: formData.unitNumber,
        topics: formData.topics,
      });
      setAiTopics([]);
      setFormData(prev => ({
        ...prev,
        topics: [],
        unitName: "",
      }));

      onClose();
    } catch (error) {
      console.error("Failed to save academic unit", error);
    }
  };



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

            {/* Subject Name */}
            {/* Subject Name */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Subject Name
              </label>
              <input
                type="text"
                value={formData.subjectName}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    subjectName: e.target.value,
                  }))
                }
                placeholder="Enter Subject Name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
      text-gray-900 bg-white placeholder:text-gray-400
      focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              />
            </div>

            {/* Degree */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Degree
              </label>
              <select
                value={formData.degree}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    degree: e.target.value,
                  }))
                }
                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.degree ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="">Select degree</option>
                <option value="B.Tech">B.Tech</option>
                <option value="B.Sc">B.Sc</option>
                <option value="M.Tech">M.Tech</option>
                <option value="M.Sc">M.Sc</option>
              </select>

            </div>


            {/* Department */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.department ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="">Select department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Mechanical">Mechanical</option>
              </select>

            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Year
              </label>
              {/* <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-400 bg-white focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              >
                <option>Select academic year</option>
              </select> */}
              <select
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    academicYear: e.target.value,
                  }))
                }
                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.academicYear ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="">Select academic year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Section
              </label>
              {/* <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-400 bg-white focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              >
                <option>Select section</option>
              </select> */}
              <select
                value={formData.section}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    section: e.target.value,
                  }))
                }
                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.section ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="">
                  Select section
                </option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Semester
              </label>
              {/* <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-400 bg-white focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              >
                <option>Choose semester</option>
              </select> */}
              <select
                value={formData.semester}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    semester: e.target.value,
                  }))
                }
                className={`
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
    ${formData.semester ? "text-gray-900" : "text-gray-400"}
  `}
              >
                <option value="">
                  Choose semester
                </option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
              </select>
            </div>

            {/* Unit Name */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Unit Name
              </label>
              <input
                type="text"
                value={formData.unitName}
                onChange={(e) => {
                  const value = e.target.value;
                  const subject = formData.subjectName; // ✅ capture immediately

                  setFormData(prev => ({
                    ...prev,
                    unitName: value,
                  }));

                  // reset if empty
                  if (!value || !subject) {
                    setAiTopics([]);
                    return;
                  }

                  // clear previous debounce
                  if (aiTimeoutRef.current) {
                    clearTimeout(aiTimeoutRef.current);
                  }

                  // debounce AI call
                  aiTimeoutRef.current = setTimeout(async () => {
                    try {
                      console.log("🤖 Calling AI with:", {
                        subject,
                        unit: value,
                      });

                      const suggestions = await suggestTopicsAction(
                        subject,
                        value
                      );

                      console.log("✅ AI Topics:", suggestions);
                      // setAiTopics(suggestions);
                      setAvailableTopics(suggestions);
                      setSelectedTopics([]);
                      setSearchQuery("");
                      setSelectAll(false);
                    } catch (err) {
                      console.error("❌ AI failed", err);
                    }
                  }, 2000);
                }}
                // onChange={(e) => {
                //   const value = e.target.value;

                //   setFormData((prev) => ({
                //     ...prev,
                //     unitName: value,
                //   }));

                //   // ❌ Stop if no unit name or subject
                //   if (!value || !formData.subjectName) {
                //     setAiTopics([]);
                //     return;
                //   }

                //   // 🧹 Clear previous timer
                //   if (aiTimeoutRef.current) {
                //     clearTimeout(aiTimeoutRef.current);
                //   }

                //   // ⏱ Debounce AI call
                //   aiTimeoutRef.current = setTimeout(async () => {
                //     try {
                //       console.log("🧠 Calling AI with:", {
                //         subject: formData.subjectName,
                //         unit: value,
                //       });

                //       const suggestions = await suggestTopicsAI(
                //         formData.subjectName,
                //         value
                //       );

                //       console.log("✅ AI Topics:", suggestions);

                //       setAiTopics(suggestions);
                //     } catch (err) {
                //       console.error("❌ AI failed", err);
                //     }
                //   }, 600); // debounce delay
                // }}
                placeholder="Enter Unit Name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
             text-gray-900 bg-white placeholder:text-gray-400
             focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              />
              {/* <input
                type="text"
                value={formData.unitName}
                onChange={async (e) => {
                  const value = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    unitName: value,
                  }));

                  const suggestions = await suggestTopicsAI(
                    formData.subjectName,
                    value
                  );
                  setAiTopics(suggestions);
                }}

                placeholder="Enter Unit Name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              /> */}
              {(availableTopics.length > 0 || selectedTopics.length > 0) && (
                <div className="mt-3 border border-[#BBF7D0] bg-[#F0FDF4] rounded-lg p-3">
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

                      {/* 🔍 Search icon */}
                      <button
                        type="button"
                        onClick={() => setShowSearch(prev => !prev)}
                        className="p-1 rounded-md hover:bg-white/70"
                      >
                        <MagnifyingGlass size={16} weight="bold" className="text-[#43C17A]" />
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  {showSearch && (
                    <div className="relative mb-3">
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
        focus:outline-none
        focus:ring-2 focus:ring-[#43C17A]
      "
                      />
                    </div>
                  )}

                  {/* Selected Topics */}
                  {selectedTopics.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold text-[#6B7280] mb-1">
                        Selected
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {selectedTopics.map((topic) => (
                          <div
                            key={topic}
                            className="
                flex items-center gap-2
                bg-white border border-[#D1FAE5]
                rounded-full px-3 py-1 text-xs
                text-[#374151]
              "
                          >
                            <span>{topic}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTopics(prev => prev.filter(t => t !== topic));
                                setAvailableTopics(prev => [...prev, topic]);
                                setSelectAll(false); // ✅ ADD THIS LINE
                              }}
                              className="text-[#EF4444] font-bold"
                            >
                              ×
                            </button>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showSearch && searchQuery && (
                    <div className="mt-2 space-y-2">

                      {/* 1️⃣ Matching AVAILABLE topics (LIKE Unit Name behavior) */}
                      {filteredAvailableTopics.length > 0 && (
                        filteredAvailableTopics.map(topic => (
                          <div
                            key={topic}
                            className="flex items-center gap-2 bg-white border border-[#D1FAE5]
                     rounded-full px-3 py-1 text-xs"
                          >
                            <span>{topic}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTopics(prev => [...prev, topic]);
                                setAvailableTopics(prev => prev.filter(t => t !== topic));
                                setSearchQuery("");
                                setShowSearch(false);
                                setSelectAll(false);
                              }}
                              className="text-[#43C17A] font-bold"
                            >
                              +
                            </button>
                          </div>
                        ))
                      )}

                      {/* 2️⃣ Already selected */}
                      {filteredAvailableTopics.length === 0 &&
                        selectedTopics.some(t =>
                          t.toLowerCase().includes(searchQuery.toLowerCase())
                        ) && (
                          <p className="text-[11px] text-[#16A34A] px-1">
                            Topic already added
                          </p>
                        )}

                      {/* 3️⃣ Brand new topic */}
                      {filteredAvailableTopics.length === 0 &&
                        !selectedTopics.some(t =>
                          t.toLowerCase().includes(searchQuery.toLowerCase())
                        ) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTopics(prev => [...prev, searchQuery]);
                              setSearchQuery("");
                              setShowSearch(false);
                              setSelectAll(false);
                            }}
                            className="text-left text-xs px-3 py-1 rounded-lg
                     bg-white border border-dashed border-[#43C17A]
                     text-[#065F46] hover:bg-[#ECFDF5]"
                          >
                            ➕ Add new topic: <b>{searchQuery}</b>
                          </button>
                        )}
                    </div>
                  )}


                  {/* ALREADY SELECTED */}
                  {selectedTopics.some(t =>
                    t.toLowerCase() === searchQuery.toLowerCase()
                  ) && (
                      <p className="text-[11px] text-[#16A34A] px-1">
                        Topic already added
                      </p>
                    )}

                  {/* ADD NEW TOPIC (ONLY IF NO MATCH FOUND) */}
                  {/* {availableTopics.filter(t =>
                    t.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 &&
                    !selectedTopics.some(t =>
                      t.toLowerCase() === searchQuery.toLowerCase()
                    ) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTopics(prev => [...prev, searchQuery]);
                          setSearchQuery("");
                          setShowSearch(false);
                        }}
                        className="text-left text-xs px-3 py-1 rounded-lg
                     bg-white border border-dashed border-[#43C17A]
                     text-[#065F46] hover:bg-[#ECFDF5]"
                      >
                        ➕ Add new topic: <b>{searchQuery}</b>
                      </button>
                    )} */}
                </div>
              )}


              {/* {showSearch && searchQuery && (
                    <div className="flex flex-wrap gap-2">
                      {availableTopics
                        .filter(topic =>
                          topic.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(topic => (
                          <div
                            key={topic}
                            className="flex items-center gap-2 bg-white border
                     border-[#D1FAE5] rounded-full px-3 py-1 text-xs"
                          >
                            <span>{topic}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTopics(prev => [...prev, topic]);
                                setAvailableTopics(prev => prev.filter(t => t !== topic));
                                setSearchQuery("");      // optional
                                setShowSearch(false);    // optional UX
                              }}
                              className="text-[#43C17A] font-bold"
                            >
                              +
                            </button>
                          </div>
                        ))}
                    </div>
                  )} */}

              {/* Available Topics */}
              {availableTopics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableTopics
                    .filter(topic =>
                      topic.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(topic => (
                      <div
                        key={topic}
                        className="
            flex items-center gap-2
            bg-white border border-[#D1FAE5]
            rounded-full px-3 py-1 text-xs
            text-[#374151]
          "
                      >
                        <span>{topic}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTopics(prev => [...prev, topic]);
                            setAvailableTopics(prev => prev.filter(t => t !== topic));
                            setSelectAll(false);
                          }}
                          className="text-[#43C17A] font-bold hover:scale-110 transition"
                        >
                          +
                        </button>
                      </div>
                    ))}
                </div>
              )}
              {/* {availableTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {availableTopics
                        .filter(topic =>
                          showSearch
                            ? topic.toLowerCase().includes(searchQuery.toLowerCase())
                            : true
                        )
                        .map(topic => (
                          <div
                            key={topic}
                            className="
            flex items-center gap-2
            bg-white border border-[#D1FAE5]
            rounded-full px-3 py-1 text-xs
            text-[#374151]
          "
                          >
                            <span>{topic}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTopics(prev => [...prev, topic]);
                                setAvailableTopics(prev => prev.filter(t => t !== topic));
                                setSelectAll(false);
                              }}
                              className="text-[#43C17A] font-bold hover:scale-110 transition"
                            >
                              +
                            </button>
                          </div>
                        ))}
                    </div>
                  )} */}
              {/* <div className="flex flex-wrap gap-2">
                    {availableTopics
                      .filter((topic) =>
                        topic.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((topic) => (
                        <div
                          key={topic}
                          className="
              flex items-center gap-2
              bg-white border border-[#D1FAE5]
              rounded-full px-3 py-1 text-xs
              text-[#374151]
            "
                        >
                          <span>{topic}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTopics((prev) => [...prev, topic]);
                              setAvailableTopics((prev) => prev.filter((t) => t !== topic));
                            }}
                            className="text-[#43C17A] font-bold hover:scale-110 transition"
                          >
                            +
                          </button>
                        </div>
                      ))}
                  </div> */}
              {/* </div> */}
              {/* {aiTopics.length > 0 && (
              <div className="mt-3 border border-[#BBF7D0] bg-[#F0FDF4] rounded-lg p-3">
                <p className="text-xs font-semibold text-[#43C17A] mb-2">
                  AI Suggested Topics
                </p>

                <div className="flex flex-wrap gap-2">
                  {aiTopics.map((topic) => (
                    <div
                      key={topic}
                      className="
            flex items-center gap-2
            border border-[#D1FAE5]
            rounded-full
            px-3 py-1
            text-xs
            bg-white
            text-[#374151]
          "
                    >
                      <span>{topic}</span> */}

              {/* <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              topics: prev.topics.includes(topic)
                                ? prev.topics
                                : [...prev.topics, topic],
                            }));

                            setAiTopics((prev) =>
                              prev.filter((t) => t !== topic)
                            );
                          }}
                          className="text-[#43C17A] font-bold hover:scale-110"
                        >
                          +
                        </button> */}
              {/* <button
                        type="button"
                        onClick={() => handleAddTopicFromAI(topic)}
                        className="text-[#43C17A] font-bold hover:scale-110"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

              {/* <input
                type="text"
                placeholder="Enter Unit Name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              /> */}
            </div>


            {/* Unit */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Unit
              </label>
              {/* <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-400 bg-white focus:ring-2 focus:ring-[#43C17A] focus:outline-none"
              >
                <option>Select Unit</option>
              </select> */}
              <input
                type="number"
                min={1}
                step={1}
                value={formData.unitNumber || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    unitNumber: Number(e.target.value),
                  }))
                }
                placeholder="Enter Unit Number"
                className="
    w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
    text-gray-900 bg-white
    placeholder:text-gray-400
    focus:ring-2 focus:ring-[#43C17A] focus:outline-none
  "
              />

            </div>

            {/* Topics (RIGHT side under Unit) */}
            {/* <div className="col-span-1 col-start-2">
            <label className="text-sm font-semibold text-[#282828] mb-1 block">
              Topics
            </label> */}

            {/* INPUT + BUTTON (fixed height) */}
            {/* <div className="relative">
              <input
                type="text"
                placeholder="Add topics"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-14 text-sm"
              />

              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#43C17A] text-white"
              >
                +
              </button>
            </div>

            {/* TOPICS LIST (separate block) */}
            {/* {formData.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.topics.map(topic => (
                  <div
                    key={topic}
                    className="flex items-center gap-2 border rounded-full px-3 py-1 text-xs"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          topics: prev.topics.filter(t => t !== topic),
                        }))
                      }
                      className="text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>  */}

          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#43C17A] text-white font-semibold py-1.5 rounded-xl hover:bg-[#3bad6d] cursor-pointer"
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