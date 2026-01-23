"use client";

import { useState, useEffect, useRef } from "react";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

type Gradient = { from: string; to: string };

interface WorkWeekCalendarProps {
  style?: string;
  activeDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export default function WorkWeekCalendar({
  style = "mt-5",
  activeDate,
  onDateSelect,
}: WorkWeekCalendarProps) {
  const initialDate = activeDate || new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  useEffect(() => {
    if (activeDate) {
      setSelectedDate(activeDate);
      setCurrentMonth(activeDate.getMonth());
      setCurrentYear(activeDate.getFullYear());
    }
  }, [activeDate]);

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const activeGradient: Gradient = { from: "#7ADAA4", to: "#FEFEFE" };
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMonthOpen(false);
        setYearOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  const weekStartDate = getMonday(selectedDate);
  const weekDays: Date[] = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + i);
    weekDays.push(d);
  }

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());

    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    handleDateChange(d);
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    handleDateChange(d);
  };

  const handleMonthSelect = (index: number) => {
    const d = new Date(selectedDate);
    d.setMonth(index);
    handleDateChange(d);
    setMonthOpen(false);
  };

  const handleYearSelect = (year: number) => {
    const d = new Date(selectedDate);
    d.setFullYear(year);
    handleDateChange(d);
    setYearOpen(false);
  };

  const years = Array.from(
    { length: 11 },
    (_, i) => new Date().getFullYear() - 5 + i
  );

  return (
    <div
      ref={containerRef}
      className={`max-w-sm p-4 bg-white rounded-lg shadow-md text-black relative h-[170px] flex flex-col justify-center gap-5 ${style}`}
    >
      <div className="flex justify-between items-center mb-2 relative">
        <div className="flex w-[85%]">
          <div className="relative">
            <button
              onClick={() => {
                setMonthOpen(!monthOpen);
                setYearOpen(false);
              }}
              className="px-3 py-1 rounded hover:bg-gray-100"
            >
              {months[currentMonth]}
            </button>
            {monthOpen && (
              <div className="absolute top-full left-0 bg-white rounded shadow-md z-10 max-h-40 overflow-y-auto">
                {months.map((month, index) => (
                  <div
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-200"
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setYearOpen(!yearOpen);
                setMonthOpen(false);
              }}
              className="px-3 py-1 rounded hover:bg-gray-100"
            >
              {currentYear}
            </button>
            {yearOpen && (
              <div className="absolute top-full left-0 bg-white rounded shadow-md z-10 max-h-40 overflow-y-auto">
                {years.map((year) => (
                  <div
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-200"
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex w-[15%] justify-between">
          <FaAngleLeft
            size={12}
            className="cursor-pointer"
            onClick={prevWeek}
          />
          <FaAngleRight
            size={12}
            className="cursor-pointer"
            onClick={nextWeek}
          />
        </div>
      </div>

      <div className="grid grid-cols-6 text-center text-xs font-medium gap-1">
        {weekdays.map((day, idx) => {
          const dateObj = weekDays[idx];
          const isActive =
            dateObj.toDateString() === selectedDate.toDateString();
          const isSaturday = day === "Saturday";

          return (
            <div
              key={day}
              onClick={() => !isSaturday && handleDateChange(dateObj)}
              className="flex flex-col items-center justify-center gap-2 h-16 rounded cursor-pointer"
              style={
                isActive
                  ? {
                      background: `linear-gradient(to bottom, ${activeGradient.from}, ${activeGradient.to})`,
                      color: "white",
                    }
                  : {}
              }
            >
              <span className="text-xs font-medium">{day}</span>

              {isActive ? (
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full"
                  style={{ backgroundColor: "#43C17A" }}
                >
                  <span className="text-sm font-semibold text-white">
                    {dateObj.getDate()}
                  </span>
                </div>
              ) : (
                <span className="text-sm">{dateObj.getDate()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
