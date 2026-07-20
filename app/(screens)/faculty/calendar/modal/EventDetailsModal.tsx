"use client";

import { CalendarBlank, X } from "@phosphor-icons/react";
import { CalendarEvent } from "../types";
import { useUser } from "@/app/utils/context/UserContext";

type Props = {
  open: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  isSchool?: boolean;
};

export default function EventDetailsModal({ open, event, onClose, isSchool }: Props) {
  if (!open || !event) return null;
  const { collegeEducationType } = useUser();

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[420px] rounded-xl bg-white shadow-xl relative p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3 min-w-0 pr-2">
            <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5">
              <CalendarBlank
                size={22}
                weight="fill"
                className="text-purple-600"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 leading-snug break-words">
                {!isSchool && `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} - `}
                {event.subjectName && event.subjectName !== "-"
                  ? event.subjectName
                  : event.title || "Event Details"}{" "}
                {event.subjectKey && (
                  <span className="text-gray-500 font-normal text-sm">
                    [{event.subjectKey}]
                  </span>
                )}
              </h2>

              {event.rawFormData?.topicTitle && (
                <p className="text-xs text-gray-500 mt-1 font-medium truncate">
                  <span className="text-gray-400">Topic:</span>{" "}
                  {event.rawFormData.topicTitle}
                </p>
              )}

              {event.type === "meeting" && event.title && (
                <p className="text-xs text-gray-500 mt-1 font-medium truncate">
                  <span className="text-gray-400">Meeting Title:</span> {event.title}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center cursor-pointer justify-center h-8 w-8 
               rounded-full text-gray-400 hover:text-gray-700 
               hover:bg-gray-100 transition-colors shrink-0 -mr-1"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

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

          <div className="my-2 space-y-2">
            {!isSchool && (
              <Detail label={collegeEducationType === "Inter" ? "Group" : "Branch"} value={event.branch} />
            )}
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
