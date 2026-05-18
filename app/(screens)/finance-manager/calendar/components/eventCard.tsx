"use client";

import {
  ChalkboardTeacher,
  Exam,
  Question,
  VideoConference,
  Trash,
  PencilSimple,
} from "@phosphor-icons/react";
import type { CalendarEvent } from "../types";

type EventCardEvent = CalendarEvent & {
  participantAvatar?: string;
};

const EVENT_STYLES = {
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

const EventCard = ({
  event,
  onDelete,
  onEdit,
  onClick,
}: {
  event: EventCardEvent;
  onDelete?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}) => {
  const rawType = event.type?.toLowerCase();

  const eventType = (
    rawType in EVENT_STYLES ? rawType : "meeting"
  ) as keyof typeof EVENT_STYLES;

  const style = EVENT_STYLES[eventType];
  const Icon = style.Icon;

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const timeStr = `${start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  return (
    <div
      onClick={onClick}
      className="group relative inset-x-0.5 z-20 flex h-full cursor-pointer flex-col overflow-hidden rounded-sm transition-shadow hover:shadow-lg"
      style={{ backgroundColor: style.lightBg }}
    >
      {/* DELETE BUTTON */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute cursor-pointer top-2 right-2 hidden group-hover:flex bg-white rounded-full p-1 shadow hover:bg-red-50 z-50"
        >
          <Trash size={14} className="text-red-600" />
        </button>
      )}

      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute cursor-pointer top-2 right-8 hidden group-hover:flex bg-white rounded-full p-1 shadow hover:bg-blue-50 z-50"
        >
          <PencilSimple size={14} className="text-blue-600" />
        </button>
      )}

      <div
        className="flex shrink-0 items-center gap-2 border-b border-dashed px-3 py-2 text-xs font-semibold"
        style={{ borderColor: style.text, color: style.text }}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: style.text }}
        >
          <Icon size={15} weight="fill" />
        </span>
        <span className="truncate">{timeStr}</span>
      </div>

      <div
        className="truncate px-3 pt-2 text-sm font-semibold"
        style={{ color: style.text }}
      >
        {event.title}
      </div>

      {event.participantName && (
        <div
          className="flex items-center gap-2 px-3 pb-2 pt-1 text-xs font-medium"
          style={{ color: style.text }}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-[10px] font-bold">
            {event.participantAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.participantAvatar}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              event.participantName.charAt(0)
            )}
          </div>
          <span className="truncate font-semibold">{event.participantName}</span>
          {event.participantId && (
            <span className="ml-auto shrink-0 text-[10px] text-[#282828]">
              ID : {event.participantId}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
