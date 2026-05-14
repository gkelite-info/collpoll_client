"use client";

import {
  ChalkboardTeacher,
  Exam,
  Question,
  VideoConference,
} from "@phosphor-icons/react";
import type { CalendarEvent, CalendarEventType } from "../types";

const EVENT_STYLES: Record<
  CalendarEventType,
  { solidBg: string; lightBg: string; text: string; Icon: typeof VideoConference }
> = {
  meeting: {
    solidBg: "#E2DAFF",
    lightBg: "#E2DAFF8F",
    text: "#6C20CA",
    Icon: VideoConference,
  },
  class: {
    solidBg: "#96CAFF",
    lightBg: "#D9EBFF",
    text: "#0056AD",
    Icon: ChalkboardTeacher,
  },
  exam: {
    solidBg: "#FFD8AF",
    lightBg: "#FFEDDA",
    text: "#FB8000",
    Icon: Exam,
  },
  quiz: {
    solidBg: "#BFE8D5",
    lightBg: "#E6F6EF",
    text: "#1E7F5C",
    Icon: Question,
  },
};

type Props = {
  event: CalendarEvent;
  onClick: () => void;
};

export default function EventCard({ event, onClick }: Props) {
  const style = EVENT_STYLES[event.type] ?? EVENT_STYLES.meeting;
  const Icon = style.Icon;

  return (
    <div
      onClick={onClick}
      className="group relative inset-x-0.5 z-20 flex h-full cursor-pointer flex-col overflow-hidden rounded-xs transition-shadow hover:shadow-lg"
    >
      <div
        className="flex shrink-0 items-center space-x-2 border-b border-dashed p-2 text-[11px] font-semibold"
        style={{
          backgroundColor: style.solidBg,
          borderColor: style.text,
          color: style.text,
        }}
      >
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: style.text }}
        >
          <Icon size={13} weight="fill" color="#ffffff" />
        </div>
        <span className="tracking-wide uppercase">{event.time}</span>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-3"
        style={{ backgroundColor: style.lightBg }}
      >
        <div className="shrink-0 px-3">
          <p
            className="mb-3 text-sm font-semibold leading-snug"
            style={{ color: style.text }}
          >
            {event.title}
          </p>
        </div>

        <div className="w-full shrink-0 border-t" style={{ borderColor: style.text }} />

        <div className="shrink-0 px-3 py-2">
          <p className="text-xs font-medium" style={{ color: style.text }}>
            {event.branch} - {event.year} - {event.section}
          </p>
        </div>
      </div>
    </div>
  );
}
