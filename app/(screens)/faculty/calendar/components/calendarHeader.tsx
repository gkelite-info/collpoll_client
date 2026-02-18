"use client";

import { Plus } from "@phosphor-icons/react";

type CalendarHeaderProps = {
  onAddClick: () => void;
};

const CalendarHeader = ({ onAddClick }: CalendarHeaderProps) => {

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onAddClick}
        className="flex items-center gap-1 px-3 py-1.5 bg-[#43C17A] hover:bg-emerald-600 rounded-md text-white transition-colors shadow-sm text-sm font-medium"
      >
        <Plus size={16} weight="bold" />
        Add New
      </button>
    </div>
  );
};

export default CalendarHeader;
