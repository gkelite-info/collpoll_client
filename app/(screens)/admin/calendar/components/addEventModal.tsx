"use client";

import { X, CaretDown } from "@phosphor-icons/react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { fetchFacultyContextAdmin } from "@/app/utils/context/faculty/facultyContextAPI";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import RoomSelectDropdown from "@/app/components/calendar/RoomSelectDropdown";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";

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

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  value,
  degreeOptions,
  isSaving = false,
  mode,
}) => {
  const [selectedType, setSelectedType] = useState("class");
  const [calendarMode, setCalendarMode] = useState<"single" | "bulk">("single");
  const [fromDate, setFromDate] = useState(TODAY);
  const [toDate, setToDate] = useState(TODAY);
  const [units, setUnits] = useState<any[]>([]);
  const [unitIds, setUnitIds] = useState<number[]>([]);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const unitDropdownRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState(TODAY);
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
  const closedByUserRef = useRef(false);
  const router = useRouter();
  const [roomNo, setRoomNo] = useState("");
  const [collegeRoomId, setCollegeRoomId] = useState<number | null>(null);
  const [year, setYear] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<FacultySection[]>(
    [],
  );
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [isTopicFocused, setIsTopicFocused] = useState(false);
  const [degree, setDegree] = useState("");
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [facultyCtx, setFacultyCtx] = useState<any>(null);
  const [educationId, setEducationId] = useState<number>();
  const [branchId, setBranchId] = useState<number>();
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
  const [meetingPlatform, setMeetingPlatform] = useState<
    "meet" | "zoom" | "others"
  >("meet");
  const [meetingId, setMeetingId] = useState("");
  const [meetingPassword, setMeetingPassword] = useState("");

  const isMeeting = selectedType.toLowerCase() === "meeting";
  const { collegeId } = useUser();
  const { collegeEducationType } = useAdmin();

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
      })
      .catch((err) => {
        toast.error("Failed to load faculty context");
      });
  }, [isOpen, value?.facultyId]);

  useEffect(() => {
    if (!collegeId || !facultyCtx) return;
    fetchAcademicDropdowns({
      type: "branch",
      collegeId,
      educationId: facultyCtx.collegeEducationId,
    }).then((branches) => {
      const b = branches.find(
        (br) => br.collegeBranchId === facultyCtx.collegeBranchId,
      );
      setBranchName(b?.collegeBranchCode || b?.collegeBranchType || "");
    });
    fetchAcademicDropdowns({
      type: "academicYear",
      collegeId,
      educationId: facultyCtx.collegeEducationId,
      branchId: facultyCtx.collegeBranchId,
    }).then((years) => {
      const y = years.find((yr) =>
        facultyCtx.academicYearIds.includes(yr.collegeAcademicYearId),
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
          facultyCtx.sectionIds.includes(s.collegeSectionsId),
        );
        if (!cancelled) {
          setSections(filteredSections);
        }

        const { data: subjectRows } = await supabase
          .from("college_subjects")
          .select("collegeSubjectId, subjectName")
          .eq("collegeId", collegeId)
          .in("collegeSubjectId", facultyCtx.subjectIds);

        if (cancelled) return;

        const subjectsArr = subjectRows || [];
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
    supabase
      .from("college_subject_units")
      .select("collegeSubjectUnitId, unitTitle, unitNumber")
      .eq("collegeId", collegeId)
      .eq("collegeSubjectId", subjectId)
      .order("unitNumber", { ascending: true })
      .then(({ data }) => {
        setUnits(data ?? []);
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
          (s) => s.collegeSemesterId === data.collegeSemesterId,
        );
        setSemesterLabel(sem?.collegeSemester ?? null);
      });
  }, [subjectId, collegeId, facultyCtx]);

  useEffect(() => {
    if (!degree) return;
    if (isEditMode) return;
    setSelectedSections([]);
    if (year && !yearOptions.some((y: any) => y.value === year)) {
      setYear("");
    }
  }, [degree, isEditMode, yearOptions]);

  const normalizeYear = (y: any) =>
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(String(y))
      ? String(y)
      : "";

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      setRoomNo("");
      setDegree("");
      setSelectedSections([]);
      setYear("");
      setSemester(undefined);
      setSemesterLabel(null);
      setCalendarMode("single");
      setFromDate(TODAY);
      setToDate(TODAY);
      setUnitIds([]);
      setIsUnitOpen(false);
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
      setSubjectId(undefined);
      setTopicId(undefined);
      setMeetingTitle("");
      setMeetingLink("");
      setMeetingId("");
      setMeetingPassword("");
      setMeetingPlatform("meet");
      return;
    }

    if (isOpen && value && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setRoomNo(value.roomNo || "");
      setCollegeRoomId(value.collegeRoomId ?? null);
      setDegree(value.degree || "");
      setSelectedSections(value.sections || []);
      setYear(normalizeYear(value.year));
      setSelectedType(value.type || "class");
      setDate(value.date || getTodayDateString());
      if (typeof value.subjectId === "number") {
        setSubjectId(value.subjectId);
      }
      if (typeof value.topicId === "number") {
        setTopicId(value.topicId);
      }
      if (isEditMode && typeof value.semester === "number") {
        setSemester(value.semester);
      }
      if (isEditMode && typeof value.semesterId === "number") {
        setSemester(value.semesterId);
      }

      // Restore bulk-specific fields
      if (value.calendarMode) {
        setCalendarMode(value.calendarMode);
      }
      if (value.fromDate) {
        setFromDate(value.fromDate);
      }
      if (value.toDate) {
        setToDate(value.toDate);
      }
      if (Array.isArray(value.unitIds) && value.unitIds.length > 0) {
        setUnitIds(value.unitIds);
      }

      setMeetingTitle(value.title ?? "");
      setMeetingLink(value.meetingLink ?? "");
      setMeetingId(value.meetingId ?? "");
      setMeetingPassword(value.meetingPassword ?? "");

      if (value.meetingId) setMeetingPlatform("zoom");
      else if (value.meetingLink?.includes("meet.google"))
        setMeetingPlatform("meet");
      else setMeetingPlatform("others");

      // Restore time components: prefer 12h fields, fallback to 24h parsing
      if (value.startHour && value.startMinute && value.startPeriod) {
        setStartHour(value.startHour);
        setStartMinute(value.startMinute);
        setStartPeriod(value.startPeriod);
        setEndHour(value.endHour);
        setEndMinute(value.endMinute);
        setEndPeriod(value.endPeriod);
      } else if (value.startTime && value.endTime) {
        const start = parse24HourTo12Hour(value.startTime);
        const end = parse24HourTo12Hour(value.endTime);
        setStartHour(start.hour);
        setStartMinute(start.minute);
        setStartPeriod(start.period);
        setEndHour(end.hour);
        setEndMinute(end.minute);
        setEndPeriod(end.period);
      }
    }
  }, [isOpen, value, isEditMode]);



  useEffect(() => {
    if (!isEditMode) return;
    if (!topics.length) return;
    if (typeof value?.topicId !== "number") return;
    setTopicId(value.topicId);
  }, [topics, isEditMode, value?.topicId]);

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
    // 🟢 1. Meeting Specific Validations
    if (isMeeting) {
      if (!meetingTitle.trim()) {
        toast.error("Please enter a Meeting Title.");
        return;
      }
      if (meetingPlatform === "zoom") {
        if (!meetingId.trim()) {
          toast.error("Please enter Zoom Meeting ID");
          return;
        }
        if (!meetingPassword.trim()) {
          toast.error("Please enter Meeting Password");
          return;
        }
      } else if (meetingPlatform === "meet") {
        if (!meetingLink.trim()) {
          toast.error("Please enter Google Meet Link");
          return;
        }
        if (!meetingLink.includes("meet.google.com")) {
          toast.error("Please enter a valid Google Meet link");
          return;
        }
      } else if (meetingPlatform === "others") {
        if (!meetingLink.trim()) {
          toast.error("Please enter Meeting Link");
          return;
        }
        if (!isValidMeetingLink(meetingLink.trim())) {
          toast.error("Please enter a valid meeting link");
          return;
        }
      }
    }

    if (!subjectId) {
      toast.error("Please select a Subject.");
      return;
    }

    if (calendarMode === "bulk") {
      if (unitIds.length === 0) {
        toast.error(
          units.length === 0
            ? "No units exist for this subject. Please add them in Academic Setup first."
            : "Please select at least one Unit.",
        );
        return;
      }
    } else {
      if (!topicId) {
        toast.error(
          topics.length === 0
            ? "No topics exist for this subject. Please add them in Academic Setup first."
            : "Please select an Event Topic.",
        );
        return;
      }
    }

    if (selectedType === "class" && !roomNo.trim()) {
      toast.error("Please select a Room No.");
      return;
    }

    if (calendarMode === "bulk") {
      if (!fromDate || !toDate) {
        toast.error("Please select both From Date and To Date.");
        return;
      }
      if (fromDate > toDate) {
        toast.error("From Date cannot be later than To Date.");
        return;
      }
    } else {
      if (!date) {
        toast.error("Please select a Date.");
        return;
      }
      if (date < TODAY) {
        toast.error("Past dates are not allowed.");
        return;
      }
    }

    const startTime = to24Hour(startHour, startMinute, startPeriod);
    const endTime = to24Hour(endHour, endMinute, endPeriod);

    if (startTime >= endTime) {
      toast.error("End time must be strictly after start time.");
      return;
    }
    if (startTime < "08:00" || endTime > "22:00") {
      toast.error("Events must be scheduled between 08:00 AM and 10:00 PM.");
      return;
    }

    if (
      !educationId ||
      !branchId ||
      !facultyCtx?.academicYearIds?.length ||
      typeof semester !== "number" ||
      !semesterLabel
    ) {
      toast.error("Academic context is incomplete. Please reload the page.");
      return;
    }
    if (selectedSections.length === 0) {
      toast.error("Please select at least one Section.");
      return;
    }

    const newEvent = {
      calendarEventId: isEditMode ? value?.calendarEventId : undefined,
      facultyId: Number(value.facultyId),
      educationId,
      branchId,
      academicYearId: facultyCtx?.academicYearIds?.[0],
      semester,
      sections: selectedSections.map((sec) => ({
        collegeSectionId: sec.collegeSectionsId,
      })),

      subjectId: subjectId ?? null,
      eventTopic: topicId ?? null,

      type: selectedType.toLowerCase(),
      calendarMode,
      fromDate,
      toDate,
      eventUnitIds: unitIds,
      date,
      roomNo: roomNo.trim(),
      collegeRoomId: collegeRoomId ?? null,
      fromTime: startTime,
      toTime: endTime,

      meetingLink: isMeeting && meetingPlatform !== "zoom" ? meetingLink : null,
      meetingId: isMeeting && meetingPlatform === "zoom" ? meetingId : null,
      meetingPassword:
        isMeeting && meetingPlatform === "zoom" ? meetingPassword : null,
      meetingTitle: isMeeting ? meetingTitle.trim() : null,
    };

    onSave(newEvent);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(target) &&
        (!unitDropdownRef.current || !unitDropdownRef.current.contains(target))
      ) {
        onClose();
      }
      
      if (
        isUnitOpen &&
        unitDropdownRef.current &&
        !unitDropdownRef.current.contains(target)
      ) {
        setIsUnitOpen(false);
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

  if (!isOpen) return null;
  const eventTypes = ["class", "meeting", "exam"];
  const formatLabel = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const handleClose = () => {
    closedByUserRef.current = true;
    onClose();
  };

  const toggleSection = (section: FacultySection) => {
    setSelectedSections((prev) =>
      prev.some((s) => s.collegeSectionsId === section.collegeSectionsId)
        ? prev.filter((s) => s.collegeSectionsId !== section.collegeSectionsId)
        : [...prev, section],
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalContentRef}
        className="bg-white rounded-xl shadow-2xl w-[95%] md:max-w-[450px] lg:max-w-[450px] max-h-[90vh] flex flex-col relative"
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
              Event Mode
            </label>
            <div className="flex gap-2">
              {["single", "bulk"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCalendarMode(mode as "single" | "bulk")}
                  className={`flex-1 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all border ${calendarMode === mode
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

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

          <div className="space-y-1">
            <label
              htmlFor="event-title"
              className="block text-gray-700 font-medium text-sm"
            >
              Subject <span className="text-red-600">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              disabled
              value={
                subjects.find((s) => s.collegeSubjectId === subjectId)
                  ?.subjectName || ""
              }
              placeholder="e.g., Project Kickoff or Physics Exam"
              className="w-full cursor-not-allowed border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {calendarMode === "bulk" ? "Unit" : "Event Topic"} <span className="text-red-600">*</span>
            </label>
            {calendarMode === "bulk" ? (
                <div className="relative" ref={unitDropdownRef}>
                  <div
                    onClick={() => setIsUnitOpen((p) => !p)}
                    className={`
                      w-full cursor-pointer h-11 border border-[#C9C9C9] rounded-lg px-3
                      flex items-center justify-between
                      bg-white text-sm
                      focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                    `}
                  >
                    <span className={unitIds.length ? "text-gray-900" : "text-gray-400"}>
                      {unitIds.length === 0
                        ? "Select Units"
                        : units
                            .filter((u) => unitIds.includes(u.collegeSubjectUnitId))
                            .map((u) => `Unit ${u.unitNumber}`)
                            .join(", ")}
                    </span>
                    <CaretDown size={16} weight="bold" className={`text-gray-400 transition-transform duration-200 ${isUnitOpen ? "rotate-180" : "rotate-0"}`} />
                  </div>
                  {isUnitOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
                      {units.map((u) => {
                        const checked = unitIds.includes(u.collegeSubjectUnitId);
                        return (
                          <label key={u.collegeSubjectUnitId} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setUnitIds((prev) =>
                                  checked
                                    ? prev.filter((id) => id !== u.collegeSubjectUnitId)
                                    : [...prev, u.collegeSubjectUnitId],
                                );
                              }}
                              className="accent-emerald-500"
                            />
                            <span className="text-sm text-gray-700">
                              Unit {u.unitNumber}: {u.unitTitle}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
            ) : (
            <div className="relative">
              <select
                value={topicId ?? ""}
                onChange={(e) => {
                  setTopicId(Number(e.target.value));
                  e.currentTarget.blur();
                }}
                onMouseDown={() => setIsTopicFocused((prev) => !prev)}
                onBlur={() => setIsTopicFocused(false)}
                disabled={topics.length === 0}
                className="w-full cursor-pointer h-11 border border-[#C9C9C9] rounded-lg pl-3 pr-10 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed appearance-none"
              >
                {topics.length === 0 ? (
                  <option value="">No topic exists for this subject</option>
                ) : (
                  <>
                    <option value="">Select Topic</option>
                    {topics.map((t) => (
                      <option
                        key={t.collegeSubjectUnitTopicId}
                        value={t.collegeSubjectUnitTopicId}
                      >
                        {t.topicTitle}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`transition-transform duration-200 ${isTopicFocused ? "rotate-180" : "rotate-0"
                    }`}
                />
              </div>
            </div>
            )}
          </div>

          {isMeeting && (
            <>
              <div className="space-y-1">
                <label
                  htmlFor="event-title"
                  className="block text-gray-700 font-medium text-sm"
                >
                  Meeting Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g., Parent–Teacher Meeting, Project Review"
                  className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
                />
              </div>

              <div className="space-y-2 mt-2 mb-2">
                <label className="block text-gray-700 font-medium text-sm">
                  Meeting Platform
                </label>
                <div className="flex gap-4">
                  {[
                    { id: "meet", label: "Google Meet" },
                    { id: "zoom", label: "Zoom Meeting" },
                    { id: "others", label: "Others" },
                  ].map((platform) => (
                    <label
                      key={platform.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="meetingPlatform"
                        value={platform.id}
                        checked={meetingPlatform === platform.id}
                        onChange={() => setMeetingPlatform(platform.id as any)}
                        className="accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {platform.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {meetingPlatform === "zoom" ? (
                <div className="flex gap-4 animate-in fade-in duration-200">
                  <div className="flex-1 space-y-1">
                    <label className="block text-gray-700 font-medium text-sm">
                      Zoom ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      placeholder="Enter Zoom ID"
                      className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="block text-gray-700 font-medium text-sm">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={meetingPassword}
                      onChange={(e) => setMeetingPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-gray-700 font-medium text-sm">
                    {meetingPlatform === "meet"
                      ? "Google Meet Link"
                      : "Meeting Link"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder={
                      meetingPlatform === "meet"
                        ? "https://meet.google.com/..."
                        : "https://..."
                    }
                    className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500"
                  />
                </div>
              )}
            </>
          )}
          <div>
            <div className={calendarMode === "bulk" ? "grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr] gap-4 items-start" : "flex flex-col md:flex-row gap-4 items-start"}>
              {calendarMode === "bulk" ? (
                <>
                  <div className="flex-1 w-full min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        if (e.target.value > toDate) setToDate(e.target.value);
                      }}
                      className={`w-full cursor-pointer border border-[#C9C9C9] rounded-lg px-3 ${INPUT_HEIGHT} outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white`}
                    />
                  </div>
                  <div className="flex-1 w-full min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      min={fromDate}
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className={`w-full cursor-pointer border border-[#C9C9C9] rounded-lg px-3 ${INPUT_HEIGHT} outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white`}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 w-full min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={TODAY}
                    onChange={handleDateChange}
                    onBlur={handleDateBlur}
                    className={`w-full cursor-pointer border border-[#C9C9C9] rounded-lg px-3 ${INPUT_HEIGHT} outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white`}
                  />
                </div>
              )}
              <div className="flex-1 w-full min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Room No. {selectedType === "class" && <span className="text-red-600">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/academic-setup?tab=biometric-structure&biotab=rooms&action=add-room")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded shadow-sm transition-all cursor-pointer"
                  >
                    <Plus size={10} weight="bold" /> Add New
                  </button>
                </div>
                <RoomSelectDropdown
                  value={roomNo}
                  onChange={(rNo, rId) => { setRoomNo(rNo); setCollegeRoomId(rId); }}
                  collegeId={collegeId || 0}
                  placeholder="Select Room No. / Room Name"
                />
              </div>
            </div>
            <div className="space-y-1 mt-3">
              <label className="block text-gray-700 font-medium text-sm">
                Time <span className="text-red-600">*</span>
              </label>
              <div className="flex flex-col landscape:flex-row md:flex-row gap-4">
                <div className="flex-1">
                  <span className="block text-gray-500 text-xs mb-1">From</span>
                  <div className="flex gap-1.5">
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="border cursor-pointer border-[#C9C9C9] rounded-lg px-2 py-2 w-14 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
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
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Type <span className="text-red-600">*</span>
              </label>
              <input
                readOnly
                value={collegeEducationType!}
                className="w-full h-11 border focus:outline-none border-[#C9C9C9] rounded-lg px-3 bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>
            <div className="flex-1 w-full min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-red-600">*</span>
              </label>
              <input
                readOnly
                value={branchName}
                className="w-full h-11 text-[#282828] border focus:outline-none border-[#C9C9C9] rounded-lg px-3 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-600">*</span>
              </label>
              <input
                readOnly
                value={academicYearLabel}
                className="w-full h-11 border text-[#282828] focus:outline-none border-[#C9C9C9] rounded-lg px-3 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="flex-1 w-full min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-600">*</span>
              </label>
              <input
                readOnly
                value={semesterLabel ? `Semester ${semesterLabel}` : ""}
                className="w-full h-11 border text-[#282828] focus:outline-none border-[#C9C9C9] rounded-lg px-3 bg-gray-50 cursor-not-allowed"
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
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`text-gray-400 transition-transform duration-200 ${isSectionOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>
              {isSectionOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-full bg-white border 
        rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto"
                >
                  {sections.map((sec) => (
                    <label
                      key={`section-chip-${sec.collegeSectionsId}`}
                      className="flex text-[#282828] items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSections.some(
                          (s) => s.collegeSectionsId === sec.collegeSectionsId,
                        )}
                        onChange={() => toggleSection(sec)}
                      />
                      {sec.collegeSections}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedSections.length > 0 && (
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
            )}
          </div>
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update Event"
                  : "Save Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
