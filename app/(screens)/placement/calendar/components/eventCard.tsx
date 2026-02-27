"use client";

import {
  ChalkboardTeacher,
  Exam,
  Question,
  VideoConference,
  Trash,
  PencilSimple,
} from "@phosphor-icons/react";

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

/* ✅ SAFE TIME FORMATTER (NO LOCALE DEPENDENCY) */
const formatTime = (dateString: string) => {
  const date = new Date(dateString);

  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  const paddedMinutes = minutes.toString().padStart(2, "0");

  return `${hours}:${paddedMinutes} ${ampm}`;
};

const EventCard = ({
  event,
  onDelete,
  onEdit,
  onClick,
}: {
  event: any;
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

  /* ✅ NO MORE toLocaleTimeString */
  const timeStr = `${formatTime(event.startTime)} - ${formatTime(
    event.endTime
  )}`;

  return (
    <div
      onClick={onClick}
      className="relative inset-x-0.5 h-full rounded-xs transition-shadow hover:shadow-lg cursor-pointer overflow-hidden z-20 flex flex-col group"
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

      {/* EDIT BUTTON */}
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

      {/* HEADER */}
      <div
        className="flex items-center p-2.5 space-x-2 text-xs font-semibold border-b border-dashed shrink-0"
        style={{
          backgroundColor: style.solidBg,
          color: style.text,
          borderColor: style.text,
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: style.text }}
        >
          <Icon size={14} weight="fill" color="#ffffff" />
        </div>

        {/* ✅ FIXED TIME STRING */}
        <span className="tracking-wide uppercase">{timeStr}</span>
      </div>

      {/* BODY */}
      <div
        className="flex-1 min-h-0 pt-3 flex flex-col overflow-y-auto"
        style={{ backgroundColor: style.lightBg }}
      >
        <div className="px-3 shrink-0">
          <p
            className="text-base font-semibold leading-snug mb-3"
            style={{ color: style.text }}
          >
            {event.title}
          </p>
        </div>

        <div
          className="w-full border-t shrink-0"
          style={{ borderColor: style.text }}
        />

        <div className="px-3 py-2 shrink-0">
          <p className="text-sm font-medium" style={{ color: style.text }}>
            {event.branch} - {event.year} - {event.section}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;