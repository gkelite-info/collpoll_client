"use client";

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
  return (
    <section className="-mt-px h-[500px] overflow-hidden rounded-r-[20px] rounded-b-[20px] border border-gray-200 bg-white shadow-sm 2xl:h-[700px]">
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-[80px_repeat(6,minmax(0,1fr))] border-b border-gray-400 bg-white pr-1.5">
          <div className="flex h-[60px] items-center justify-center gap-1 border-r border-gray-400 bg-white p-2">
            <button
              type="button"
              onClick={onPrevWeek}
              className="rounded p-1 text-[#667085] hover:bg-gray-100"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <button
              type="button"
              onClick={onNextWeek}
              className="rounded p-1 text-[#667085] hover:bg-gray-100"
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </div>

          {weekDays.map((day) => (
            <div
              key={day.fullDate}
              className="flex h-[60px] items-center justify-center gap-1 border-r border-gray-400 bg-white text-xs font-semibold text-[#5B6472]"
            >
              <span>{day.label}</span>
              <span className="text-sm font-bold text-[#27364A]">
                {day.date}
              </span>
            </div>
          ))}
        </div>

        <div
          className="custom-scrollbar relative flex-1 overflow-y-auto"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="grid min-h-[1680px] grid-cols-[80px_repeat(6,minmax(0,1fr))]">
            <div className="bg-white">
              {TIME_SLOTS.map((time) => (
                <div
                  key={time}
                  className="h-[120px] border-r border-[#D9D9D9] pt-3 text-center text-[11px] font-medium text-gray-400"
                >
                  {time}
                </div>
              ))}
            </div>

            {weekDays.map((day, dayIndex) => (
              <div
                key={day.fullDate}
                className="relative min-h-[1680px] border-r border-[#C6C6C69E]"
              >
                {TIME_SLOTS.map((time) => (
                  <div
                    key={time}
                    className="h-[120px] border-b border-[#C6C6C69E]"
                  />
                ))}

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
    </section>
  );
}
