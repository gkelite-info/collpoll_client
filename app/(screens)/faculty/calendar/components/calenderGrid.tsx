import { useEffect, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CalendarEvent, WeekDay } from "../types";
import { getEventStyle, getOverlappingEvents } from "../utils";
import EventCard from "./eventCard";
import { TIME_SLOTS } from "../calenderData";

interface CalendarGridProps {
  events: CalendarEvent[];
  weekDays: WeekDay[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  activeTab: string;
  onDeleteRequest: (event: CalendarEvent) => void;
  onEditRequest: (event: CalendarEvent) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  weekDays,
  onPrevWeek,
  onNextWeek,
  activeTab,
  onDeleteRequest,
  onEditRequest,
  onEventClick,
}) => {
  const matchesFilter = (event: CalendarEvent): boolean => {
    if (activeTab === "All") {
      return true;
    }

    return event.type.toLowerCase() === activeTab.toLowerCase();
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);

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
    bEnd: string
  ) => {
    const aS = new Date(aStart).getTime();
    const aE = new Date(aEnd).getTime();
    const bS = new Date(bStart).getTime();
    const bE = new Date(bEnd).getTime();

    return aS < bE && aE > bS;
  };

  return (
    <div className="bg-red-00 lg:rounded-r-[20px] rounded-b-[20px] shadow-sm overflow-y-auto scrollbar-hide flex flex-col relative -mt-2 h-[80vh]">
      <div className="flex border-b border-gray-400">
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

      <div className="bg-white flex-1 overflow-y-auto lg:scrollbar-hide relative">
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

          <div className="flex-1 grid grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 relative overflow-y-auto">
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
                  Array.from(
                    new Map(
                      events
                        .filter((e) => e.startTime.startsWith(dayObj.fullDate))
                        .filter(matchesFilter)
                        .map((e) => [
                          `${e.id}-${e.startTime}-${e.endTime}`,
                          e,
                        ])
                    ).values()
                  )
                ).map((event) => {
                  const position = getEventStyle(event);

                  const isHovered = hoveredEvent?.id === event.id;

                  const isSameTimeSlot =
                    hoveredEvent &&
                    hoveredEvent.startTime.startsWith(dayObj.fullDate) &&
                    isTimeOverlapping(
                      hoveredEvent.startTime,
                      hoveredEvent.endTime,
                      event.startTime,
                      event.endTime
                    );

                  const baseWidth = 100 / event.overlapTotal;
                  let width = baseWidth;
                  let left = baseWidth * event.overlapIndex;
                  let zIndex = 10;

                  if (hoveredEvent && isSameTimeSlot) {
                    if (isHovered) {
                      width = 100;
                      left = 0;
                      zIndex = 50;
                    } else {
                      width = baseWidth;
                      left = baseWidth * event.overlapIndex;
                      zIndex = 1;
                    }
                  }

                  const shouldHide =
                    hoveredEvent &&
                    isSameTimeSlot &&
                    !isHovered;

                  return (
                    <div
                      key={`${event.id}-${event.startTime}-${event.endTime}`}
                      onMouseEnter={() => setHoveredEvent(event)}
                      onMouseLeave={() => setHoveredEvent(null)}
                      style={{
                        top: position.top,
                        height: position.height,
                        width: `${width}%`,
                        left: `${left}%`,
                        zIndex,
                      }}
                      className={`absolute px-1 transition-all duration-200 ease-out ${shouldHide
                        ? "opacity-0 pointer-events-none scale-95"
                        : "opacity-100"
                        }`}
                    >
                      <EventCard
                        event={event}
                        onDelete={() => onDeleteRequest(event)}
                        onEdit={() => onEditRequest(event)}
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
};

export default CalendarGrid;
