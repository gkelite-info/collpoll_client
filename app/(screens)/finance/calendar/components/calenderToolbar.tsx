import React, { useState, useMemo } from "react";
import {
  CalendarBlank,
  CaretDown,
} from "@phosphor-icons/react";

interface CalendarToolbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  activeTab,
  setActiveTab,
  currentDate,
  onMonthYearChange,
}) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const BASE_YEAR = 2026;
  const currentRealYear = new Date().getFullYear();
  const endYear = currentRealYear + 3;

  const years = useMemo(
    () =>
      Array.from(
        { length: endYear - BASE_YEAR + 1 },
        (_, i) => BASE_YEAR + i
      ),
    [endYear]
  );

  const tabs = [
    { name: "All Scheduled", filterValue: "All Scheduled", icon: CalendarBlank },
  ];

  return (
    <div className="bg-[#5252521C] -mb-2 rounded-t-[20px] border-b border-gray-200 px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 overflow-x-auto w-full lg:w-auto hide-scrollbar flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.filterValue)}
            className={`flex items-center cursor-pointer gap-2 pb-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.filterValue
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon
              size={18}
              weight={activeTab === tab.filterValue ? "fill" : "regular"}
            />
            {tab.name}
          </button>
        ))}

        {/* Month & Year Selectors */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <div className="relative flex items-center">
            <select
              value={currentMonth}
              onChange={(e) =>
                onMonthYearChange(Number(e.target.value), currentYear)
              }
              className="appearance-none bg-transparent text-gray-700 py-1.5 pl-3 pr-6 text-sm font-semibold focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m.slice(0, 3)}
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
      </div>
    </div>
  );
};

export default CalendarToolbar;
