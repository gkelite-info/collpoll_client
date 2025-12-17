// src/components/calendar/eventCard.tsx

import { Chalkboard, Island, Laptop, Users } from "@phosphor-icons/react";
import React from "react"; // Added React import for safety
import { CalendarEvent, EventType } from "../types";

// NOTE: Ensure EventType is defined in your types file with values like 'event', 'class', 'exam', 'holiday'

const EVENT_STYLES: Record<
  EventType,
  { solidBg: string; lightBg: string; text: string; Icon: any }
> = {
  event: {
    solidBg: "#E2DAFF",
    lightBg: "#E2DAFF8F",
    text: "#6C20CA",
    Icon: Users,
  },

  class: {
    solidBg: "#96CAFF",
    lightBg: "#D9EBFF",
    text: "#0056AD",
    Icon: Chalkboard,
  },

  exam: {
    solidBg: "#FFD8AF",
    lightBg: "#FFEDDA",
    text: "#FB8000",
    Icon: Laptop,
  },
  holiday: {
    solidBg: "#BFE8D5",
    lightBg: "#E6F6EF",
    text: "#1E7F5C",
    Icon: Island,
  },
};

const EventCard = ({ event }: { event: CalendarEvent }) => {
  // Use .toLowerCase() to ensure the key matches the record keys ('event', 'class', etc.)
  const style =
    EVENT_STYLES[event.type.toLowerCase() as EventType] || EVENT_STYLES.event;
  const Icon = style.Icon;

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const timeStr = `${start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  return (
    <div
      className={`absolute inset-x-0.5 h-full rounded-xs transition-shadow hover:shadow-lg cursor-pointer overflow-hidden z-20`}
    >
      <div
        className={`flex items-center p-2.5 space-x-2 text-xs font-semibold border-b border-dashed`}
        style={{
          backgroundColor: style.solidBg,
          color: style.text,
          borderColor: style.text,
        }} // 💡 FIX: Used style prop for colors
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0`}
          style={{ backgroundColor: style.text }} // 💡 FIX: Used style prop for background color
        >
          <Icon size={14} weight="fill" color="#ffffff" />
        </div>

        <span className="tracking-wide uppercase">{timeStr}</span>
      </div>

      <div
        className={`flex-1 p-2 h-full`}
        style={{ backgroundColor: style.lightBg }} // 💡 FIX: Used style prop for light background
      >
        <p
          className={`text-sm font-semibold leading-snug`}
          style={{ color: style.text }} // 💡 FIX: Used style prop for text color
        >
          {event.title}
        </p>
      </div>
    </div>
  );
};

export default EventCard;
