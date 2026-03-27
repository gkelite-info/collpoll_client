"use client";
 
import { PencilSimple, X, CalendarBlank } from "@phosphor-icons/react";
import { MARK_BUTTONS } from "./types";
import { useRef, useState } from "react";
 
type MarkStatus = "Present" | "Absent" | "Leave" | "Late";
 
type Props = {
  isEditMode: boolean;
  selectedRows: Set<number>;
  onToggleEdit: () => void;
  onMarkStatus: (status: MarkStatus) => void;
  onDateFilter?: (date: string | null) => void; // "YYYY-MM-DD" or null to clear
};
 
const LABEL_TO_STATUS: Record<string, MarkStatus> = {
  "Mark Present": "Present",
  "Mark Absent": "Absent",
  "Mark Leave": "Leave",
  "Mark Late": "Late",
};
 
export default function AttendanceToolbar({
  isEditMode,
  selectedRows,
  onToggleEdit,
  onMarkStatus,
  onDateFilter,
}: Props) {
  const hasSelection = selectedRows.size > 0;
 
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const calendarRef = useRef<HTMLDivElement>(null);
 
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM-DD"
    setSelectedDate(val);
    onDateFilter?.(val || null);
    if (val) setShowCalendar(false);
  };
 
  const handleClear = () => {
    setSelectedDate("");
    onDateFilter?.(null);
    setShowCalendar(false);
  };
 
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-sm font-bold text-[#282828]">Daily Attendance Records</h2>
      <div className="flex items-center gap-2">
 
        {/* Mark buttons — edit mode only */}
        {isEditMode && MARK_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => onMarkStatus(LABEL_TO_STATUS[btn.label])}
            title={!hasSelection ? "Select rows first" : btn.label}
            className={`${btn.bg} ${btn.hover} text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors
              ${hasSelection ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-50"}`}
          >
            {btn.label}
          </button>
        ))}
 
        {/* Edit Attendance toggle */}
        <button
          onClick={onToggleEdit}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer
            ${isEditMode
              ? "bg-[#F3EEFF] text-[#6C20CA] border border-[#6C20CA] hover:bg-[#e9e0ff]"
              : "text-[#6C20CA] border border-[#6C20CA] hover:bg-[#F3EEFF]"}`}
        >
          {isEditMode
            ? <><X size={13} weight="bold" /> Cancel Edit</>
            : <><PencilSimple size={13} weight="bold" /> Edit Attendance</>}
        </button>
 
        {/* Calendar date filter */}
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => setShowCalendar((prev) => !prev)}
            title="Filter by date"
            className={`flex items-center justify-center w-8 h-8 rounded-md border transition-colors cursor-pointer
              ${selectedDate
                ? "bg-[#DCFCE7] border-[#43C17A] text-[#43C17A]"
                : "bg-[#DCFCE7] border-[#43C17A] text-[#43C17A] hover:bg-[#bbf7d0]"}`}
          >
            <CalendarBlank size={15} weight="bold" />
          </button>
 
          {showCalendar && (
            <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Filter by Date</span>
                {selectedDate && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none cursor-pointer"
              />
              {selectedDate && (
                <p className="mt-2 text-xs text-[#6C20CA] font-medium">
                  Showing: {new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </div>
          )}
        </div>
 
      </div>
    </div>
  );
}