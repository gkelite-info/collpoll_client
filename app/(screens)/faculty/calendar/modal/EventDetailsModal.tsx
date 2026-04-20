"use client";

import { CalendarBlank, X } from "@phosphor-icons/react";
import { CalendarEvent } from "../types";

type Props = {
  open: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
};

export default function EventDetailsModal({ open, event, onClose }: Props) {
  if (!open || !event) return null;

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  const timeStr = `${start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const dateStr = start.toLocaleDateString("en-GB");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[420px] rounded-xl bg-white shadow-xl relative p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
              <CalendarBlank
                size={22}
                weight="fill"
                className="text-purple-600"
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 leading-none">
              Event Details
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex items-center cursor-pointer justify-center h-9 w-9 
               rounded-full text-gray-500 hover:text-gray-900 
               hover:bg-gray-100 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <h3 className="font-semibold text-base mb-1 text-gray-900">
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} -{" "}
          {event.subjectName && event.subjectName !== "-"
            ? event.subjectName
            : "General"}{" "}
          {event.subjectKey && (
            <span className="text-gray-500 font-medium">
              [{event.subjectKey}]
            </span>
          )}
        </h3>

        {event.rawFormData?.topicTitle && (
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Event Topic :</span>{" "}
            {event.rawFormData.topicTitle}
          </p>
        )}

        {event.type === "meeting" && event.title && (
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Meeting Title :</span> {event.title}
          </p>
        )}

        <div className="space-y-2 text-sm text-[#282828] bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
          <Detail
            label="Type"
            value={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          />
          <Detail label="Date" value={dateStr} />
          <Detail label="Room no" value={event.rawFormData?.roomNo || "-"} />
          <Detail label="Time" value={timeStr} />

          {event.type === "meeting" && (
            <>
              {event.rawFormData?.meetingLink && (
                <Detail
                  label="Link"
                  value={event.rawFormData.meetingLink}
                  isLink
                />
              )}
              {event.rawFormData?.meetingId && (
                <Detail label="Zoom ID" value={event.rawFormData.meetingId} />
              )}
              {event.rawFormData?.meetingPassword && (
                <Detail
                  label="Password"
                  value={event.rawFormData.meetingPassword}
                />
              )}
            </>
          )}

          <div className=" my-2 space-y-2">
            <Detail label="Branch" value={event.branch} />
            <Detail label="Year" value={event.year} />
            <Detail label="Section" value={event.section} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Detail = ({
  label,
  value,
  isLink,
}: {
  label: string;
  value?: string;
  isLink?: boolean;
}) => (
  <div className="flex items-start">
    <span className="w-24 shrink-0 text-gray-500 font-medium">{label} :</span>
    {isLink && value && value !== "-" ? (
      <a
        href={value.startsWith("http") ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 hover:text-blue-800 hover:underline break-all transition-colors"
      >
        {value}
      </a>
    ) : (
      <span className="font-semibold text-gray-800 break-words">
        {value || "-"}
      </span>
    )}
  </div>
);
