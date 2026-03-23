import React from "react";
import { EventData } from "../data";

interface UpcomingEventsProps {
  events: EventData[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <h2 className="text-[18px] font-bold text-[#2d2d2d]">Upcoming Events</h2>
      <div className="bg-[#fffdfd] rounded-xl p-4 shadow-sm border border-gray-100 h-[240px]">
        <div className="flex flex-col gap-3 overflow-y-auto h-full pr-2 custom-scrollbar">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center gap-2 pb-2 border-b border-gray-50 last:border-0"
            >
              <span className="text-[13px] text-[#4b5563] font-medium truncate">
                {event.title}
              </span>
              <span className="text-[11px] font-bold text-[#233554] bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                {event.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default UpcomingEvents;
