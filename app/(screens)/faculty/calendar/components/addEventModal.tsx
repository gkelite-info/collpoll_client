"use client";

import { fetchFacultyContext } from "@/app/utils/context/faculty/facultyContextAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { supabase } from "@/lib/supabaseClient";
import { X } from "@phosphor-icons/react";
// import type { CalendarEventPayload } from "../page";
import type { CalendarEventPayload } from "../page";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type DegreeOption = {
  collegeDegreeId: number;
  degreeType: string;
  departments: string[];
  years?: string[];
  sections?: any;
};


type SubjectRow = {
  collegeSubjectId: number;
  subjectName: string;
};

type SectionRow = {
  collegeSectionsId: number;
  collegeSections: string;
};

type SemesterRow = {
  collegeSemesterId: number;
  collegeSemester: number;
};

type TopicRow = {
  collegeSubjectUnitTopicId: number;
  topicTitle: string;
};

type AcademicDropdownMap = {
  education: {
    collegeEducationId: number;
    collegeEducationType: string;
  };
  branch: {
    collegeBranchId: number;
    collegeBranchType: string;
    collegeBranchCode: string;
  };
  academicYear: {
    collegeAcademicYearId: number;
    collegeAcademicYear: string;
  };
  semester: {
    collegeSemesterId: number;
    collegeSemester: number;
  };
  section: {
    collegeSectionsId: number;
    collegeSections: string;
  };
};



interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: any | null;
  isSaving?: boolean;
  onSave: (eventData: CalendarEventPayload) => void;
  initialData?: any | null;
  mode: "create" | "edit";
  degreeOptions: DegreeOption[];
}

const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const INPUT_HEIGHT = "h-[44px]";
const CHIP_CONTAINER_HEIGHT = "h-[32px]";

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  value,
  isSaving = false,
  initialData = null,
  mode,
  degreeOptions,
}) => {
  const [title, setTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedType, setSelectedType] = useState("Class");
  const [date, setDate] = useState(getTodayDateString());
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
  const closedByUserRef = useRef(false);
  const [roomNo, setRoomNo] = useState("");
  const [year, setYear] = useState<string>("");
  const [semester, setSemester] = useState<number | undefined>();
  const [isSemesterAuto, setIsSemesterAuto] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [degree, setDegree] = useState("");
  const [subject, setSubject] = useState("");
  const [topicId, setTopicId] = useState<number | null>(null);
  const [isDateInputFocused, setIsDateInputFocused] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const { userId, collegeId, loading } = useUser();
  const [topics, setTopics] = useState<TopicRow[]>([]);


  const [facultyCtx, setFacultyCtx] = useState<any>(null);
  // const [topics, setTopics] = useState<{ topicTitle: string }[]>([]);


  const [educationId, setEducationId] = useState<number | undefined>(undefined);
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = useState<number | undefined>(undefined);
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [unitId, setUnitId] = useState<number | undefined>(undefined);
  const [semesters, setSemesters] = useState<SemesterRow[]>([]);

  const [educations, setEducations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [sectionIds, setSectionIds] = useState<number[]>([]);
  const [editSectionIds, setEditSectionIds] = useState<number[] | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleDropdownClose = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        isDeptOpen &&
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(target)
      ) {
        setIsDeptOpen(false);
      }

      if (
        isSectionOpen &&
        sectionDropdownRef.current &&
        !sectionDropdownRef.current.contains(target)
      ) {
        setIsSectionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDropdownClose);

    return () => {
      document.removeEventListener("mousedown", handleDropdownClose);
    };
  }, [isOpen, isDeptOpen, isSectionOpen]);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  // const YEARS = ["1", "2", "3", "4"];
  // const SEMESTERS = ["1", "2"];
  const isEditMode = mode === "edit";

  const selectedDegreeObj = React.useMemo(() => {
    return degreeOptions.find((d) => d.degreeType === degree);
  }, [degree, degreeOptions]);

  console.log("degree options are", degreeOptions);

  const departmentOptions = useMemo(() => {
    if (!selectedDegreeObj?.departments) return [];
    return selectedDegreeObj.departments.map((d: string) => d.trim());
  }, [selectedDegreeObj]);

  const yearOptions = useMemo(() => {
    if (!selectedDegreeObj?.years) return [];
    // return selectedDegreeObj.years.map((y: string) => y.trim());
    return selectedDegreeObj?.years ?? [];
  }, [selectedDegreeObj?.years]);

  const sectionMap = React.useMemo<Record<string, string[]>>(() => {
    if (
      !selectedDegreeObj?.sections ||
      typeof selectedDegreeObj.sections !== "object"
    ) {
      return {};
    }
    return selectedDegreeObj.sections;
  }, [selectedDegreeObj]);

  const normalizeYear = (y: any) =>
    ["1", "2", "3", "4", "5", "6", "7", "8"].includes(String(y))
      ? String(y)
      : "";

  // useEffect(() => {
  //   if (!degree) return;
  //   if (!isEditMode) return;
  //   if (value) return;
  //   // setYear("");
  //   setSemester("");
  //   setSelectedDepartments([]);
  //   setSelectedSections([]);
  //   // if (year && !yearOptions.some((y: any) => y.value === year)) {
  //   //   setYear("");
  //   // }
  //   // setYear(normalizeYear(value.year));
  // }, [degree, value, isEditMode]);

  // const resetForm = () => {
  //   setTitle("");
  //   setTopic("");
  //   setRoomNo("");
  //   setDegree("");
  //   setSelectedDepartments([]);
  //   setSelectedSections([]);
  //   setYear("");
  //   setSemester("");
  //   setSelectedType("class");
  //   setDate(getTodayDateString());

  //   setStartHour("09");
  //   setStartMinute("00");
  //   setStartPeriod("AM");
  //   setEndHour("10");
  //   setEndMinute("00");
  //   setEndPeriod("AM");
  // };

  // const parse24HourTo12Hour = (time: string) => {
  //   const [h, m] = time.split(":").map(Number);

  //   const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  //   const hour12 = h % 12 === 0 ? 12 : h % 12;

  //   return {
  //     hour: String(hour12).padStart(2, "0"),
  //     minute: String(m).padStart(2, "0"),
  //     period,
  //   };
  // };

  // useEffect(() => {
  //   if (!isOpen) return;

  //   if (!value) {
  //     resetForm();
  //     return;
  //   }

  //   setTitle(value.title || "");
  //   setTopic(value.topic || "");
  //   setRoomNo(value.roomNo || "");
  //   setDegree(value.degree || "");
  //   setSelectedDepartments(
  //     Array.isArray(value.departments)
  //       ? value.departments.filter(
  //         (d: any) => typeof d === "string" && d.trim() !== "",
  //       )
  //       : [],
  //   );
  //   setSelectedSections(
  //     Array.isArray(value.sections)
  //       ? value.sections.filter(
  //         (s: any) => typeof s === "string" && s.trim() !== "",
  //       )
  //       : [],
  //   );
  //   // setYear(value.year ? String(value.year) : "");
  //   // setYear(value.year || "");
  //   // setYear(normalizeYear(value.year));
  //   const normalizedYear = String(value.year || "").trim();
  //   if (
  //     normalizedYear &&
  //     ["1", "2", "3", "4", "5", "6", "7", "8"].includes(normalizedYear)
  //   ) {
  //     setYear(normalizedYear);
  //   } else {
  //     setYear("");
  //   }
  //   setSemester(value.semester || "");
  //   setSelectedType(value.type || "class");
  //   setDate(value.date || getTodayDateString());

  //   if (value.startTime && value.endTime) {
  //     const start = parse24HourTo12Hour(value.startTime);
  //     const end = parse24HourTo12Hour(value.endTime);

  //     setStartHour(start.hour);
  //     setStartMinute(start.minute);
  //     setStartPeriod(start.period);

  //     setEndHour(end.hour);
  //     setEndMinute(end.minute);
  //     setEndPeriod(end.period);
  //   }
  // }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) {
      setYear("");
      setTitle("");
      setSelectedType("class");
      setDate(getTodayDateString());
      setStartHour("09");
      setStartMinute("00");
      setStartPeriod("AM");
      setEndHour("10");
      setEndMinute("00");
      setEndPeriod("AM");
    }
  }, [isOpen]);

  const to24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  useEffect(() => {
    if (!isEditMode) return;
    if (!value?.year) return;
    if (!degree) return;
    if (!yearOptions.length) return;

    // const exists = yearOptions.some((y: any) => y.value === value.year);

    // if (exists) {
    //   setYear(value.year);
    // }
    // setYear(String(value.year));
    const incomingYear = String(value.year).trim();

    const exists = yearOptions.some((y: any) => {
      const optionYear = String(y.label).trim();
      return optionYear === incomingYear;
    });

    if (exists) {
      // 🔴 CHANGED: Set year directly from incoming value
      setYear(incomingYear);
    } else {
      console.warn(
        `Year ${incomingYear} not found in yearOptions`,
        yearOptions,
      );
    }
  }, [isEditMode, value?.year, degree, yearOptions]);


  useEffect(() => {
    if (!userId || loading) return;

    fetchFacultyContext(userId).then(ctx => {
      console.log("🟢 Faculty Context:", ctx);

      setFacultyCtx(ctx);
      setEducationId(ctx.collegeEducationId);
      setBranchId(ctx.collegeBranchId);

      if (ctx.academicYearIds?.length === 1) {
        setAcademicYearId(ctx.academicYearIds[0]);
      }
    });
  }, [userId, loading]);


  useEffect(() => {
    if (!collegeId || !facultyCtx) return;

    let cancelled = false;

    const loadAcademics = async () => {
      try {
        /* 1️⃣ Education */
        const educations = await fetchAcademicDropdowns({
          type: "education",
          collegeId,
        });
        if (cancelled) return;
        setEducations(educations ?? []);

        /* 2️⃣ Branch */
        const branches = await fetchAcademicDropdowns({
          type: "branch",
          collegeId,
          educationId: facultyCtx.collegeEducationId,
        });
        if (cancelled) return;
        setBranches(branches ?? []);

        /* 3️⃣ Academic Year */
        const academicYears = await fetchAcademicDropdowns({
          type: "academicYear",
          collegeId,
          educationId: facultyCtx.collegeEducationId,
          branchId: facultyCtx.collegeBranchId,
        });
        if (cancelled) return;
        setAcademicYears(academicYears ?? []);

        /* 🔥 auto-pick academic year */
        if (facultyCtx.academicYearIds?.length === 1) {
          setAcademicYearId(facultyCtx.academicYearIds[0]);
        }

        /* 4️⃣ Semester */
        const semesters = await fetchAcademicDropdowns({
          type: "semester",
          collegeId,
          educationId: facultyCtx.collegeEducationId,
          branchId: facultyCtx.collegeBranchId,
          academicYearId: facultyCtx.academicYearIds?.[0],
        });
        if (cancelled) return;
        setSemesters(semesters ?? []);

        // ✅ AUTO-SELECT SEMESTER CORRECTLY
        if ((semesters ?? []).length === 1) {
          setSemester(semesters[0].collegeSemesterId); // ← THIS WILL BE 20
          setIsSemesterAuto(true);
        }

        /* 5️⃣ Section (filtered by faculty access) */
        const sections = await fetchAcademicDropdowns({
          type: "section",
          collegeId,
          educationId: facultyCtx.collegeEducationId,
          branchId: facultyCtx.collegeBranchId,
          academicYearId: facultyCtx.academicYearIds?.[0],
        });

        const filteredSections = (sections ?? []).filter((s: any) =>
          facultyCtx.sectionIds.includes(s.collegeSectionsId)
        );

        setSections(filteredSections);

        // ✅ AUTO-FILL SECTION
        if (filteredSections.length === 1) {
          setSectionIds([filteredSections[0].collegeSectionsId]);
        }

        if (cancelled) return;
        setSections(filteredSections);

        if (filteredSections.length === 1) {
          setSectionId(filteredSections[0].collegeSectionsId);
        }

        /* 6️⃣ Subjects (derived from topics) */
        const { data: subjectRows } = await supabase
          .from("college_subject_unit_topics")
          .select(`
          collegeSubjectId,
          college_subjects (
            collegeSubjectId,
            subjectName
          )
        `)
          .eq("collegeId", collegeId)
          .in("collegeSubjectId", facultyCtx.subjectIds);

        if (cancelled) return;

        const subjectMap = new Map<number, SubjectRow>();
        subjectRows?.forEach((row: any) => {
          if (row.college_subjects) {
            subjectMap.set(
              row.college_subjects.collegeSubjectId,
              row.college_subjects
            );
          }
        });

        const subjects = Array.from(subjectMap.values());
        setSubjects(subjects);

        if (subjects.length === 1) {
          setSubjectId(subjects[0].collegeSubjectId);
          setSubject(subjects[0].subjectName);
        }
      } catch (err) {
        console.error("❌ Faculty academic bootstrap failed", err);
      }
    };

    loadAcademics();

    return () => {
      cancelled = true;
    };
  }, [collegeId, facultyCtx]);


  // useEffect(() => {
  //   if (!subjectId) return;

  //   supabase
  //     .from("college_subjects")
  //     .select("collegeSemesterId")
  //     .eq("collegeSubjectId", subjectId)
  //     .single()
  //     .then(({ data, error }) => {
  //       if (error) {
  //         console.error("Semester auto-fetch failed", error);
  //         return;
  //       }

  //       if (data?.collegeSemesterId) {
  //        setSemester(semesters[0].collegeSemesterId);
  //         setIsSemesterAuto(true);             // ✅ lock dropdown
  //       }
  //     });
  // }, [subjectId]);

  useEffect(() => {
    if (!subjectId) {
      console.log("⏸ Topics blocked - missing subjectId");
      return;
    }

    console.log("📚 Fetching topics for subjectId:", subjectId);

    supabase
      .from("college_subject_unit_topics")
      .select("collegeSubjectUnitTopicId, topicTitle")
      .eq("collegeSubjectId", subjectId)
      .eq("collegeId", collegeId)
      .then(({ data }) => {
        setTopics(data ?? []);
      });
  }, [subjectId]);


  if (selectedType === "meeting" && !title.trim()) {
    toast.error("Please enter meeting title");
    return;
  }


  const handleSave = () => {
    if (!date) {
      toast.error("Please select date");
      return;
    }

    if (!semester) {
      toast.error("Please select semester");
      return;
    }

    const startTime = to24Hour(startHour, startMinute, startPeriod);
    const endTime = to24Hour(endHour, endMinute, endPeriod);

    if (selectedType !== "meeting" && !topicId) {
      toast.error("Please select topic");
      return;
    }

    const payload: CalendarEventPayload = {
      facultyId: userId!,
      subjectId: selectedType === "meeting" ? null : subjectId!,

      eventTitle:
        selectedType === "meeting"
          ? title.trim() || "Meeting"
          : subject,

      eventTopic:
        selectedType === "meeting"
          ? null
          : topicId,     // ✅ integer FK

      type: selectedType.toLowerCase() as any,
      date,
      fromTime: startTime,
      toTime: endTime,
      roomNo,

      meetingLink: selectedType === "meeting" ? meetingLink : null,

      collegeEducationId: educationId!,
      collegeBranchId: branchId!,
      collegeAcademicYearId: academicYearId!,
      collegeSemesterId: semester!,
      sectionIds,
    };

    console.log("✅ FINAL EVENT PAYLOAD", payload);
    onSave(payload);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, onClose, handleSave]);

  useEffect(() => {
    if (!value || mode !== "edit") return;

    setSelectedType(value.type);
    setRoomNo(value.roomNo ?? "");
    setDate(value.date ?? getTodayDateString());

    setStartHour(value.startHour ?? "09");
    setStartMinute(value.startMinute ?? "00");
    setStartPeriod(value.startPeriod ?? "AM");

    setEndHour(value.endHour ?? "10");
    setEndMinute(value.endMinute ?? "00");
    setEndPeriod(value.endPeriod ?? "AM");

    setTopicId(value.topicId ?? null); // ✅ THIS AUTOFILLS TOPIC
  }, [value, mode]);

  useEffect(() => {
    if (!value || mode !== "edit") return;

    if (Array.isArray(value.sectionIds)) {
      setEditSectionIds(value.sectionIds); // store temporarily
    }
  }, [value, mode]);

  useEffect(() => {
    if (!editSectionIds) return;
    if (!sections.length) return;

    setSectionIds(editSectionIds); // ✅ now UI can resolve names
    setEditSectionIds(null);       // cleanup
  }, [sections, editSectionIds]);

  if (!isOpen) return null;

  const eventTypes = ["class", "meeting", "exam", "quiz"];

  const formatLabel = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const dateInputType = date || isDateInputFocused ? "date" : "text";

  const openDatePicker = () => {
    setIsDateInputFocused(true);
    dateInputRef.current?.focus();
    if (
      dateInputRef.current &&
      typeof dateInputRef.current.showPicker === "function"
    ) {
      dateInputRef.current.showPicker();
    }
  };

  const handleClose = () => {
    closedByUserRef.current = true;
    onClose();
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node | null;

    if (
      modalContentRef.current &&
      target &&
      !modalContentRef.current.contains(target)
    ) {
      handleClose();
    }
  };

  const availableSections = selectedDepartments
    .filter(
      (dep): dep is string => typeof dep === "string" && dep.trim() !== "",
    )
    .flatMap((dep) => {
      const key = dep.trim();
      const secs = sectionMap[key] ?? [];
      return secs.map((s) => `${key}-${s}`);
    });

  const toggleDepartment = (dep: string) => {
    setSelectedDepartments((prev) => {
      const updated = prev.includes(dep)
        ? prev.filter((d) => d !== dep)
        : [...prev, dep];

      setSelectedSections((prevSections) =>
        prevSections.filter((sec) =>
          updated.some((d) => sec.startsWith(`${d}-`)),
        ),
      );

      return updated;
    });
  };

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalContentRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-112.5 max-h-[90vh] flex flex-col relative"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky  z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {value ? "Edit Event" : "New Calendar Event"}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="text-gray-500 cursor-pointer hover:text-gray-800 transition-colors p-1"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div className="space-y-1">
            <label className="block text-gray-700 font-medium text-sm">
              Type
            </label>
            <div className="flex gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-1 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all border ${selectedType === type
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {formatLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {selectedType !== "meeting" && (
            // <div className="space-y-1">
            //   <label
            //     htmlFor="event-title"
            //     className="block text-gray-700 font-medium text-sm"
            //   >
            //     Event Title
            //   </label>
            //   <input
            //     id="event-title"
            //     type="text"
            //     value={title}
            //     onChange={(e) => setTitle(e.target.value)}
            //     placeholder="e.g., Project Kickoff or Physics Exam"
            //     className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
            //   />
            // </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>

              <input
                type="text"
                readOnly
                value={subjects.find(s => s.collegeSubjectId === subjectId)?.subjectName || subject || ""}
                className={`
      w-full ${INPUT_HEIGHT}
      border border-[#C9C9C9]
      rounded-lg px-3
      bg-gray-50 text-gray-900
      cursor-not-allowed
      outline-none
    `}
              />
            </div>
          )}

          {selectedType === "meeting" && (
            <>
              {/* 🔹 Meeting Title */}
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-sm">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Parent Meeting / Dept Review"
                  className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5"
                />
              </div>

              {/* 🔹 Meeting Link */}
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-sm">
                  Meeting Link
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Topic *
            </label>

            <div className="relative">
              <select
                value={topicId ?? ""}
                onChange={(e) => setTopicId(Number(e.target.value))}
                className={`
        w-full h-[44px]
        border border-[#C9C9C9]
        rounded-lg px-3 pr-10
        bg-white text-gray-900
        outline-none cursor-pointer
        focus:border-emerald-500
        focus:ring-1 focus:ring-emerald-500
        transition-all
        ${!topicId ? "text-gray-400" : "text-gray-900"}
      `}
              >
                <option value="" disabled>
                  Select Topic
                </option>

                {topics.map((t) => (
                  <option
                    key={t.collegeSubjectUnitTopicId}
                    value={t.collegeSubjectUnitTopicId}
                    className="text-gray-900"
                  >
                    {t.topicTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full cursor-pointer border border-[#C9C9C9] rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Room No.
                </label>
                <input
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="w-full border border-[#C9C9C9] rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                  placeholder="Enter Room no."
                />
              </div>
            </div>

            <div className="w-1/2 space-y-1 mt-3">
              <label className="block text-gray-700 font-medium text-sm">
                Time
              </label>

              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="block text-gray-500 text-xs mb-1">From</span>
                  <div className="flex gap-1.5">
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="border cursor-pointer border-[#C9C9C9] rounded-lg px-2 py-2 w-14.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const h = String(i + 1).padStart(2, "0");
                        return <option key={h}>{h}</option>;
                      })}
                    </select>

                    <select
                      value={startMinute}
                      onChange={(e) => setStartMinute(e.target.value)}
                      className="border cursor-pointer border-[#C9C9C9] rounded-lg px-2 py-2 w-16 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i * 5).padStart(2, "0");
                        return <option key={m}>{m}</option>;
                      })}
                    </select>

                    <select
                      value={startPeriod}
                      onChange={(e) =>
                        setStartPeriod(e.target.value as "AM" | "PM")
                      }
                      className="border cursor-pointer border-[#C9C9C9] rounded-lg px-2 py-2 w-16 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1">
                  <span className="block text-gray-500 text-xs mb-1">To</span>
                  <div className="flex gap-1.5">
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                      className="border cursor-pointer border-[#C9C9C9] rounded-lg px-2 py-2 w-14.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const h = String(i + 1).padStart(2, "0");
                        return <option key={h}>{h}</option>;
                      })}
                    </select>

                    <select
                      value={endMinute}
                      onChange={(e) => setEndMinute(e.target.value)}
                      className="border cursor-pointer border-[#C9C9C9] rounded-lg px-2 py-2 w-16 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i * 5).padStart(2, "0");
                        return <option key={m}>{m}</option>;
                      })}
                    </select>

                    <select
                      value={endPeriod}
                      onChange={(e) =>
                        setEndPeriod(e.target.value as "AM" | "PM")
                      }
                      className="border cursor-pointer border-[#C9C9C9] rounded-lg px-2 py-2 w-16 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Type *
              </label>
              <input
                readOnly
                value={
                  educations.find(e => e.collegeEducationId === educationId)
                    ?.collegeEducationType || ""
                }
                className={`
    w-full ${INPUT_HEIGHT}
    border border-[#C9C9C9]
    rounded-lg px-3
    bg-gray-50 text-gray-900
    cursor-not-allowed
    outline-none
  `}
              />

              {/* <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9]
      rounded-lg px-3 bg-white outline-none cursor-pointer`}
              >
                <option value="">Select Edu. Type</option>
                {degreeOptions.map((deg) => (
                  <option key={deg.degreeType} value={deg.degreeType}>
                    {deg.degreeType}
                  </option>
                ))}
              </select> */}
              {degree && (
                <div className={`${CHIP_CONTAINER_HEIGHT} mt-2 flex gap-2`}>
                  <span
                    className="flex items-center gap-1 bg-green-100 text-green-700
      px-3 py-1 rounded-full text-xs"
                  >
                    {degree}
                    <button
                      onClick={() => setDegree("")}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch *
              </label>

              <input
                type="text"
                readOnly
                value={
                  branches.find(
                    (b) => b.collegeBranchId === branchId
                  )?.collegeBranchCode || ""
                }
                className={`
      w-full ${INPUT_HEIGHT}
      border border-[#C9C9C9]
      rounded-lg px-3
      bg-gray-50 text-gray-900
      cursor-not-allowed
      outline-none
    `}
              />
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                readOnly
                value={
                  academicYears.find(y => y.collegeAcademicYearId === academicYearId)
                    ?.collegeAcademicYear || ""
                }
                className={`
    w-full ${INPUT_HEIGHT}
    border border-[#C9C9C9]
    rounded-lg px-3
    bg-gray-50 text-gray-900
    cursor-not-allowed
    outline-none
  `}
              />

              {/* <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 cursor-pointer
        rounded-lg px-3 bg-white`}
              >
                <option value="">Select Year</option>
                {/* {yearOptions.map((y: any) => (
                  <option key={y.uuid} value={y.value} className="cursor-pointer">{y.label}</option>
                ))} */}
              {yearOptions.map((y: any) => {
                const yearValue = String(y.label);
                return (
                  <option key={yearValue} value={yearValue}>
                    {yearValue}
                  </option>
                );
              })}
              {/* </select>  */}
            </div>
            {/* Semester */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>

              <select
                value={semester ?? ""}
                disabled={isSemesterAuto}
                onChange={(e) => {
                  if (isSemesterAuto) return;
                  setSemester(Number(e.target.value));
                }}
                className={`
    w-full ${INPUT_HEIGHT}
    border border-[#C9C9C9]
    rounded-lg px-3 text-sm
    focus:ring-2 focus:ring-[#43C17A]
    focus:outline-none
    ${isSemesterAuto
                    ? "bg-gray-50 cursor-not-allowed text-gray-900"
                    : "bg-white cursor-pointer text-gray-900"
                  }
  `}
              >
                <option value="" disabled hidden>
                  Select Semester
                </option>

                {semesters.map((s) => (
                  <option key={s.collegeSemesterId} value={s.collegeSemesterId}>
                    Semester {s.collegeSemester}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6️⃣ Section */}
          {/* 6️⃣ Section */}
          <div className="flex-1 min-w-0 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section *
            </label>

            {/* Selected display */}
            <div
              onClick={() => setIsSectionOpen((p) => !p)}
              className={`
      w-full ${INPUT_HEIGHT}
      border border-[#C9C9C9]
      rounded-lg px-3
      bg-white text-sm
      cursor-pointer
      flex items-center justify-between
      focus:ring-2 focus:ring-[#43C17A]
    `}
            >
              <span className={sectionIds.length ? "text-gray-900" : "text-gray-400"}>
                {sectionIds.length === 0
                  ? "Select sections"
                  : sections
                    .filter((s) => sectionIds.includes(s.collegeSectionsId))
                    .map((s) => s.collegeSections)
                    .join(", ")}
              </span>

              <span className="text-gray-400">▾</span>
            </div>

            {/* Dropdown */}
            {isSectionOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
                {sections.map((s) => {
                  const checked = sectionIds.includes(s.collegeSectionsId);

                  return (
                    <label
                      key={s.collegeSectionsId}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSectionIds((prev) =>
                            checked
                              ? prev.filter((id) => id !== s.collegeSectionsId)
                              : [...prev, s.collegeSectionsId]
                          );
                        }}
                        className="accent-emerald-500"
                      />
                      <span className="text-sm text-gray-700">
                        {s.collegeSections}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-base"
            >
              {isSaving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update Event"
                  : "Save Event"}
              {/* {value ? "Update Event" : "Save Event"} */}
            </button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default AddEventModal;
