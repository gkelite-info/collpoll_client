import { Plus, CaretDown } from "@phosphor-icons/react";
import React from "react";

interface CalendarHeaderProps {
  onAddClick: () => void;
  currentDate: Date;
  onMonthYearChange: (month: number, year: number) => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  onAddClick,
  currentDate,
  onMonthYearChange,
}) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate a dynamic list of years (e.g., current year - 5 to current year + 5)
  const currentRealYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentRealYear - 5 + i);

  return (
    <div className="flex items-center gap-4 mb-1">
      {/* 🟢 Smart Month & Year Filter */}
      <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
        <div className="relative flex items-center">
          <select
            value={currentMonth}
            onChange={(e) =>
              onMonthYearChange(Number(e.target.value), currentYear)
            }
            className="appearance-none bg-transparent text-gray-700 py-1.5 pl-3 pr-8 text-sm font-semibold focus:outline-none cursor-pointer"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <CaretDown
            size={14}
            className="absolute right-2 text-gray-500 pointer-events-none"
            weight="bold"
          />
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <div className="relative flex items-center">
          <select
            value={currentYear}
            onChange={(e) =>
              onMonthYearChange(currentMonth, Number(e.target.value))
            }
            className="appearance-none bg-transparent text-gray-700 py-1.5 pl-3 pr-8 text-sm font-semibold focus:outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <CaretDown
            size={14}
            className="absolute right-2 text-gray-500 pointer-events-none"
            weight="bold"
          />
        </div>
      </div>

      {/* 🟢 Existing Add New Button */}
      <button
        onClick={onAddClick}
        className="flex items-center cursor-pointer gap-1.5 px-4 py-2 bg-[#43C17A] hover:bg-emerald-600 rounded-lg text-white transition-colors shadow-sm text-sm font-bold"
      >
        <Plus size={16} weight="bold" />
        Add New
      </button>
    </div>
  );
};

export default CalendarHeader;
