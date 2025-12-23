"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const YEARS = Array.from({ length: 11 }, (_, i) => {
  const current = new Date().getFullYear();
  return current - 5 + i;
});

type Props = {
  onDateSelect?: (date: Date) => void;
};

export default function CalendarRibbonComponent({ onDateSelect }: Props) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const monthName = MONTHS[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

  const totalDays = daysInMonth(year, currentMonth.getMonth());

  const dates = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(year, currentMonth.getMonth(), i + 1);
    return {
      date: i + 1,
      weekday: d.toLocaleString("en-US", { weekday: "short" }).toUpperCase(),
      fullDate: d,
      isToday: d.toDateString() === today.toDateString(),
      isSelected: d.toDateString() === selectedDate.toDateString(),
    };
  });

  const listRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = activeItemRef.current;
    const list = listRef.current;
    if (node && list) {
      list.scrollTo({
        left: node.offsetLeft - 16,
        behavior: "smooth",
      });
    }
  }, [currentMonth, selectedDate]);

  function handlePrev() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function handleNext() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    onDateSelect?.(date);
  }

  useEffect(() => {
    setShowMonthPicker(false);
    setShowYearPicker(false);
  }, [currentMonth]);

  return (
    <div className="flex items-center justify-center relative">
      <div className="bg-white rounded-2xl shadow-lg p-1 px-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-1 relative">
          <div className="relative flex gap-1">
            <span
              className="text-sm font-semibold text-gray-800 cursor-pointer"
              onClick={() => {
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
            >
              {monthName}
            </span>

            <span
              className="text-sm font-semibold text-gray-800 cursor-pointer"
              onClick={() => {
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
            >
              {year}
            </span>

            {showMonthPicker && (
              <div className="absolute top-6 left-0 z-30 bg-white text-black rounded-xl shadow-lg p-2 grid grid-cols-3 gap-1">
                {MONTHS.map((m, idx) => (
                  <button
                    key={m}
                    className="text-xs px-2 py-1 rounded-md hover:bg-gray-100"
                    onClick={() => setCurrentMonth(new Date(year, idx, 1))}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {showYearPicker && (
              <div className="absolute top-6 left-16 z-30 bg-white rounded-xl shadow-lg p-2 flex flex-col">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    className="text-xs  text-black px-1 py-1 rounded-md hover:bg-gray-100"
                    onClick={() =>
                      setCurrentMonth(new Date(y, currentMonth.getMonth(), 1))
                    }
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <hr className="text-[#E4E5E7] mb-2" />
        <div
          ref={listRef}
          className="flex overflow-x-auto py-1 px-1 scrollbar-hide"
        >
          {dates.map((d) => {
            const isRibbon = d.isToday || d.isSelected;

            return (
              <div key={d.date} className="flex-none">
                {isRibbon ? (
                  <div
                    ref={d.isSelected ? activeItemRef : null}
                    onClick={() => handleSelectDate(d.fullDate)}
                    className="w-12 rounded-lg flex flex-col items-center py-2 px-1 mt-[-6px] cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(to bottom, #3DAD6E 0%, #3DAD6E 17%, #7ADAA4 10%, #7ADAA4 30%, #FEFEFE 92%, #FEFEFE 100%)",
                    }}
                  >
                    <div className="text-[10px] font-semibold pt-1 text-white">
                      {d.weekday}
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mt-2"
                      style={{ background: "#43C17A" }}
                    >
                      <span className="text-sm font-semibold text-white">
                        {d.date}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleSelectDate(d.fullDate)}
                    className="w-14 flex flex-col items-center py-1 px-2 cursor-pointer"
                  >
                    <div className="text-[10px] text-gray-500 mb-2">
                      {d.weekday}
                    </div>
                    <div className="w-9 h-9 flex items-center justify-center">
                      <span className="text-sm text-gray-700">{d.date}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
