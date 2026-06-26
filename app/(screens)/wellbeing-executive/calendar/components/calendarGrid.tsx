"use client";

import { useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CALENDAR_EVENTS, TIME_SLOTS } from "../calenderData";
import type { CalendarEvent, WeekDay } from "../types";
import EventCard from "./eventCard";

type Props = {
  weekDays: WeekDay[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onEventClick: (event: CalendarEvent) => void;
};

export default function CalendarGrid({
  weekDays,
  onPrevWeek,
  onNextWeek,
  onEventClick,
}: Props) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    setSelectedDayIndex(0);
  }, [weekDays]);

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(prev => prev - 1);
    } else {
      onPrevWeek();
      setSelectedDayIndex(weekDays.length - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDayIndex < weekDays.length - 1) {
      setSelectedDayIndex(prev => prev + 1);
    } else {
      onNextWeek();
      setSelectedDayIndex(0);
    }
  };

  return (
    <div className="bg-red-00 rounded-bl-[20px] shadow-sm overflow-y-auto custom-scrollbar flex flex-col relative -mt-2 h-[80vh]">
      <div className="flex border-b border-gray-400 sticky top-0 z-20 bg-white">
        <div className="hidden md:flex lg:flex w-20 min-w-[80px] border-r border-gray-400 p-2 flex items-center justify-center gap-1 bg-white z-10">
          <button
            type="button"
            onClick={onPrevWeek}
            className="p-1 hover:bg-gray-100 cursor-pointer rounded text-gray-500 transition-colors"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="p-1 hover:bg-gray-100 cursor-pointer rounded text-gray-500 transition-colors"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        <div className="bg-white flex md:hidden lg:hidden w-full items-center justify-center py-4 gap-4">
          <button onClick={handlePrevDay} className="p-2 cursor-pointer"><CaretLeft size={20} weight="bold" /></button>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            {weekDays[selectedDayIndex]?.label} {weekDays[selectedDayIndex]?.date}
          </h2>
          <button onClick={handleNextDay} className="p-2 cursor-pointer"><CaretLeft className="rotate-180" size={20} weight="bold" /></button>
        </div>

        <div className="flex-1 hidden md:grid md:grid-cols-6 lg:grid grid-cols-6 scrollbar-hide">
          {weekDays.map((day) => (
            <div
              key={day.fullDate}
              className={`text-center py-2.5 border-r border-gray-400 last:border-r-0`}
            >
              <div className="flex items-center justify-center space-x-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{day.label}</span>
                <span className="text-sm font-bold text-gray-700">{day.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white flex-1 relative">
        <div className="flex min-h-[1680px]">
          <div className="w-16 md:w-20 lg:w-20 bg-white border-r border-gray-300 shrink-0 select-none">
              {TIME_SLOTS.map((time) => (
                <div
                  key={time}
                  className="h-[120px] text-[10px] md:text-[11px] lg:text-[11px] font-medium text-gray-400 text-center pt-3 border-b border-dashed border-gray-100"
                >
                  {time}
                </div>
              ))}
            </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 relative">
            <div className="absolute inset-0 z-0 pointer-events-none hidden lg:flex flex-col">
              {TIME_SLOTS.map((_, i) => (
                <div
                  key={i}
                  className="h-[120px] w-full border-b border-[#C6C6C69E]"
                />
              ))}
            </div>

            {weekDays.map((day, dayIndex) => (
              <div
                key={day.fullDate}
                className={`relative min-h-[1680px] border-r border-[#C6C6C69E] last:border-r-0 z-10 px-1 ${selectedDayIndex === dayIndex ? "block" : "hidden lg:block"}`}
              >
                <div className="absolute inset-0 z-0 pointer-events-none lg:hidden flex flex-col">
                  {TIME_SLOTS.map((_, i) => (
                    <div
                      key={i}
                      className="h-[120px] w-full border-b border-[#C6C6C69E]"
                    />
                  ))}
                </div>

                {CALENDAR_EVENTS.filter(
                  (event) => event.dayIndex === dayIndex,
                ).map((event) => {
                  const top = (event.startHour - 8) * 120;
                  const height = event.duration * 120;

                  return (
                    <div
                      key={event.id}
                      style={{ top, height }}
                      className="absolute left-[2%] w-[96%]"
                    >
                      <EventCard
                        event={event}
                        onClick={() => onEventClick(event)}
                      />
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
}
