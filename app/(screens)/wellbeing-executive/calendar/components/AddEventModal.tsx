"use client";

import { CaretDown, X } from "@phosphor-icons/react";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const inputClass =
  "h-10 w-full rounded-md border border-[#C9C9C9] px-3 text-sm text-[#282828] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A]";

const timeInputClass =
  "h-10 min-w-0 flex-1 rounded-md border border-[#C9C9C9] px-3 text-sm text-[#282828] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A]";

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const hours = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

const minutes = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0"),
);

export default function AddEventModal({ isOpen, onClose }: Props) {
  const [date, setDate] = useState(getTodayDateString());
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");

  if (!isOpen) return null;

  const to24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
    let h = Number(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const validateTimeRange = () => {
    const startTime = to24Hour(startHour, startMinute, startPeriod);
    const endTime = to24Hour(endHour, endMinute, endPeriod);

    if (startTime === endTime) {
      toast.error("Start and End time cannot be the same");
      return false;
    }

    if (endTime < startTime) {
      toast.error("End time must be after start time");
      return false;
    }

    if (startTime < "08:00" || endTime > "22:00") {
      toast.error("Events must be between 08:00 AM and 10:00 PM");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!date) {
      toast.error("Please select date");
      return;
    }

    if (date < getTodayDateString()) {
      toast.error("Past dates are not allowed");
      return;
    }

    if (!validateTimeRange()) return;

    onClose();
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/45 px-4">
      <div className="flex max-h-[90vh] w-full max-w-[540px] flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between px-6 pb-3 pt-6">
          <h2 className="text-lg font-semibold text-[#282828]">Add Event</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1 text-[#282828] hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 pb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F3F4F6] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#43C17A]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#282828]">
              Event Title
            </span>
            <input
              className={inputClass}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#282828]">
                Event Topic
              </span>
              <input className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#282828]">
                Date
              </span>
              <input
                type="date"
                value={date}
                min={getTodayDateString()}
                onChange={(event) => setDate(event.target.value)}
                placeholder="DD | MM | YYYY"
                className={inputClass}
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#282828]">Time</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs text-[#4B5563]">
                  From
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={startHour}
                    onChange={(event) => setStartHour(event.target.value)}
                    className={`${timeInputClass} cursor-pointer bg-white`}
                  >
                    {hours.map((hour) => (
                      <option key={hour}>{hour}</option>
                    ))}
                  </select>
                  <select
                    value={startMinute}
                    onChange={(event) => setStartMinute(event.target.value)}
                    className={`${timeInputClass} cursor-pointer bg-white`}
                  >
                    {minutes.map((minute) => (
                      <option key={minute}>{minute}</option>
                    ))}
                  </select>
                  <select
                    value={startPeriod}
                    onChange={(event) =>
                      setStartPeriod(event.target.value as "AM" | "PM")
                    }
                    className={`${timeInputClass} cursor-pointer bg-white`}
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
              <div>
                <span className="mb-1 block text-xs text-[#4B5563]">
                  To
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={endHour}
                    onChange={(event) => setEndHour(event.target.value)}
                    className={`${timeInputClass} cursor-pointer bg-white`}
                  >
                    {hours.map((hour) => (
                      <option key={hour}>{hour}</option>
                    ))}
                  </select>
                  <select
                    value={endMinute}
                    onChange={(event) => setEndMinute(event.target.value)}
                    className={`${timeInputClass} cursor-pointer bg-white`}
                  >
                    {minutes.map((minute) => (
                      <option key={minute}>{minute}</option>
                    ))}
                  </select>
                  <select
                    value={endPeriod}
                    onChange={(event) =>
                      setEndPeriod(event.target.value as "AM" | "PM")
                    }
                    className={`${timeInputClass} cursor-pointer bg-white`}
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#282828]">
              Participants
            </span>
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-md border border-[#C9C9C9] px-4 text-sm text-[#282828] transition hover:border-[#43C17A] focus:border-[#43C17A] focus:outline-none focus:ring-1 focus:ring-[#43C17A]"
            >
              Select Participants
              <CaretDown size={18} />
            </button>
          </label>

          <button
            type="button"
            onClick={handleSave}
            className="h-11 w-full rounded-md bg-[#43C17A] text-base font-semibold text-white hover:bg-[#35ad68] cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
