"use client";

import { CalendarBlank, X } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  event: any | null;
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
            onClick={onClose}
            className="flex items-center justify-center h-9 w-9 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <h3 className="font-semibold text-lg mb-1 text-gray-900">
          {event.title || "-"}
        </h3>

        {event.rawTopic && (
          <p className="text-sm text-gray-600 mb-4 italic">{event.rawTopic}</p>
        )}

        <div className="space-y-2.5 text-sm">
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
    <span className="font-medium text-gray-800">{value || "-"}</span>
  </div>
);
