"use client";

import { Plus } from "@phosphor-icons/react";

type CalendarHeaderProps = {
  onAddClick: () => void;
};

const CalendarHeader = ({ onAddClick }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onAddClick}
        className="flex items-center gap-1 px-4 py-2 bg-[#43C17A] hover:bg-[#39a868] active:scale-95 rounded-md text-white transition-all shadow-sm text-sm font-semibold cursor-pointer"
      >
        <Plus size={18} weight="bold" />
        <span>Add New</span>
      </button>
    </div>
  );
};

export default CalendarHeader;