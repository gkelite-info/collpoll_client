"use client";

import { CalendarBlank, X } from "@phosphor-icons/react";
import type { CalendarEvent } from "../types";

type Props = {
  open: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
};

export default function EventDetailsModal({ open, event, onClose }: Props) {
  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
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
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {event.title}
            </h3>
            <p className="mt-1 text-gray-500">
              Event Topic :{" "}
              <span className="font-medium text-gray-700">
                {event.topic ?? "-"}
              </span>
            </p>
          </div>

          <div className="space-y-2 text-gray-700">
            <Detail label="Time" value={event.time} />
            <Detail label="Participants" value={event.participants ?? "-"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="w-28 text-gray-500">{label} :</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
