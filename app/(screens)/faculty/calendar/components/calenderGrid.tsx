import { useState } from "react";
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
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  weekDays,
  onPrevWeek,
  onNextWeek,
  activeTab,
  onDeleteRequest,
  onEditRequest,
}) => {
  const matchesFilter = (event: CalendarEvent): boolean => {
    if (activeTab === "All") {
      return true;
    }

    return event.type.toLowerCase() === activeTab.toLowerCase();
  };

  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);


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
    <div className="bg-white rounded-r-[20px] rounded-b-[20px] shadow-sm overflow-y-auto flex flex-col relative -mt-2 h-[400px] 2xl:h-[700px]">
      <div className="flex border-b border-gray-400">
        <div className="w-20 min-w-[80px] border-r border-gray-400 p-2 flex items-center justify-center gap-1 bg-white z-10">
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

        <div className="flex-1 grid grid-cols-6">
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

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-h-[720px]">
          <div className="w-20 min-w-20 bg-white border-r border-gray-300 shrink-0 select-none">
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

          <div className="flex-1 grid grid-cols-6 relative">
            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
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
                {getOverlappingEvents(
                  events
                    .filter((e) => e.startTime.startsWith(dayObj.fullDate))
                    .filter(matchesFilter)
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
                      key={event.id}
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
                      <EventCard event={event} onDelete={() => onDeleteRequest(event)} onEdit={() => onEditRequest(event)}/>
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
