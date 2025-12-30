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

export default function WeekCalendar({ style = "mt-5" }: { style?: string }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(
    today.getDate()
  );

  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const [weekStart, setWeekStart] = useState<number>(1);

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

  useEffect(() => {
    const dayOfWeek = today.getDay();
    let mondayDate = today.getDate();
    if (dayOfWeek === 0) mondayDate -= 6;
    else if (dayOfWeek >= 1) mondayDate -= dayOfWeek - 1;
    setWeekStart(mondayDate > 0 ? mondayDate : 1);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const allWorkDays: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(currentYear, currentMonth, i).getDay();
    if (day >= 1 && day <= 6) allWorkDays.push(i);
  }

  const weekIndex = allWorkDays.indexOf(weekStart);
  const weekDays = allWorkDays.slice(weekIndex, weekIndex + 6);

  const prevWeek = () => {
    const newStart = allWorkDays[Math.max(0, weekIndex - 6)] || allWorkDays[0];
    setWeekStart(newStart);
  };
  const nextWeek = () => {
    const newStart =
      allWorkDays[Math.min(allWorkDays.length - 6, weekIndex + 6)] ||
      allWorkDays[allWorkDays.length - 6];
    setWeekStart(newStart);
  };

  const years = Array.from(
    { length: 11 },
    (_, i) => today.getFullYear() - 5 + i
  );

  return (
    <div
      ref={containerRef}
      className={`max-w-sm p-4 bg-white rounded-lg shadow-md text-black relative h-[170px] flex flex-col justify-center gap-5 ${style}`}
    >
      <div className="flex justify-between items-center mb-2 relative bg-yellow-00">
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
                    onClick={() => {
                      setCurrentMonth(index);
                      setMonthOpen(false);
                      setWeekStart(1);
                    }}
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
                    onClick={() => {
                      setCurrentYear(year);
                      setYearOpen(false);
                      setWeekStart(1);
                    }}
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

      <div className="grid grid-cols-6 text-center text-xs font-medium gap-1 bg-pink-00">
        {weekdays.map((day, idx) => {
          const numericDate = weekDays[idx];
          const isActive = numericDate === selectedDate;
          const isSaturday = day === "Sat";

          return (
            <div
              key={day}
              onClick={() =>
                !isSaturday && numericDate ? setSelectedDate(numericDate) : null
              }
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
                    {numericDate}
                  </span>
                </div>
              ) : (
                <span className="text-sm">{numericDate}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
