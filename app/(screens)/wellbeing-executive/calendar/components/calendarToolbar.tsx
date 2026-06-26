"use client";

import { CalendarBlank, CaretDown } from "@phosphor-icons/react";
import { useMemo } from "react";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentDate: Date;
  onMonthYearChange: (month: number, year: number) => void;
};

const months = [
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

export default function CalendarToolbar({
  activeTab,
  setActiveTab,
  currentDate,
  onMonthYearChange,
}: Props) {
  const isActive = activeTab === "All";
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const years = useMemo(() => {
    const startYear = 2026;
    const endYear = new Date().getFullYear() + 3;
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, index) => startYear + index,
    );
  }, []);

  return (
    <div className="flex w-fit items-center gap-8 rounded-t-[20px] bg-[#5252521C] px-6 pt-3 -mb-2">
      <button
        onClick={() => setActiveTab("All")}
        className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-all ${
          isActive
            ? "border-[#43C17A] text-[#43C17A]"
            : "border-transparent text-gray-400 hover:text-gray-600"
        }`}
      >
        <CalendarBlank size={18} weight={isActive ? "fill" : "bold"} />
        <span>All Scheduled</span>
      </button>

      <div className="mb-3 flex h-11 items-center rounded-xl bg-white px-4 shadow-md">
        <div className="relative flex items-center">
          <select
            value={currentMonth}
            onChange={(event) =>
              onMonthYearChange(Number(event.target.value), currentYear)
            }
            className="appearance-none bg-transparent py-2 pl-1 pr-7 text-base font-bold text-[#16284F] outline-none cursor-pointer"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month.slice(0, 3)}
              </option>
            ))}
          </select>
          <CaretDown
            size={16}
            weight="bold"
            className="pointer-events-none absolute right-1 text-[#16284F]"
          />
        </div>

        <div className="mx-4 h-7 w-px bg-[#D7D7D7]" />

        <div className="relative flex items-center">
          <select
            value={currentYear}
            onChange={(event) =>
              onMonthYearChange(currentMonth, Number(event.target.value))
            }
            className="appearance-none bg-transparent py-2 pl-1 pr-7 text-base font-bold text-[#16284F] outline-none cursor-pointer"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <CaretDown
            size={16}
            weight="bold"
            className="pointer-events-none absolute right-1 text-[#16284F]"
          />
        </div>
      </div>
    </div>
  );
}
