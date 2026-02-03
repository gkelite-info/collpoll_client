"use client";

import { Calendar, CalendarBlank, X } from "@phosphor-icons/react";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[420px] rounded-xl bg-white shadow-xl relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                            <CalendarBlank size={22} weight="fill" className="text-purple-600" />
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 leading-none">
                            Event Details
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex items-center justify-center h-9 w-9 
               rounded-full text-gray-500 hover:text-gray-900 
               hover:bg-gray-100"
                    >
                        <X size={18} weight="bold" />
                    </button>
                </div>


                <h3 className="font-semibold text-base mb-1 text-gray-900">
                    {event.subjectName || "-"}
                    <span className="text-gray-500 font-medium">
                        {" "}— [{event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        {event.subjectKey ? `, (${event.subjectKey})` : ""}]
                    </span>
                </h3>

                {event.rawFormData?.topicId && (
                    <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Event Topic :</span>{" "}
                        {event.title}
                    </p>
                )}

                <div className="space-y-2 text-sm">
                    <Detail label="Type" value={event.type} />
                    <Detail label="Date" value={dateStr} />
                    <Detail label="Room no" value={event.rawFormData?.roomNo || "-"} />
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