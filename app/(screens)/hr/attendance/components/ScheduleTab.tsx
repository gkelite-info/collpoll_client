"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Info, CheckCircle, WarningCircle, FloppyDisk, ArrowsClockwise } from "@phosphor-icons/react";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { getCollegeCronTiming, updateCollegeCronTiming } from "@/lib/helpers/Hr/attendance/cronTimingAPI";
import toast from "react-hot-toast";

export default function ScheduleTab() {
  const { collegeId } = useCollegeHr();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hour, setHour] = useState("07");
  const [minute, setMinute] = useState("00");
  const [meridiem, setMeridiem] = useState("PM");
  const [hasError, setHasError] = useState<string | null>(null);

  // Helper to sync states from DB time ("19:00")
  const syncFromDB = (t24: string) => {
    if (!t24) return;
    const [h, m] = t24.split(":");
    let hr = parseInt(h, 10);
    const mer = hr >= 12 ? "PM" : "AM";
    if (hr > 12) hr -= 12;
    if (hr === 0) hr = 12;
    setHour(String(hr).padStart(2, "0"));
    setMinute(m || "00");
    setMeridiem(mer);
  };

  // Helper to convert to DB time ("19:00")
  const getDBTime = () => {
    let h = parseInt(hour, 10);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const fetchTiming = useCallback(async () => {
    if (!collegeId) return;
    setIsLoading(true);
    const res = await getCollegeCronTiming(collegeId);
    if (res.success && res.data) {
      syncFromDB(res.data.finalizeTime);
      setHasError(null);
    } else if (res.error) {
      setHasError("Unable to load schedule. Please try again or contact support.");
    }
    setIsLoading(false);
  }, [collegeId]);

  useEffect(() => {
    fetchTiming();
  }, [fetchTiming]);

  const handleSave = async () => {
    if (!collegeId) return;
    setIsSaving(true);
    const dbTime24h = getDBTime();

    const res = await updateCollegeCronTiming(collegeId, dbTime24h);
    
    if (res.success) {
      toast.success("Automation schedule updated successfully!", { id: "schedule-success" });
      setHasError(null);
    } else {
      toast.error(res.error || "Failed to update schedule.", { id: "schedule-error" });
      if (res.error?.includes("pending")) {
          setHasError(res.error);
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 animate-fade-in-up h-full">
      <div className="flex justify-between items-start border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock size={24} className="text-emerald-500" />
            Attendance Automation Schedule
          </h2>
          <p className="text-sm text-gray-500">
            Configure the exact time when the automated system will process today's attendance for your college. 
            Unmarked staff will be marked Absent, and totals will be calculated.
          </p>
        </div>
        <button
          onClick={fetchTiming}
          disabled={isLoading}
          className="p-2 px-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-200 hover:border-emerald-200 shadow-sm"
          title="Refresh Schedule"
        >
          <ArrowsClockwise size={18} weight="bold" className={isLoading ? "animate-spin" : ""} />
          <span className="text-sm font-semibold hidden sm:block">Refresh</span>
        </button>
      </div>

      {hasError && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
          <WarningCircle size={20} className="text-amber-600 mt-0.5 shrink-0" weight="fill" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-amber-800">Setup Required</span>
            <span className="text-sm text-amber-700 mt-1">{hasError}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 max-w-md mt-2">
        <label className="text-sm font-semibold text-gray-700 flex flex-col gap-1.5">
          Execution Time
          <span className="text-xs font-normal text-gray-500 leading-relaxed max-w-[90%]">
            The automated system checks for schedules every 15 minutes. Select your preferred time below.
          </span>
        </label>
        
        <div className="flex gap-4 items-center mt-1">
          <div className="flex gap-2 items-center">
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              disabled={isLoading || isSaving}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#6C20CA]/20 focus:border-[#6C20CA] transition-all disabled:opacity-50 min-w-[80px] appearance-none cursor-pointer text-center"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const val = String(i + 1).padStart(2, "0");
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <span className="text-gray-400 font-bold">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              disabled={isLoading || isSaving}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#6C20CA]/20 focus:border-[#6C20CA] transition-all disabled:opacity-50 min-w-[80px] appearance-none cursor-pointer text-center"
            >
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <select
              value={meridiem}
              onChange={(e) => setMeridiem(e.target.value)}
              disabled={isLoading || isSaving}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#6C20CA]/20 focus:border-[#6C20CA] transition-all disabled:opacity-50 min-w-[80px] appearance-none cursor-pointer text-center"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FloppyDisk size={20} />
            )}
            <span className="whitespace-nowrap">
              {isSaving ? "Saving..." : "Save Schedule"}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 p-5 rounded-2xl border border-blue-100/60 flex gap-4 mt-auto shadow-sm">
        <div className="bg-blue-100/50 p-2 rounded-full h-fit mt-0.5">
          <Info size={22} className="text-blue-600" weight="fill" />
        </div>
        <div className="text-sm text-gray-700 flex flex-col gap-2.5">
          <p className="text-blue-900 font-bold text-base tracking-tight">How the Automation Works</p>
          <ul className="space-y-2">
            <li className="flex gap-2 items-start">
              <span className="text-blue-400 mt-1">•</span>
              <span>The global scheduler runs automatically in the background. You do not need to keep this page open.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-400 mt-1">•</span>
              <span>It strictly respects manual overrides. If HR explicitly marks someone as Present/Late/Leave, the system will <strong className="text-gray-900">not</strong> overwrite it.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-400 mt-1">•</span>
              <span>Staff with no check-in/out records by this execution time will automatically be marked as <strong className="text-gray-900">Absent</strong>.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-400 mt-1">•</span>
              <span>Changes are instant. If you change the time from 7:00 PM to 6:00 PM, the scheduler will immediately respect the new time.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
