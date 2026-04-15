"use client";

import { PencilSimple, X, CalendarBlank } from "@phosphor-icons/react";
import { MARK_BUTTONS } from "./types";
import { useState } from "react";

type MarkStatus = "Present" | "Absent" | "Leave" | "Late";

type Props = {
  isEditMode: boolean;
  selectedRows: Set<number>;
  onToggleEdit: () => void;
  onMarkStatus: (status: MarkStatus) => void;
  onDateFilter?: (date: string | null) => void;
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    onDateFilter?.(val || null);
    // Auto-close inline calendar after selection for better UX
    if (val) setShowCalendar(false);
  };

  const handleClear = () => {
    setSelectedDate("");
    onDateFilter?.(null);
    setShowCalendar(false);
  };

  return (
    // Changed overflow-hidden to overflow-visible just in case of tooltips
    <div className="flex items-center justify-between mb-2 w-full overflow-visible">
      <h2 className="text-sm font-bold text-[#282828] whitespace-nowrap shrink-0 mr-4">
        Daily Attendance Records
      </h2>

      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar justify-end">
        {/* ACTIVE FILTER BADGE - Shows when calendar is closed but a date is selected */}
        {!showCalendar && selectedDate && (
          <div className="flex items-center gap-2 bg-green-50 px-2.5 py-1.5 rounded-md border border-green-200 shrink-0">
            <span className="text-xs font-semibold text-green-700">
              {new Date(selectedDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* HIDE BUTTONS WHEN CALENDAR IS OPEN */}
        {!showCalendar &&
          isEditMode &&
          MARK_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => onMarkStatus(LABEL_TO_STATUS[btn.label])}
              title={!hasSelection ? "Select rows first" : btn.label}
              className={`${btn.bg} ${btn.hover} text-white text-xs px-2 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0
              ${hasSelection ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-50"}`}
            >
              {btn.label}
            </button>
          ))}

        {!showCalendar && (
          <button
            onClick={onToggleEdit}
            className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0
            ${
              isEditMode
                ? "bg-[#F3EEFF] text-[#6C20CA] border border-[#6C20CA] hover:bg-[#e9e0ff]"
                : "text-[#6C20CA] border border-[#6C20CA] hover:bg-[#F3EEFF]"
            }`}
          >
            {isEditMode ? (
              <>
                <X size={13} weight="bold" /> Cancel Edit
              </>
            ) : (
              <>
                <PencilSimple size={13} weight="bold" /> Edit Attendance
              </>
            )}
          </button>
        )}

        {!showCalendar ? (
          <button
            onClick={() => setShowCalendar(true)}
            title="Filter by date"
            className={`flex items-center justify-center w-8 h-8 rounded-md border transition-colors cursor-pointer shrink-0
              ${
                selectedDate
                  ? "bg-[#DCFCE7] border-[#43C17A] text-[#43C17A]"
                  : "bg-[#DCFCE7] border-[#43C17A] text-[#43C17A] hover:bg-[#bbf7d0]"
              }`}
          >
            <CalendarBlank size={15} weight="bold" />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-white border border-[#43C17A] rounded-lg p-1 shadow-sm shrink-0">
            <span className="text-xs font-semibold text-[#43C17A] pl-2">
              Select Date:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none cursor-pointer focus:border-[#43C17A] text-gray-700"
            />
            {selectedDate && (
              <button
                onClick={handleClear}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
            <button
              onClick={() => setShowCalendar(false)}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
