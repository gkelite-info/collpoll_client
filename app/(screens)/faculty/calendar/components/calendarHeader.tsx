"use client";

import { Plus, CaretDown } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";

type CalendarHeaderProps = {
  onAddClick: () => void;
  currentDate: Date;
  onMonthYearChange: (month: number, year: number) => void;
};

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

const CalendarHeader = ({
  onAddClick,
  currentDate,
  onMonthYearChange,
}: CalendarHeaderProps) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const BASE_YEAR = 2026;
  const currentRealYear = new Date().getFullYear();

  const endYear = currentRealYear + 1;

  const years = Array.from(
    { length: Math.max(1, endYear - BASE_YEAR + 1) },
    (_, i) => BASE_YEAR + i
  );

  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
        setIsMonthOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setIsYearOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMonthOpen && monthRef.current) {
      const dropdown = monthRef.current.querySelector('.overflow-y-auto') as HTMLElement;
      const selectedEl = monthRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (dropdown && selectedEl) {
        dropdown.scrollTop = selectedEl.offsetTop - dropdown.clientHeight / 2 + selectedEl.clientHeight / 2;
      }
    }
  }, [isMonthOpen]);

  useEffect(() => {
    if (isYearOpen && yearRef.current) {
      const dropdown = yearRef.current.querySelector('.overflow-y-auto') as HTMLElement;
      const selectedEl = yearRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (dropdown && selectedEl) {
        dropdown.scrollTop = selectedEl.offsetTop - dropdown.clientHeight / 2 + selectedEl.clientHeight / 2;
      }
    }
  }, [isYearOpen]);

  return (
    <div className="flex flex-col min-[360px]:flex-row items-stretch min-[360px]:items-center justify-between w-full md:w-auto gap-3 min-[360px]:gap-4 mb-1">
      {/* 🟢 Smart Month & Year Filter */}
      <div className="flex justify-center min-[360px]:justify-start items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
        <div className="relative flex items-center" ref={monthRef}>
          <button
            onClick={() => {
              setIsMonthOpen(!isMonthOpen);
              setIsYearOpen(false);
            }}
            className="flex items-center justify-between bg-transparent text-gray-700 py-1.5 pl-3 pr-8 text-sm font-semibold focus:outline-none cursor-pointer w-[110px]"
          >
            {MONTHS[currentMonth]}
          </button>
          <CaretDown
            size={14}
            className={`absolute right-2 text-gray-500 pointer-events-none transition-transform duration-200 ${isMonthOpen ? "rotate-180" : ""}`}
            weight="bold"
          />
          {isMonthOpen && (
            <div className="absolute top-full left-0 mt-1 min-w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {MONTHS.map((m, i) => (
                <div
                  key={m}
                  data-selected={currentMonth === i}
                  onClick={() => {
                    onMonthYearChange(i, currentYear);
                    setIsMonthOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    currentMonth === i ? "bg-emerald-50 text-emerald-600 font-bold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <div className="relative flex items-center" ref={yearRef}>
          <button
            onClick={() => {
              setIsYearOpen(!isYearOpen);
              setIsMonthOpen(false);
            }}
            className="flex items-center justify-between bg-transparent text-gray-700 py-1.5 pl-3 pr-8 text-sm font-semibold focus:outline-none cursor-pointer w-[80px]"
          >
            {currentYear}
          </button>
          <CaretDown
            size={14}
            className={`absolute right-2 text-gray-500 pointer-events-none transition-transform duration-200 ${isYearOpen ? "rotate-180" : ""}`}
            weight="bold"
          />
          {isYearOpen && (
            <div className="absolute top-full left-0 mt-1 min-w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {years.map((y) => (
                <div
                  key={y}
                  data-selected={currentYear === y}
                  onClick={() => {
                    onMonthYearChange(currentMonth, y);
                    setIsYearOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    currentYear === y ? "bg-emerald-50 text-emerald-600 font-bold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {y}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🟢 Existing Add New Button */}
      <button
        onClick={onAddClick}
        className="flex items-center justify-center shrink-0 whitespace-nowrap cursor-pointer gap-1.5 px-3 md:px-4 py-2.5 min-[360px]:py-2 bg-[#43C17A] hover:bg-emerald-600 rounded-lg text-white transition-colors shadow-sm text-sm font-bold w-full min-[360px]:w-auto"
      >
        <Plus size={16} weight="bold" />
        Add New
      </button>
    </div>
  );
};

export default CalendarHeader;
