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

const EVENT_STYLES = {
  meeting: {
    solidBg: "#6C20CA",
    lightBg: "#EEE7FF",
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
  event: CalendarEvent;
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
      className="group relative inset-x-0.5 z-20 h-full min-h-[110px] cursor-pointer overflow-auto rounded-md transition-shadow hover:shadow-lg custom-scrollbar"
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

      <div className="flex h-full min-w-[220px] flex-col">
        <div
          className="flex shrink-0 items-center gap-3 border-b-2 border-dashed px-4 py-3 font-semibold"
          style={{ borderColor: style.text, color: style.text }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: style.solidBg }}
          >
            <Icon size={19} weight="fill" />
          </span>
          <span className="whitespace-nowrap text-sm leading-none md:text-base">
            {timeStr}
          </span>
        </div>

        <div
          className="whitespace-nowrap px-4 pt-3 text-base font-semibold leading-tight"
          style={{ color: style.text }}
        >
          {event.title}
        </div>

        {event.participantName && (
          <div
            className="flex items-center gap-3 px-4 pb-3 pt-2 text-sm font-medium"
            style={{ color: style.text }}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-bold">
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
            <span className="whitespace-nowrap text-base font-medium">
              {event.participantName}
            </span>
            {event.participantId && (
              <span className="ml-auto shrink-0 whitespace-nowrap pr-1 text-sm text-[#282828]">
                ID : {event.participantId}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
