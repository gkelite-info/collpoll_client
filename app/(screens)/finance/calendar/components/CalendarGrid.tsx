"use client";

import { useState, useEffect } from "react";
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

const getOverlappingEvents = (events: any[]) => {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  const clusters: any[][] = [];
  let lastEventEnd: Date | null = null;
  let currentCluster: any[] = [];

  sorted.forEach((event) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    if (lastEventEnd !== null && start >= lastEventEnd) {
      clusters.push(currentCluster);
      currentCluster = [];
    }
    currentCluster.push(event);
    if (lastEventEnd === null || end > lastEventEnd) lastEventEnd = end;
  });
  if (currentCluster.length > 0) clusters.push(currentCluster);

  const result: any[] = [];
  clusters.forEach((cluster) => {
    let cols: any[][] = [];
    cluster.forEach((event) => {
      let placed = false;
      for (let i = 0; i < cols.length; i++) {
        const lastEventInCol = cols[i][cols[i].length - 1];
        if (new Date(event.startTime) >= new Date(lastEventInCol.endTime)) {
          cols[i].push(event);
          placed = true;
          break;
        }
      }
      if (!placed) cols.push([event]);
    });
    cols.forEach((col, i) => {
      col.forEach((event) => {
        event.overlapIndex = i;
        event.overlapTotal = cols.length;
        result.push(event);
      });
    });
  });
  return result;
};

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

interface CalendarGridProps {
  events: any[];
  weekDays: any[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  activeTab?: string;
  onDeleteRequest?: (event: any) => void;
  onEditRequest?: (event: any) => void;
  onEventClick?: (event: any) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  weekDays,
  onPrevWeek,
  onNextWeek,
  activeTab = "All Scheduled",
  onDeleteRequest,
  onEditRequest,
  onEventClick,
}) => {
  const matchesFilter = (event: any): boolean => {
    if (activeTab === "All" || activeTab === "All Scheduled") {
      return true;
    }
    return event.type.toLowerCase() === activeTab.toLowerCase();
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState<any | null>(null);

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

  const isTimeOverlapping = (
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string,
  ) => {
    const aS = new Date(aStart).getTime();
    const aE = new Date(aEnd).getTime();
    const bS = new Date(bStart).getTime();
    const bE = new Date(bEnd).getTime();

    return aS < bE && aE > bS;
  };

  return (
    <div className="bg-red-00 rounded-bl-[20px] shadow-sm overflow-y-auto custom-scrollbar flex flex-col relative -mt-2 h-[80vh]">
      <div className="flex border-b border-gray-400 sticky top-0 z-20 bg-white">
        <div className="hidden md:flex lg:flex w-20 min-w-[80px] border-r border-gray-400 p-2 flex items-center justify-center gap-1 bg-white z-10">
          <button
            onClick={onPrevWeek}
            className="p-1 hover:bg-gray-100 cursor-pointer rounded text-gray-500 transition-colors"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            onClick={onNextWeek}
            className="p-1 hover:bg-gray-100 cursor-pointer rounded text-gray-500 transition-colors"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        <div className="bg-white flex md:hidden lg:hidden w-full items-center justify-center py-4 gap-4">
          <button onClick={handlePrevDay} className="p-2"><CaretLeft size={20} weight="bold" /></button>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            {weekDays[selectedDayIndex]?.day} {weekDays[selectedDayIndex]?.date}
          </h2>
          <button onClick={handleNextDay} className="p-2"><CaretLeft className="rotate-180" size={20} weight="bold" /></button>
        </div>

        <div className="flex-1 hidden md:grid md:grid-cols-6 lg:grid grid-cols-6 scrollbar-hide">
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

      <div className="bg-white flex-1 relative">
        <div className="flex min-h-[720px]">
          <div className="w-16 md:w-20 lg:w-20 bg-white border-r border-gray-300 shrink-0 select-none">
            {TIME_SLOTS &&
              TIME_SLOTS.map((time) => (
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
              {TIME_SLOTS &&
                TIME_SLOTS.map((_, i) => (
                  <div
                    key={i}
                    className="h-[120px] w-full border-b border-[#C6C6C69E]"
                  />
                ))}
            </div>

            {weekDays.map((dayObj, index) => (
              <div
                key={dayObj.fullDate}
                className={`relative h-full border-r border-[#C6C6C69E] last:border-r-0 z-10 
                  ${selectedDayIndex === index ? "block" : "hidden lg:block"}`}
              >
                {getOverlappingEvents(
                  events
                    .filter((e) => e.startTime.startsWith(dayObj.fullDate))
                    .filter(matchesFilter),
                ).map((event: any) => {
                  const position = getEventStyle(event);
                  const isHovered = hoveredEvent?.id === event.id;

                  const isSameTimeSlot =
                    hoveredEvent &&
                    hoveredEvent.startTime.startsWith(dayObj.fullDate) &&
                    isTimeOverlapping(
                      hoveredEvent.startTime,
                      hoveredEvent.endTime,
                      event.startTime,
                      event.endTime,
                    );

                  const baseWidth = 100 / (event.overlapTotal || 1);
                  let width = baseWidth;
                  let left = baseWidth * (event.overlapIndex || 0);
                  let zIndex = 10;

                  if (hoveredEvent && isSameTimeSlot) {
                    if (isHovered) {
                      width = 100;
                      left = 0;
                      zIndex = 50;
                    } else {
                      width = baseWidth;
                      left = baseWidth * (event.overlapIndex || 0);
                      zIndex = 1;
                    }
                  }

                  const shouldHide =
                    hoveredEvent && isSameTimeSlot && !isHovered;

                  return (
                    <div
                      key={event.id}
                      onMouseEnter={() => setHoveredEvent(event as any)}
                      onMouseLeave={() => setHoveredEvent(null)}
                      style={{
                        top: position.top,
                        height: position.height,
                        width: `${width}%`,
                        left: `${left}%`,
                        zIndex,
                      }}
                      className={`absolute px-1 transition-all duration-200 ease-out ${
                        shouldHide
                          ? "opacity-0 pointer-events-none scale-95"
                          : "opacity-100"
                      }`}
                    >
                      <EventCard
                        event={event}
                        onDelete={() => onDeleteRequest?.(event)}
                        onEdit={() => onEditRequest?.(event)}
                        onClick={() => onEventClick?.(event)}
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
