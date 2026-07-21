import React from 'react';
import { TIME_SLOTS } from "@/app/(screens)/admin/calendar/calenderData";

const CalendarGridShimmer: React.FC = () => {
  const dummyDays = [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-white rounded-bl-[20px] shadow-sm overflow-hidden flex flex-col relative -mt-2 h-[80vh] w-full animate-pulse">
      {/* Header Row */}
      <div className="flex border-b border-gray-300 sticky top-0 z-30 bg-white">
        <div className="hidden md:flex lg:flex w-20 min-w-[80px] border-r border-gray-300 p-2 items-center justify-center gap-2 bg-white z-10">
          <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
          <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
        </div>
        
        {/* Mobile Header Shimmer */}
        <div className="bg-white flex md:hidden lg:hidden w-full items-center justify-center py-4 gap-4 border-b border-gray-300">
          <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
          <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
        </div>

        {/* Desktop Header Shimmer */}
        <div className="flex-1 hidden md:grid md:grid-cols-6 lg:grid grid-cols-6">
          {dummyDays.map((i) => (
            <div key={i} className="text-center py-2.5 border-r border-gray-300 last:border-r-0 flex flex-col items-center gap-1 justify-center">
              <div className="h-3 w-8 bg-gray-200 rounded"></div>
              <div className="h-4 w-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Body */}
      <div className="flex-1 relative bg-white">
        <div className="flex min-h-[720px]">
          {/* Time Sidebar */}
          <div className="w-16 md:w-20 lg:w-20 bg-white border-r border-gray-300 shrink-0 select-none">
            {TIME_SLOTS.map((time, i) => (
              <div
                key={i}
                className="h-[120px] pt-3 border-b border-dashed border-gray-100 flex justify-center"
              >
                <div className="h-3 w-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Grid Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 z-0 pointer-events-none hidden md:flex lg:flex flex-col">
              {TIME_SLOTS.map((_, i) => (
                <div key={i} className="h-[120px] w-full border-b border-[#C6C6C69E]" />
              ))}
            </div>

            {/* Vertical Columns & Fake Events */}
            {dummyDays.map((col, index) => (
              <div
                key={col}
                className={`relative h-full border-r border-[#C6C6C69E] last:border-r-0 z-10 p-2 
                ${index === 0 ? "block" : "hidden md:block lg:block"}`}
              >
                {/* Randomly placed fake events */}
                {index % 2 === 0 && (
                  <div className="absolute top-[140px] left-2 right-2 h-[100px] bg-gray-200 rounded-lg border-l-4 border-gray-300 opacity-60"></div>
                )}
                {index % 3 === 0 && (
                  <div className="absolute top-[380px] left-2 right-2 h-[220px] bg-gray-100 rounded-lg border-l-4 border-gray-300 opacity-60"></div>
                )}
                {index === 1 && (
                  <div className="absolute top-[50px] left-2 right-2 h-[120px] bg-gray-200 rounded-lg border-l-4 border-gray-300 opacity-60"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGridShimmer;
