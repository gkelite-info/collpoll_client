// src/components/calendar/CalendarGrid.tsx

import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CalendarEvent, WeekDay } from "../types";
import { getEventStyle } from "../utils";
import EventCard from "./eventCard";
import { TIME_SLOTS } from "../calenderData"; // Assuming this is defined

interface CalendarGridProps {
  events: CalendarEvent[];
  weekDays: WeekDay[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  activeTab: string; // <-- NEW: Prop from the toolbar
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  weekDays,
  onPrevWeek,
  onNextWeek,
  activeTab,
}) => {
  // Helper function to check if an event matches the active tab filter
  const matchesFilter = (event: CalendarEvent): boolean => {
    // If "All" is selected, always show the event.
    if (activeTab === "All") {
      return true;
    }
    // Check if the event's type (lowercase) matches the active tab (lowercase)
    return event.type.toLowerCase() === activeTab.toLowerCase();
  };

  return (
    <div className="bg-white rounded-r-[20px] rounded-b-[20px] shadow-sm overflow-y-auto flex flex-col relative h-[800px]">
      {/* Header Row (Days) - REDUCED HEIGHT AND INLINE LAYOUT */}
      <div className="flex border-b border-gray-400">
        {/* Navigation Arrows */}
        <div className="w-20 min-w-[80px] border-r border-gray-400 p-2 flex items-center justify-center gap-1 bg-white z-10">
          <button
            onClick={onPrevWeek}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            onClick={onNextWeek}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        {/* Dynamic Day Columns (FIXED LAYOUT) */}
        <div className="flex-1 grid grid-cols-5">
          {weekDays.map((day) => (
            <div
              key={day.fullDate}
              className={`text-center py-2.5 border-r border-gray-400 last:border-r-0`}
            >
              <div className="flex items-center justify-center space-x-1">
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  {day.day.substring(0, 3)}{" "}
                </div>
                <div className="text-sm font-bold text-gray-700">
                  {day.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-h-[720px]">
          {/* Time Sidebar */}
          <div className="w-20 min-w-20 bg-white border-r border-gray-300 shrink-0 select-none">
            {/* @ts-ignore */}
            {TIME_SLOTS &&
              TIME_SLOTS.map((time) => (
                <div
                  key={time}
                  className="h-[120px] text-[11px] font-medium text-gray-400 text-center pt-3 border-b border-dashed border-gray-100"
                >
                  {time}
                </div>
              ))}
          </div>

          {/* Day Columns */}
          <div className="flex-1 grid grid-cols-5 relative">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
              {/* @ts-ignore */}
              {TIME_SLOTS &&
                TIME_SLOTS.map((_, i) => (
                  <div
                    key={i}
                    className="h-[120px] w-full border-b border-[#C6C6C69E]"
                  />
                ))}
            </div>

            {weekDays.map((dayObj) => (
              <div
                key={dayObj.fullDate}
                className="relative h-full border-r border-[#C6C6C69E] last:border-r-0 z-10"
              >
                {/* 1. Filter by Date (Events within this day) */}
                {events
                  .filter((e) => e.startTime.startsWith(dayObj.fullDate))
                  // 2. Filter by Type (Active Toolbar Tab)
                  .filter(matchesFilter)

                  .map((event) => {
                    const position = getEventStyle(event);
                    return (
                      <div
                        key={event.id}
                        style={{ top: position.top, height: position.height }}
                        className="absolute w-full px-1"
                      >
                        <EventCard event={event} />
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
