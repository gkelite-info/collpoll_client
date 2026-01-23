"use client";

import { X } from "@phosphor-icons/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type DegreeOption = {
  collegeDegreeId: number;
  degreeType: string;
  departments: string[];
  years?: string[];
  sections?: any;
};
interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: any | null;
  isSaving?: boolean;
  onSave: (eventData: any) => void;
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
  const [selectedType, setSelectedType] = useState("Class");
  const [date, setDate] = useState(getTodayDateString());
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
  const [semester, setSemester] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [degree, setDegree] = useState("");
  const [isDateInputFocused, setIsDateInputFocused] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);

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
  const SEMESTERS = ["1", "2"];
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

  useEffect(() => {
    if (!degree) return;
    if (!isEditMode) return;
    if (value) return;
    // setYear("");
    setSemester("");
    setSelectedDepartments([]);
    setSelectedSections([]);
    // if (year && !yearOptions.some((y: any) => y.value === year)) {
    //   setYear("");
    // }
    // setYear(normalizeYear(value.year));
  }, [degree, value, isEditMode]);

  const resetForm = () => {
    setTitle("");
    setTopic("");
    setRoomNo("");
    setDegree("");
    setSelectedDepartments([]);
    setSelectedSections([]);
    setYear("");
    setSemester("");
    setSelectedType("class");
    setDate(getTodayDateString());

    setStartHour("09");
    setStartMinute("00");
    setStartPeriod("AM");
    setEndHour("10");
    setEndMinute("00");
    setEndPeriod("AM");
  };

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

  useEffect(() => {
    if (!isOpen) return;

    if (!value) {
      resetForm();
      return;
    }

    setTitle(value.title || "");
    setTopic(value.topic || "");
    setRoomNo(value.roomNo || "");
    setDegree(value.degree || "");
    setSelectedDepartments(
      Array.isArray(value.departments)
        ? value.departments.filter(
            (d: any) => typeof d === "string" && d.trim() !== ""
          )
        : []
    );
    setSelectedSections(
      Array.isArray(value.sections)
        ? value.sections.filter(
            (s: any) => typeof s === "string" && s.trim() !== ""
          )
        : []
    );
    // setYear(value.year ? String(value.year) : "");
    // setYear(value.year || "");
    // setYear(normalizeYear(value.year));
    const normalizedYear = String(value.year || "").trim();
    if (
      normalizedYear &&
      ["1", "2", "3", "4", "5", "6", "7", "8"].includes(normalizedYear)
    ) {
      setYear(normalizedYear);
    } else {
      setYear("");
    }
    setSemester(value.semester || "");
    setSelectedType(value.type || "class");
    setDate(value.date || getTodayDateString());

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
        yearOptions
      );
    }
  }, [isEditMode, value?.year, degree, yearOptions]);

  const handleSave = () => {
    if (!title || !date) {
      toast.error("Please fill in the required fields (Title and Date).");
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

    const newEvent = {
      title,
      topic,
      roomNo,
      degree,
      departments: selectedDepartments,
      sections: selectedSections,
      // year: year ? Number(year) : null,
      year: year,
      semester,
      type: selectedType.toLowerCase(),
      date,
      startTime,
      endTime,
    };
    onSave(newEvent);
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
      (dep): dep is string => typeof dep === "string" && dep.trim() !== ""
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
          updated.some((d) => sec.startsWith(`${d}-`))
        )
      );

      return updated;
    });
  };

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
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
            <label
              htmlFor="event-title"
              className="block text-gray-700 font-medium text-sm"
            >
              Event Title
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Project Kickoff or Physics Exam"
              className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Event Topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
              placeholder="Enter topic"
            />
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
                  className={`flex-1 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all border ${
                    selectedType === type
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {formatLabel(type)}
                </button>
              ))}
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
                Degree *
              </label>

              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] 
      rounded-lg px-3 bg-white outline-none cursor-pointer`}
              >
                <option value="">Select Degree</option>
                {degreeOptions.map((deg) => (
                  <option key={deg.degreeType} value={deg.degreeType}>
                    {deg.degreeType}
                  </option>
                ))}
              </select>
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
                Department *
              </label>

              <div className="relative" ref={deptDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeptOpen((v) => !v);
                    setIsSectionOpen(false);
                  }}
                  className={`w-full cursor-pointer ${INPUT_HEIGHT} flex justify-between items-center 
        border border-[#C9C9C9] rounded-lg px-1 bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700`}
                >
                  {selectedDepartments.length
                    ? `${selectedDepartments.length} department(s) selected`
                    : "Select Department"}
                  <span className="-mt-2 mr-1">⌄</span>
                </button>

                {isDeptOpen && (
                  <div
                    className="absolute left-0 top-full mt-1 w-full bg-white border 
        rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto"
                  >
                    {departmentOptions.map((dep) => (
                      <label
                        key={dep}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dep)}
                          onChange={() => toggleDepartment(dep)}
                        />
                        {dep}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedDepartments.length > 0 && (
                <div
                  className={`${CHIP_CONTAINER_HEIGHT} mt-2 flex gap-2 overflow-x-auto 
      whitespace-nowrap scrollbar-hide`}
                >
                  {selectedDepartments.map((dep) => (
                    <span
                      key={`${dep}-chip`}
                      className="flex items-center gap-1 bg-green-100 text-green-700 
          px-3 py-1 rounded-full text-xs shrink-0"
                    >
                      {dep}
                      <button
                        onClick={() => toggleDepartment(dep)}
                        className="text-green-700 cursor-pointer hover:text-green-900"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>

              <select
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
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>

              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] 
        rounded-lg px-3 bg-white`}
              >
                <option value="">Select Semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section *
            </label>

            <div className="relative" ref={sectionDropdownRef}>
              <button
                type="button"
                disabled={!selectedDepartments.length}
                onClick={() => {
                  setIsSectionOpen((v) => !v);
                  setIsDeptOpen(false);
                }}
                className={`w-full cursor-pointer ${INPUT_HEIGHT} flex justify-between items-center 
        border border-[#C9C9C9] rounded-lg px-3 bg-white disabled:bg-gray-100`}
              >
                {selectedSections.length
                  ? `${selectedSections.length} section(s) selected`
                  : "Select Section"}
                <span className="mr-1 -mt-3">⌄</span>
              </button>

              {isSectionOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-full bg-white border 
        rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto"
                >
                  {availableSections.map((sec) => (
                    <label
                      key={sec}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSections.includes(sec)}
                        onChange={() => toggleSection(sec)}
                      />
                      {sec}
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
                    key={sec}
                    className="flex items-center gap-1 bg-green-100 text-green-700 
          px-3 py-1 rounded-full text-xs shrink-0"
                  >
                    {sec}
                    <button
                      onClick={() => toggleSection(sec)}
                      className="text-green-700 hover:text-green-900 cursor-pointer"
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
    </div>
  );
};

export default AddEventModal;
