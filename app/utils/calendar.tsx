'use client';

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarRibbonComponent() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const totalDays = daysInMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  // Generate date objects for this month
  const dates = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      i + 1
    );
    return {
      date: i + 1,
      weekday: d.toLocaleString("en-US", { weekday: "short" }).toUpperCase(),
      isToday:
        i + 1 === today.getDate() &&
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear(),
    };
  });

  const listRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = activeItemRef.current;
    const list = listRef.current;
    if (node && list) {
      const nodeLeft = (node as HTMLElement).offsetLeft;
      list.scrollTo({ left: nodeLeft - 16, behavior: "smooth" });
    }
  }, [currentMonth]);

  function handlePrev() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function handleNext() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-1 px-4 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {monthName} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              aria-label="Previous month"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next month"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Dates Row - Horizontally Scrollable with Day Labels */}
        <div className="relative">
          {/* Gradient fade on left */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-5 bg-gradient-to-r from-white to-transparent z-10" />
          {/* Gradient fade on right */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-5 bg-gradient-to-l from-white to-transparent z-10" />
          <hr className="text-[#E4E5E7] mb-2" />
          <div
            ref={listRef}
            className="flex gap-0 overflow-x-auto py-1 px-1 scrollbar-hide"
          >
            {dates.map((d) => {
              const isRibbon = d.isToday;

              return (
                <div
                  key={d.date}
                  ref={isRibbon ? activeItemRef : null}
                  className="flex-none"
                >

                  {isRibbon ? (
                    <div
                      className="w-12 rounded-lg  flex flex-col items-center justify-start py-2 px-1 mt-[-6px]"
                      style={{
                        // top small band #3DAD6E, main body #7ADAA4 across most height, tiny bottom #FEFEFE
                        background:
                          "linear-gradient(to bottom, #3DAD6E 0%, #3DAD6E 17%, #7ADAA4 10%, #7ADAA4 30%, #FEFEFE 92%, #FEFEFE 100%)",
                        // ensure the gradient fills the element box
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "100% 100%",
                      }}
                    >
                      
                      <div className="text-[10px] font-semibold tracking-wide text-white mt-1">
                        {d.weekday}
                      </div>

                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-2"
                        style={{ background: "#43C17A" }}
                      >
                        <span className="text-sm font-semibold text-white">{d.date}</span>
                      </div>
                    </div>
                  ) : (
                    // unchanged: simple date cell branch remains the same
                    <div className="w-14 flex flex-col items-center justify-center py-1 px-2">
                      
                      <div className="text-[10px] font-medium text-gray-500 mb-2">
                        {d.weekday}
                      </div>
                      
                      <div className="w-9 h-9 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">{d.date}</span>
                      </div>
                    </div>
                  )}


                </div>
              );
            })}
          </div>
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