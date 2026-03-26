"use client";

import { PencilSimple, X } from "@phosphor-icons/react";
import { MARK_BUTTONS } from "./types";

type MarkStatus = "Present" | "Absent" | "Leave" | "Late";

type Props = {
  isEditMode:    boolean;
  selectedRows:  Set<number>;        // to know if any rows are selected
  onToggleEdit:  () => void;
  onMarkStatus:  (status: MarkStatus) => void;  // fires when a Mark button clicked
};

// Map button label → status value
const LABEL_TO_STATUS: Record<string, MarkStatus> = {
  "Mark Present": "Present",
  "Mark Absent":  "Absent",
  "Mark Leave":   "Leave",
  "Mark Late":    "Late",
};

export default function AttendanceToolbar({
  isEditMode,
  selectedRows,
  onToggleEdit,
  onMarkStatus,
}: Props) {
  const hasSelection = selectedRows.size > 0;

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
      </div>
    </div>
  );
}
