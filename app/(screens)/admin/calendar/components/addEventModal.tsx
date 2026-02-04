"use client";

import { X } from "@phosphor-icons/react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { UiNamedItem } from "@/lib/helpers/calendar/types";
import { fetchFacultyContextAdmin } from "@/app/utils/context/facultyContextAPI";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";

type DegreeOption = {
  collegeDegreeId: number;
  degreeType: string;
  departments: string;
  years?: any;
  sections?: Record<string, string[]>;
};
interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: any | null;
  onSave: (eventData: any) => void;
  degreeOptions?: DegreeOption[];
  isSaving?: boolean;
  mode: "create" | "edit";
}

type FacultySection = {
  collegeSectionsId: number;
  collegeSections: string;
};
const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};
const TODAY = getTodayDateString();
const INPUT_HEIGHT = "h-[44px]";
const CHIP_CONTAINER_HEIGHT = "h-[32px]";

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSave, value, degreeOptions, isSaving = false, mode }) => {
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("Class");
  const [date, setDate] = useState(TODAY);
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
  const closedByUserRef = useRef(false);
  const [topic, setTopic] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [year, setYear] = useState<string>("");
  const [selectedDepartments, setSelectedDepartments] = useState<UiNamedItem[]>([]);
  const [selectedSections, setSelectedSections] = useState<FacultySection[]>([]);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [degree, setDegree] = useState("");
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [facultyCtx, setFacultyCtx] = useState<any>(null);
  const [educationId, setEducationId] = useState<number>();
  const [branchId, setBranchId] = useState<number>();
  const [academicYearId, setAcademicYearId] = useState<number>();
  const [sectionId, setSectionId] = useState<number>();
  const [subjectId, setSubjectId] = useState<number>();
  const [topicId, setTopicId] = useState<number>();
  const [semester, setSemester] = useState<number>();
  const [branchName, setBranchName] = useState("");
  const [academicYearLabel, setAcademicYearLabel] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [sections, setSections] = useState<FacultySection[]>([]);
  const [semesterLabel, setSemesterLabel] = useState<number | null>(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const isMeeting = selectedType.toLowerCase() === "meeting";

  const { collegeId } = useUser()
  const isEditMode = mode === "edit";

  const selectedDegreeObj = React.useMemo(() => {
    return degreeOptions?.find((d) => d.degreeType === degree);
  }, [degree, degreeOptions]);

  const yearOptions = React.useMemo(() => {
    return selectedDegreeObj?.years ?? [];
  }, [selectedDegreeObj?.years]);

  useEffect(() => {
    if (!isOpen || !value?.facultyId) return;
    fetchFacultyContextAdmin({ facultyId: Number(value.facultyId) })
      .then((ctx) => {
        setFacultyCtx(ctx);

        setEducationId(ctx.collegeEducationId);
        setBranchId(ctx.collegeBranchId);

        if (ctx.academicYearIds?.length === 1) {
          setAcademicYearId(ctx.academicYearIds[0]);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load faculty context", err);
        toast.error("Failed to load faculty context");
      });
  }, [isOpen, value?.facultyId]);

  useEffect(() => {
    if (!collegeId || !facultyCtx) return;
    fetchAcademicDropdowns({
      type: "branch",
      collegeId,
      educationId: facultyCtx.collegeEducationId,
    }).then(branches => {
      const b = branches.find(
        br => br.collegeBranchId === facultyCtx.collegeBranchId
      );
      setBranchName(b?.collegeBranchCode || b?.collegeBranchType || "");
    });

    fetchAcademicDropdowns({
      type: "academicYear",
      collegeId,
      educationId: facultyCtx.collegeEducationId,
      branchId: facultyCtx.collegeBranchId,
    }).then(years => {
      const y = years.find(yr =>
        facultyCtx.academicYearIds.includes(yr.collegeAcademicYearId)
      );
      setAcademicYearLabel(y?.collegeAcademicYear || "");
    });

  }, [collegeId, facultyCtx]);

  useEffect(() => {
    if (!collegeId || !facultyCtx) return;
    let cancelled = false;
    const loadFacultyAcademics = async () => {
      try {
        const sectionRows = await fetchAcademicDropdowns({
          type: "section",
          collegeId,
          educationId: facultyCtx.collegeEducationId,
          branchId: facultyCtx.collegeBranchId,
          academicYearId: facultyCtx.academicYearIds?.[0],
        });

        const filteredSections = (sectionRows ?? []).filter((s: any) =>
          facultyCtx.sectionIds.includes(s.collegeSectionsId)
        );

        if (!cancelled) {
          setSections(filteredSections);
          if (filteredSections.length === 1) {
            setSectionId(filteredSections[0].collegeSectionsId);
          }
        }

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

        const subjectMap = new Map<number, any>();
        subjectRows?.forEach((row: any) => {
          if (row.college_subjects) {
            subjectMap.set(
              row.college_subjects.collegeSubjectId,
              row.college_subjects
            );
          }
        });

        const subjectsArr = Array.from(subjectMap.values());
        setSubjects(subjectsArr);

        if (subjectsArr.length === 1) {
          setSubjectId(subjectsArr[0].collegeSubjectId);
        }
      } catch (err) {
        console.error("❌ Admin faculty academic load failed", err);
      }
    };

    loadFacultyAcademics();
    return () => {
      cancelled = true;
    };
  }, [collegeId, facultyCtx]);

  useEffect(() => {
    if (!subjectId || !collegeId) return;

    supabase
      .from("college_subject_unit_topics")
      .select("collegeSubjectUnitTopicId, topicTitle")
      .eq("collegeId", collegeId)
      .eq("collegeSubjectId", subjectId)
      .then(({ data }) => {
        setTopics(data ?? []);
      });
  }, [subjectId, collegeId]);

  useEffect(() => {
    if (!subjectId || !collegeId || !facultyCtx) return;

    supabase
      .from("college_subjects")
      .select("collegeSemesterId")
      .eq("collegeSubjectId", subjectId)
      .single()
      .then(async ({ data }) => {
        if (!data?.collegeSemesterId) return;

        setSemester(data.collegeSemesterId);

        const semesters = await fetchAcademicDropdowns({
          type: "semester",
          collegeId,
          educationId: facultyCtx.collegeEducationId,
          academicYearId: facultyCtx.academicYearIds[0],
        });

        const sem = semesters.find(
          s => s.collegeSemesterId === data.collegeSemesterId
        );

        setSemesterLabel(sem?.collegeSemester ?? null);
      });
  }, [subjectId, collegeId, facultyCtx]);

  useEffect(() => {
    if (!degree) return;
    if (isEditMode) return;
    setSelectedDepartments([]);
    setSelectedSections([]);
    if (year && !yearOptions.some((y: any) => y.value === year)) {
      setYear("");
    }
  }, [degree, isEditMode, yearOptions]);

  const normalizeYear = (y: any) =>
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(String(y)) ? String(y) : "";

  useEffect(() => {
    if (!isOpen || !value) return;

    setTitle(value.title || "");
    setTopic(value.topic || "");
    setRoomNo(value.roomNo || "");
    setDegree(value.degree || "");
    setSelectedDepartments(value.departments || []);
    setSelectedSections(value.sections || []);
    setYear(normalizeYear(value.year));
    // setSemester(value.semester || []);
    setSelectedType(value.type || "class");
    setDate(value.date || getTodayDateString());
    if (isEditMode && typeof value.semester === "number") {
      setSemester(value.semester);
    }

    if (value.startTime && value.endTime) {
      const start = parse24HourTo12Hour(value.startTime);
      const end = parse24HourTo12Hour(value.endTime);

      setStartHour(start.hour);
      setStartMinute(start.minute);
      setStartPeriod(start.period);

      setEndHour(end.hour);
      setEndMinute(end.minute);
      setEndPeriod(end.period);
    }
  }, [isOpen, value]);


  useEffect(() => {
  if (!isOpen) {
    setTitle("");
    setTopic("");
    setRoomNo("");
    setDegree("");
    setSelectedDepartments([]);
    setSelectedSections([]);
    setYear("");
    setSemester(undefined); // 🔴 FIX
    setSemesterLabel(null); // 🔴 FIX
    setSelectedType("class");
    setDate(getTodayDateString());
    setStartHour("09");
    setStartMinute("00");
    setStartPeriod("AM");
    setEndHour("10");
    setEndMinute("00");
    setEndPeriod("AM");
    setIsDeptOpen(false);
    setIsSectionOpen(false);
  }
}, [isOpen]);


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

  const parse24HourTo12Hour = (time: string) => {
    const [h, m] = time.split(":").map(Number);

    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;

    return {
      hour: String(hour12).padStart(2, "0"),
      minute: String(m).padStart(2, "0"),
      period,
    };
  };

  const to24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const isValidMeetingLink = (url: string) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (date < TODAY) {
      toast.error("Past dates are not allowed");
      return;
    }
    if (isMeeting) {
      if (!meetingTitle.trim()) {
        toast.error("Please enter a Meeting Title.");
        return;
      }

      if (!meetingLink.trim()) {
        toast.error("Please enter the Meeting Link.");
        return;
      }

      if (!isValidMeetingLink(meetingLink.trim())) {
        toast.error(
          "Please enter a valid meeting link."
        );
        return;
      }
    }

    if (!isMeeting) {
      if (!subjectId) {
        toast.error("Please select Subject.");
        return;
      }
      if (!topicId) {
        toast.error("Please select Event Topic.");
        return;
      }
    }
    if (!date) {
      toast.error("Please select a Date.");
      return;
    }
    // if (topic.trim() === "") {
    //   toast.error("Please enter an Event Topic.");
    //   return;
    // }
    // if (!degree) {
    //   toast.error("Please select a Degree.");
    //   return;
    // }
    if (!educationId) {
      toast.error("Education Type not resolved. Please reload.");
      return;
    }
    // if (selectedDepartments.length === 0) {
    //   toast.error("Please select at least one Department.");
    //   return;
    // }
    if (!branchId) {
      toast.error("Branch not resolved. Please reload.");
      return;
    }
    if (!facultyCtx?.academicYearIds?.length) {
      toast.error("Academic Year not resolved.");
      return;
    }
    if (selectedSections.length === 0) {
      toast.error("Please select at least one Section.");
      return;
    }
    // if (!semester) {
    //   toast.error("Please select Semester.");
    //   return;
    // }
    if (typeof semester !== "number") {
      toast.error("Semester not resolved.");
      return;
    }
    if (!semester || !semesterLabel) {
      toast.error("Semester not resolved.");
      return;
    }
    if (!roomNo.trim()) {
      toast.error("Please enter Room No.");
      return;
    }
    const startTime = to24Hour(startHour, startMinute, startPeriod);
    const endTime = to24Hour(endHour, endMinute, endPeriod);
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }
    if (startTime < "08:00" || endTime > "22:00") {
      toast.error("Events must be between 08:00 AM and 10:00 PM");
      return;
    }
    // const newEvent = {
    //   title,
    //   topic,
    //   roomNo,
    //   degree,
    //   departments: selectedDepartments,
    //   sections: selectedSections,
    //   year: year,
    //   semester,
    //   type: selectedType.toLowerCase(),
    //   date,
    //   startTime,
    //   endTime,
    // };
    // 🔴 FIXED: payload aligned with helper + DB
    const newEvent = {
      calendarEventId: isEditMode ? value?.calendarEventId : undefined,

      facultyId: Number(value.facultyId),

      // 🔴 academic context (EXPLICIT)
      educationId,
      branchId,
      academicYearId: facultyCtx?.academicYearIds?.[0],
      semester,

      // 🔴 section mapping
      sections: selectedSections.map(sec => ({
        collegeSectionId: sec.collegeSectionsId,
      })),

      // 🔴 event core fields
      subjectId: isMeeting ? null : subjectId ?? null,
      eventTopic: isMeeting ? null : topicId ?? null,
      type: selectedType.toLowerCase(),

      date,
      roomNo,
      fromTime: startTime,
      toTime: endTime,

      meetingLink: isMeeting ? meetingLink : null,
      meetingTitle: isMeeting ? meetingTitle.trim() : null,
    };

    onSave(newEvent);
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
    if (!isEditMode) return;
    if (!value?.year) return;
    if (!degree) return;
    if (!yearOptions.length) return;
    setYear(String(value.year));
  }, [isEditMode, value?.year, degree, yearOptions]);

  if (!isOpen) return null;

  const eventTypes = ["class", "meeting", "exam", "quiz"];

  const formatLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  const handleClose = () => {
    closedByUserRef.current = true;
    onClose();
  };

  const toggleSection = (section: FacultySection) => {
    setSelectedSections(prev =>
      prev.some(s => s.collegeSectionsId === section.collegeSectionsId)
        ? prev.filter(s => s.collegeSectionsId !== section.collegeSectionsId)
        : [...prev, section]
    );
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleDateBlur = () => {
    if (!date) return;
    if (date.length !== 10) return;
    if (date < TODAY) {
      toast.error("You cannot select a past date");
      setDate(TODAY);
    }
  };
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalContentRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-112.5 max-h-[90vh] flex flex-col relative"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky  z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Edit Event" : "New Calendar Event"}
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
          {!isMeeting && <>
            <div className="space-y-1">
              <label htmlFor="event-title" className="block text-gray-700 font-medium text-sm">
                Subject
              </label>
              <input
                id="event-title"
                type="text"
                // value={title}
                disabled
                value={subjects.find(s => s.collegeSubjectId === subjectId)?.subjectName || ""}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Project Kickoff or Physics Exam"
                className="w-full cursor-not-allowed border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Event Topic</label>
              <select
                value={topicId ?? ""}
                onChange={(e) => setTopicId(Number(e.target.value))}
                className="w-full cursor-pointer h-11 border border-[#C9C9C9] rounded-lg px-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
              >
                <option value="">Select Topic</option>
                {topics.map(t => (
                  <option
                    key={t.collegeSubjectUnitTopicId}
                    value={t.collegeSubjectUnitTopicId}
                  >
                    {t.topicTitle}
                  </option>
                ))}
              </select>
            </div>
          </>}
          {isMeeting && <>
            <div className="space-y-1">
              <label htmlFor="event-title" className="block text-gray-700 font-medium text-sm">
                Meeting Title
              </label>
              <input
                id="event-title"
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g., Parent–Teacher Meeting, Project Review, Sprint Planning"
                className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="event-title" className="block text-gray-700 font-medium text-sm">
                Meeting Link
              </label>
              <input
                id="event-title"
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="e.g., https://meet.google.com/abc-defg-hij"
                className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
              />
            </div>
          </>}
          <div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={date}
                  min={TODAY}
                  onChange={handleDateChange}
                  onBlur={handleDateBlur}
                  //onChange={(e) => setDate(e.target.value)}
                  className="w-full cursor-pointer border border-[#C9C9C9] rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Room No.</label>
                <input
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value.toUpperCase())}
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
                      onChange={(e) => setStartPeriod(e.target.value as "AM" | "PM")}
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
                      onChange={(e) => setEndPeriod(e.target.value as "AM" | "PM")}
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
                Education Type <span className="text-red-600">*</span>
              </label>
              <input
                readOnly
                value={
                  degreeOptions?.find(
                    d => d.collegeDegreeId === educationId
                  )?.degreeType || ""
                }
                className="w-full h-11 border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-red-600">*</span>
              </label>
              <input
                readOnly
                value={branchName}
                className="w-full h-11 border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-600">*</span>
              </label>
              <input
                readOnly
                value={academicYearLabel}
                className="w-full h-11 border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-600">*</span>
              </label>
              <input
                readOnly
                value={semesterLabel ? `Semester ${semesterLabel}` : ""}
                className="w-full h-11 border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section <span className="text-red-600">*</span>
            </label>
            <div className="relative" ref={sectionDropdownRef}>
              <button
                type="button"
                disabled={!sections.length}
                onClick={() => {
                  setIsSectionOpen((v) => !v);
                }}
                className={`w-full cursor-pointer ${INPUT_HEIGHT} flex justify-between items-center 
    border border-[#C9C9C9] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 
    transition-all text-gray-700 rounded-lg px-3 bg-white disabled:bg-gray-100`}
              >
                {selectedSections.length
                  ? `${selectedSections.length} section(s) selected`
                  : "Select Section"}
                <span className="mr-1 -mt-3">⌄</span>
              </button>
              {isSectionOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border 
        rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                  {sections.map((sec) => (
                    <label
                      key={`section-chip-${sec.collegeSectionsId}`}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSections.some(
                          s => s.collegeSectionsId === sec.collegeSectionsId
                        )}
                        onChange={() => toggleSection(sec)}
                      />
                      {sec.collegeSections}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedSections.length > 0 &&
              <div
                className={`${CHIP_CONTAINER_HEIGHT} mt-2 flex gap-2 overflow-x-auto 
      whitespace-nowrap scrollbar-hide`}
              >
                {selectedSections.map((sec) => (
                  <span
                    key={`section-option-${sec.collegeSectionsId}`}
                    className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
                  >
                    {sec.collegeSections}
                    <button
                      onClick={() => toggleSection(sec)}
                      className="cursor-pointer hover:text-green-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            }
          </div>
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-base"
            >
              {isSaving ? isEditMode ? "Updating..." : "Saving..." : isEditMode ? "Update Event" : "Save Event"}
            </button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default AddEventModal;