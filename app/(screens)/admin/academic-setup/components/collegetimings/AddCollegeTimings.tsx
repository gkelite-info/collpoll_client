"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, CaretDown, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { getCollegeTimings, upsertCollegeTimings, DayTimingPayload } from "@/lib/helpers/collegeTimings/collegeTimingsAPI";
import CollegeTimingsShimmer from "./CollegeTimingsShimmer";
import TimeDropdown, { parseTime, TIME_OPTIONS_15, TIME_OPTIONS_5 } from "./TimeDropdown";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

type BreakTiming = {
  startTime: string;
  endTime: string;
};

type DayTiming = {
  day: string;
  isOpen: boolean;
  openAt: string;
  lunchFrom: string;
  lunchTo: string;
  closeAt: string;
  breaks: BreakTiming[];
};

const DEFAULT_TIMINGS: DayTiming[] = [
  { day: "Monday", isOpen: true, openAt: "09:00 AM", lunchFrom: "01:00 PM", lunchTo: "02:00 PM", closeAt: "05:00 PM", breaks: [] },
  { day: "Tuesday", isOpen: true, openAt: "09:00 AM", lunchFrom: "01:00 PM", lunchTo: "02:00 PM", closeAt: "05:00 PM", breaks: [] },
  { day: "Wednesday", isOpen: true, openAt: "09:00 AM", lunchFrom: "01:00 PM", lunchTo: "02:00 PM", closeAt: "05:00 PM", breaks: [] },
  { day: "Thursday", isOpen: true, openAt: "09:00 AM", lunchFrom: "01:00 PM", lunchTo: "02:00 PM", closeAt: "05:00 PM", breaks: [] },
  { day: "Friday", isOpen: true, openAt: "09:00 AM", lunchFrom: "01:00 PM", lunchTo: "02:00 PM", closeAt: "05:00 PM", breaks: [] },
  { day: "Saturday", isOpen: true, openAt: "09:00 AM", lunchFrom: "", lunchTo: "", closeAt: "01:00 PM", breaks: [] },
  { day: "Sunday", isOpen: false, openAt: "", lunchFrom: "", lunchTo: "", closeAt: "", breaks: [] },
];

const validateTimings = (timings: DayTiming[], isSchool: boolean) => {
  for (const t of timings) {
    if (!t.isOpen) continue;
    if (!t.openAt || !t.closeAt) {
      return `Please select Open At and Close At times for ${t.day}.`;
    }
    const openMins = parseTime(t.openAt);
    const closeMins = parseTime(t.closeAt);
    if (closeMins <= openMins) {
      return `Close At must be after Open At on ${t.day}.`;
    }

    const intervals: {start: number, end: number, name: string}[] = [];

    if (t.lunchFrom && t.lunchTo) {
      const lf = parseTime(t.lunchFrom);
      const lt = parseTime(t.lunchTo);
      if (lt <= lf) return `Lunch To must be after Lunch From on ${t.day}.`;
      if (lf < openMins || lt > closeMins) return `Lunch time must be within ${isSchool ? "school" : "college"} hours on ${t.day}.`;
      intervals.push({start: lf, end: lt, name: "Lunch"});
    } else if ((t.lunchFrom && !t.lunchTo) || (!t.lunchFrom && t.lunchTo)) {
      return `Please select both Lunch From and Lunch To on ${t.day}.`;
    }

    for (let i = 0; i < t.breaks.length; i++) {
      const b = t.breaks[i];
      if (!b.startTime || !b.endTime) return `Please select start and end times for all breaks on ${t.day}.`;
      const bs = parseTime(b.startTime);
      const be = parseTime(b.endTime);
      if (be <= bs) return `Break ${i+1} End must be after Start on ${t.day}.`;
      if (bs < openMins || be > closeMins) return `Break ${i+1} must be within ${isSchool ? "school" : "college"} hours on ${t.day}.`;
      intervals.push({start: bs, end: be, name: `Break ${i+1}`});
    }

    for (let i = 0; i < intervals.length; i++) {
      for (let j = i + 1; j < intervals.length; j++) {
        const a = intervals[i];
        const b = intervals[j];
        if (Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
          return `${a.name} and ${b.name} overlap on ${t.day}.`;
        }
      }
    }
  }
  return null;
};

export default function AddCollegeTimings() {
  const router = useRouter();
  const { collegeId, userId } = useUser();
  const { collegeEducationType } = useAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);
  const [timings, setTimings] = useState<DayTiming[]>(DEFAULT_TIMINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!collegeId) return;
      setIsLoadingData(true);
      const res = await getCollegeTimings(collegeId);
      if (res.success && res.data && res.data.length > 0) {
        const loadedTimings = res.data.map((item: any) => ({
          day: item.dayOfWeek,
          isOpen: item.isOpen,
          openAt: item.openAt || "",
          lunchFrom: item.lunchFrom || "",
          lunchTo: item.lunchTo || "",
          closeAt: item.closeAt || "",
          breaks: item.breaks || []
        }));
        setTimings(loadedTimings);
      }
      setIsLoadingData(false);
    }
    loadData();
  }, [collegeId]);

  const handleToggleOpen = (index: number) => {
    setTimings((prev) => {
      const newTimings = [...prev];
      const currentDay = { ...newTimings[index] };
      currentDay.isOpen = !currentDay.isOpen;
      
      if (currentDay.isOpen && !currentDay.openAt) {
        currentDay.openAt = "09:00 AM";
        currentDay.lunchFrom = "01:00 PM";
        currentDay.lunchTo = "02:00 PM";
        currentDay.closeAt = "05:00 PM";
      }
      
      newTimings[index] = currentDay;
      return newTimings;
    });
  };

  const handleTimeChange = (index: number, field: keyof DayTiming, value: string) => {
    setTimings((prev) => {
      const newTimings = [...prev];
      const currentDay = { ...newTimings[index] };
      currentDay[field] = value as never;

      // Auto-clear invalid dependent times to prevent UI locking when shifting schedules
      if (field === "openAt" && value) {
        const openMins = parseTime(value);
        if (currentDay.closeAt && parseTime(currentDay.closeAt) <= openMins) currentDay.closeAt = "";
        if (currentDay.lunchFrom && parseTime(currentDay.lunchFrom) <= openMins) currentDay.lunchFrom = "";
        if (currentDay.lunchTo && parseTime(currentDay.lunchTo) <= openMins) currentDay.lunchTo = "";
        currentDay.breaks = currentDay.breaks.map(b => {
          const newB = { ...b };
          if (newB.startTime && parseTime(newB.startTime) <= openMins) newB.startTime = "";
          if (newB.endTime && parseTime(newB.endTime) <= openMins) newB.endTime = "";
          return newB;
        });
      } else if (field === "closeAt" && value) {
        const closeMins = parseTime(value);
        if (currentDay.openAt && parseTime(currentDay.openAt) >= closeMins) currentDay.openAt = "";
        if (currentDay.lunchFrom && parseTime(currentDay.lunchFrom) >= closeMins) currentDay.lunchFrom = "";
        if (currentDay.lunchTo && parseTime(currentDay.lunchTo) >= closeMins) currentDay.lunchTo = "";
        currentDay.breaks = currentDay.breaks.map(b => {
          const newB = { ...b };
          if (newB.startTime && parseTime(newB.startTime) >= closeMins) newB.startTime = "";
          if (newB.endTime && parseTime(newB.endTime) >= closeMins) newB.endTime = "";
          return newB;
        });
      } else if (field === "lunchFrom" && value) {
        const lfMins = parseTime(value);
        if (currentDay.lunchTo && parseTime(currentDay.lunchTo) <= lfMins) currentDay.lunchTo = "";
      }

      newTimings[index] = currentDay;
      return newTimings;
    });
  };

  const handleBreakChange = (dayIndex: number, breakIndex: number, field: keyof BreakTiming, value: string) => {
    setTimings((prev) => {
      const newTimings = [...prev];
      const newBreaks = [...newTimings[dayIndex].breaks];
      const updatedBreak = { ...newBreaks[breakIndex], [field]: value };
      
      if (field === "startTime" && value) {
        if (updatedBreak.endTime && parseTime(updatedBreak.endTime) <= parseTime(value)) {
          updatedBreak.endTime = "";
        }
      } else if (field === "endTime" && value) {
         if (updatedBreak.startTime && parseTime(updatedBreak.startTime) >= parseTime(value)) {
           updatedBreak.startTime = "";
         }
      }

      newBreaks[breakIndex] = updatedBreak;
      newTimings[dayIndex] = { ...newTimings[dayIndex], breaks: newBreaks };
      return newTimings;
    });
  };

  const addBreak = (dayIndex: number) => {
    setTimings((prev) => {
      const newTimings = [...prev];
      const currentBreaks = newTimings[dayIndex].breaks;
      if (currentBreaks.length < 5) {
        newTimings[dayIndex] = { ...newTimings[dayIndex], breaks: [...currentBreaks, { startTime: "", endTime: "" }] };
      }
      return newTimings;
    });
  };

  const removeBreak = (dayIndex: number, breakIndex: number) => {
    setTimings((prev) => {
      const newTimings = [...prev];
      const newBreaks = newTimings[dayIndex].breaks.filter((_, i) => i !== breakIndex);
      newTimings[dayIndex] = { ...newTimings[dayIndex], breaks: newBreaks };
      return newTimings;
    });
  };

  const handleSave = async () => {
    if (!collegeId) {
      toast.error("User context is missing.", { id: "ctx-err" });
      return;
    }

    const validationError = validateTimings(timings, isSchool);
    if (validationError) {
      toast.error(validationError, { id: "val-err" });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(`Saving ${isSchool ? "school" : "college"} timings...`);

    const payload: DayTimingPayload[] = timings.map(t => ({
      dayOfWeek: t.day,
      isOpen: t.isOpen,
      openAt: t.openAt,
      lunchFrom: t.lunchFrom,
      lunchTo: t.lunchTo,
      closeAt: t.closeAt,
      breaks: t.breaks
    }));

    const res = await upsertCollegeTimings(collegeId, userId || 0, payload);

    setIsSaving(false);
    toast.dismiss(toastId);

    if (res.success) {
      toast.success(`${isSchool ? "School" : "College"} timings saved successfully!`, { id: `timing-success-${Date.now()}`, duration: 3000 });
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("action", "view");
        router.replace(`${window.location.pathname}?${params.toString()}`);
      }, 1000);
    } else {
      const isKnownError = res.error && [
        "These timings are already configured.",
        "Invalid college or admin reference.",
        "Network error. Please check your connection.",
        "The request timed out. Please try again.",
        "Failed to save changes. Please try again later."
      ].includes(res.error);
      
      const errorMsg = isKnownError ? res.error : `Failed to save ${isSchool ? "school" : "college"} timings. Please try again.`;
      toast.error(errorMsg, { id: `timing-err-${Date.now()}`, duration: 4000 });
    }
  };

  if (isLoadingData) {
    return <CollegeTimingsShimmer />;
  }

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#16284F] flex items-center gap-2">
            <Clock size={24} weight="fill" className="text-[#43C17A]" />
            Manage Operational Hours
          </h2>
          <p className="text-[#5C5C5C] text-sm mt-1">
            Set the default {isSchool ? "school" : "college"} opening, closing, and lunch hours for each day of the week.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#43C17A] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#3ab06e] transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-70 whitespace-nowrap flex-shrink-0"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check size={18} weight="bold" />
          )}
          <span>{isSaving ? "Saving..." : "Save Timings"}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sm:p-6 overflow-visible w-full overflow-x-auto custom-scrollbar">
        {/* Header Row (Desktop only) */}
        <div className="hidden lg:grid grid-cols-[140px_100px_1fr] gap-6 px-6 py-3 bg-gray-50 rounded-t-lg border-b border-gray-100 text-sm font-semibold text-[#16284F] min-w-[700px]">
          <div>Day</div>
          <div>Status</div>
          <div className="grid grid-cols-4 gap-4">
            <div>Open At</div>
            <div>Lunch From</div>
            <div>Lunch To</div>
            <div>Close At</div>
          </div>
        </div>

        {/* Timings List */}
        <div className="divide-y divide-gray-100 min-w-[280px] lg:min-w-[700px]">
          {timings.map((dayData, index) => {
            const openAtMins = parseTime(dayData.openAt);
            const closeAtMins = parseTime(dayData.closeAt);
            const lunchFromMins = parseTime(dayData.lunchFrom);
            const lunchToMins = parseTime(dayData.lunchTo);

            return (
            <div
              key={dayData.day}
              className={`flex flex-col lg:grid lg:grid-cols-[140px_100px_1fr] gap-4 lg:gap-6 px-4 lg:px-6 py-5 transition-colors ${
                dayData.isOpen ? "bg-white hover:bg-gray-50/50" : "bg-gray-50/30"
              }`}
            >
              {/* Mobile/Tablet Header: Day Name + Status Toggle */}
              <div className="flex items-center justify-between lg:hidden w-full">
                <span className={`font-bold text-base ${dayData.isOpen ? "text-[#16284F]" : "text-gray-400"}`}>
                  {dayData.day}
                </span>
                <div className="flex items-center">
                  <span className={`mr-3 text-sm font-medium ${dayData.isOpen ? "text-[#43C17A]" : "text-gray-500"}`}>
                    {dayData.isOpen ? "Open" : "Closed"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleOpen(index)}
                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:ring-offset-2 ${
                      dayData.isOpen ? "bg-[#43C17A]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        dayData.isOpen ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Desktop Header: Day Name */}
              <div className="hidden lg:flex items-center">
                <span className={`font-bold text-base ${dayData.isOpen ? "text-[#16284F]" : "text-gray-400"}`}>
                  {dayData.day}
                </span>
              </div>

              {/* Desktop Header: Status Toggle */}
              <div className="hidden lg:flex items-center">
                <button
                  type="button"
                  onClick={() => handleToggleOpen(index)}
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:ring-offset-2 ${
                    dayData.isOpen ? "bg-[#43C17A]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dayData.isOpen ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`ml-3 text-sm font-medium ${dayData.isOpen ? "text-[#43C17A]" : "text-gray-500"}`}>
                  {dayData.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              {/* Time Inputs */}
              <div className="min-h-[42px] flex items-center mt-2 lg:mt-0">
                <AnimatePresence mode="popLayout">
                  {dayData.isOpen ? (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col w-full"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                        <TimeDropdown
                          value={dayData.openAt}
                          onChange={(val) => handleTimeChange(index, "openAt", val)}
                          label="Open At"
                          options={TIME_OPTIONS_15}
                          maxMins={901}
                        />
                        <TimeDropdown
                          value={dayData.lunchFrom}
                          onChange={(val) => handleTimeChange(index, "lunchFrom", val)}
                          label="Lunch From"
                          allowClear={true}
                          options={TIME_OPTIONS_5}
                          minMins={openAtMins || -1}
                          maxMins={closeAtMins || 1500}
                        />
                        <TimeDropdown
                          value={dayData.lunchTo}
                          onChange={(val) => handleTimeChange(index, "lunchTo", val)}
                          label="Lunch To"
                          allowClear={true}
                          options={TIME_OPTIONS_5}
                          minMins={lunchFromMins || openAtMins || -1}
                          maxMins={closeAtMins || 1500}
                        />
                        <TimeDropdown
                          value={dayData.closeAt}
                          onChange={(val) => handleTimeChange(index, "closeAt", val)}
                          label="Close At"
                          options={TIME_OPTIONS_15}
                          minMins={Math.max(659, openAtMins || -1)}
                        />
                      </div>
                      
                      {dayData.breaks.length > 0 && (
                        <div className="flex flex-wrap gap-3 w-full mt-3">
                          {dayData.breaks.map((b, bIdx) => {
                            const bStartMins = parseTime(b.startTime);
                            const bEndMins = parseTime(b.endTime);

                            return (
                            <div key={bIdx} className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-lg border border-gray-100 relative group flex-1 min-w-[240px] max-w-full xl:max-w-[340px]">
                              <div className="flex-1 flex items-center gap-2">
                                <TimeDropdown
                                  value={b.startTime}
                                  onChange={(val) => handleBreakChange(index, bIdx, "startTime", val)}
                                  label={`Break ${bIdx+1} Start`}
                                  placeholder="From"
                                  options={TIME_OPTIONS_5}
                                  minMins={openAtMins || -1}
                                  maxMins={closeAtMins || 1500}
                                />
                                <span className="text-gray-300 font-medium">-</span>
                                <TimeDropdown
                                  value={b.endTime}
                                  onChange={(val) => handleBreakChange(index, bIdx, "endTime", val)}
                                  label={`Break ${bIdx+1} End`}
                                  placeholder="To"
                                  options={TIME_OPTIONS_5}
                                  minMins={bStartMins || openAtMins || -1}
                                  maxMins={closeAtMins || 1500}
                                />
                              </div>
                              <button
                                onClick={() => removeBreak(index, bIdx)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0"
                                title="Remove break"
                              >
                                <X size={16} weight="bold" />
                              </button>
                            </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {dayData.breaks.length < 5 && (
                        <button
                          onClick={() => addBreak(index)}
                          className="text-sm text-[#43C17A] font-medium flex items-center gap-1 hover:underline w-fit mt-3 cursor-pointer"
                        >
                          + Add Break
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-gray-400 italic pt-1 lg:pt-0"
                    >
                      {isSchool ? "School" : "College"} is closed on {dayData.day}.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
