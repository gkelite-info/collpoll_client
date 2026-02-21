"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import EventCard from "./eventCard";

const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

interface CalendarGridProps {
  onEditRequest: (event: any) => void;
  onDeleteRequest: (event: any) => void;
  events: any[];
  weekDays: any[];
}

const getEventStyle = (event: any) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  const startOfDay = new Date(start);
  startOfDay.setHours(8, 0, 0, 0);

  const endOfGrid = new Date(start);
  endOfGrid.setHours(22, 0, 0, 0);

  const clampedStart =
    start < startOfDay ? startOfDay : start > endOfGrid ? endOfGrid : start;
  const clampedEnd =
    end > endOfGrid ? endOfGrid : end < startOfDay ? startOfDay : end;

  const durationMinutes = Math.max(
    0,
    (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60),
  );
  const minutesFromStart = Math.max(
    0,
    (clampedStart.getTime() - startOfDay.getTime()) / (1000 * 60),
  );

  const PIXELS_PER_MIN = 2;

  return {
    top: `${minutesFromStart * PIXELS_PER_MIN}px`,
    height: `${durationMinutes * PIXELS_PER_MIN}px`,
  };
};

const CalendarGrid: React.FC<CalendarGridProps> = ({
  onEditRequest,
  onDeleteRequest,
  events,
  weekDays,
}) => {
  return (
    <div className="bg-white rounded-r-[20px] rounded-b-[20px] shadow-sm overflow-y-auto flex flex-col relative -mt-2 h-[400px] 2xl:h-[700px]">
      {/* HEADER */}
      <div className="flex border-b border-gray-400">
        <div className="w-20 min-w-[80px] border-r border-gray-400 p-2 flex items-center justify-center gap-1 bg-white z-10">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <CaretLeft size={16} weight="bold" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-6">
          {weekDays.map((day) => (
            <div
              key={day.fullDate}
              className="text-center py-2.5 border-r border-gray-400 last:border-r-0"
            >
              <div className="flex items-center justify-center space-x-1">
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  {day.day}
                </div>
                <div className="text-sm font-bold text-gray-700">
                  {day.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-h-[720px]">
          <div className="w-20 min-w-20 bg-white border-r border-gray-300 shrink-0 select-none">
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="h-[120px] text-[11px] font-medium text-gray-400 text-center pt-3 border-b border-dashed border-gray-100"
              >
                {time}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-6 relative">
            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
              {TIME_SLOTS.map((_, i) => (
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
                {events
                  .filter((e) => e.startTime.startsWith(dayObj.fullDate))
                  .map((event) => {
                    const position = getEventStyle(event);

                    return (
                      <div
                        key={event.id}
                        style={{
                          top: position.top,
                          height: position.height,
                          width: "100%",
                          left: "0%",
                        }}
                        className="absolute px-1"
                      >
                        <EventCard
                          event={event}
                          onEdit={() => onEditRequest(event)}
                          onDelete={() => onDeleteRequest(event)}
                          onClick={() => console.log("View")}
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
};

export default CalendarGrid;
