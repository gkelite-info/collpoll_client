"use client";

import { CalendarBlank, X } from "@phosphor-icons/react";

type Props = {
  open?: boolean;
  event?: any | null;
  onClose?: () => void;
};

const STATIC_EVENT = {
  title: "Faculty Meeting",
  type: "meeting",
  rawTopic: "Department Planning",
  startTime: "2026-02-18T09:00:00",
  endTime: "2026-02-18T10:00:00",
  branch: "CSE",
  year: "3",
  section: "A",
};

export default function EventDetailsModal({
  open = true,
  event = STATIC_EVENT,
  onClose,
}: Props) {
  if (!open) return null;

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

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 text-black">
      <div className="w-[420px] rounded-xl bg-white shadow-xl relative p-6">
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
            onClick={handleClose}
            className="flex items-center justify-center h-9 w-9 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
        <h3 className="font-semibold text-lg mb-1 text-gray-900">
          {event.title || "-"}
          <span className="text-gray-500 font-medium text-base">
            {" "}
            — [{event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}]
          </span>
        </h3>
        {event.rawTopic && (
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Event Topic:</span> {event.rawTopic}
          </p>
        )}

        <div className="space-y-2.5 text-sm">
          <Detail label="Type" value={event.type} />
          <Detail label="Date" value={dateStr} />
          <Detail label="Time" value={timeStr} />
          <Detail label="Branch" value={event.branch} />
          <Detail label="Year" value={event.year} />
          <Detail label="Section" value={event.section} />
        </div>
      </div>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex">
    <span className="w-28 text-gray-500">{label} :</span>
    <span className="font-medium">{value || "-"}</span>
  </div>
);