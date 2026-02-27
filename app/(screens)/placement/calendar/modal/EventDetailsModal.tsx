"use client";

import { CalendarBlank, X } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  event: any | null;
  onClose: () => void;
};

export default function EventDetailsModal({
  open,
  event,
  onClose,
}: Props) {
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
      <div className="w-[420px] bg-white rounded-xl shadow-2xl relative">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <CalendarBlank
                size={20}
                weight="fill"
                className="text-purple-600"
              />
            </div>

            <h2 className="text-base font-semibold text-gray-800">
              Event Details
            </h2>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4 text-sm">

          {/* TITLE */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {event.title}
            </h3>
            <p className="text-gray-500 mt-1">
              Event Topic :{" "}
              <span className="text-gray-700 font-medium">
                {event.topic || "Session on creating professional resumes and optimizing LinkedIn for recruiters"}
              </span>
            </p>
          </div>

          {/* DETAILS LIST */}
          <div className="space-y-2 text-gray-700">

            <Detail label="Date" value={dateStr} />
            <Detail label="Room no" value={event.roomNo || "105"} />
            <Detail label="Time" value={timeStr} />
            <Detail label="Department" value={event.department || "CSE"} />
            <Detail label="Year" value={event.year || "1st"} />
            <Detail label="Semester" value={event.semester || "2"} />
            <Detail label="Section" value={event.section || "A"} />

          </div>
        </div>
      </div>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex">
    <span className="w-28 text-gray-500">{label} :</span>
    <span className="font-medium text-gray-800">{value || "-"}</span>
  </div>
);