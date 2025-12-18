import { Plus } from "@phosphor-icons/react";
import React from "react";

interface CalendarHeaderProps {
  onAddClick: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ onAddClick }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 px-2 py-1 bg-[#43C17A] hover:bg-emerald-600 rounded-md text-white transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={16} weight="bold" />
          Add New
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
