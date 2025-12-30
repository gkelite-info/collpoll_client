"use client";

import { X } from "@phosphor-icons/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: any | null; 
  onSave: (eventData: any) => void;
  initialData?: any | null;
}

const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}) => {
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("Class");
  const [date, setDate] = useState(getTodayDateString());
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
  const closedByUserRef = useRef(false);

  const [isDateInputFocused, setIsDateInputFocused] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !initialData) return;

    setTitle(initialData.title);
    setSelectedType(initialData.type);
    setDate(initialData.date);

    const [sh, sm] = initialData.startTime.split(":");
    const [eh, em] = initialData.endTime.split(":");

    setStartHour(sh);
    setStartMinute(sm);
    setStartPeriod(Number(sh) >= 12 ? "PM" : "AM");

    setEndHour(eh);
    setEndMinute(em);
    setEndPeriod(Number(eh) >= 12 ? "PM" : "AM");
  }, [isOpen, initialData]);


  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setSelectedType("class");
      setDate(getTodayDateString());
      setStartHour("09");
      setStartMinute("00");
      setStartPeriod("AM");
      setEndHour("10");
      setEndMinute("00");
      setEndPeriod("AM");
    }
  }, [isOpen]);


  const to24Hour = (
    hour: string,
    minute: string,
    period: "AM" | "PM"
  ) => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${minute}`;
  };


  const handleSave = useCallback(() => {
    if (!title || !date) {
      toast.error("Please fill in the required fields (Title and Date).");
      return;
    }

    const startTime = to24Hour(startHour, startMinute, startPeriod);
    const endTime = to24Hour(endHour, endMinute, endPeriod);

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (startTime < "08:00" || endTime > "22:00") {
      toast.error("Events must be between 08:00 AM and 10:00 PM");
      return;
    }

    const newEvent = {
      title,
      type: selectedType.toLowerCase(),
      date,
      startTime,
      endTime,
    };
    onSave(newEvent);
    onClose();
  }, [title, selectedType, date, selectedType,
    startHour,
    startPeriod,
    endHour,
    startMinute,
    endMinute,
    endPeriod, onSave, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, onClose, handleSave]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;

      if (
        modalContentRef.current &&
        target &&
        !modalContentRef.current.contains(target)
      ) {
        handleClose();
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, handleSave]);


  if (!isOpen) return null;

  const eventTypes = ["class", "event", "exam", "holiday"];

  const formatLabel = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);


  const dateInputType = date || isDateInputFocused ? "date" : "text";

  const openDatePicker = () => {
    setIsDateInputFocused(true);
    dateInputRef.current?.focus();
    if (
      dateInputRef.current &&
      typeof dateInputRef.current.showPicker === "function"
    ) {
      dateInputRef.current.showPicker();
    }
  };

  const handleClose = () => {
    closedByUserRef.current = true;
    onClose();
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node | null;

    if (
      modalContentRef.current &&
      target &&
      !modalContentRef.current.contains(target)
    ) {
      handleClose();
    }
  };



  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalContentRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-[450px] relative"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            New Calendar Event
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="text-gray-500 cursor-pointer hover:text-gray-800 transition-colors p-1"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-1">
            <label
              htmlFor="event-title"
              className="block text-gray-700 font-medium text-sm"
            >
              Event Title
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Project Kickoff or Physics Exam"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-gray-700 font-medium text-sm">
              Type
            </label>
            <div className="flex gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-1 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all border ${selectedType === type
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {formatLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="w-1/2 space-y-1">
              <label
                htmlFor="event-date"
                className="block text-gray-700 font-medium text-sm"
              >
                Date
              </label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  id="event-date"
                  type={dateInputType}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setIsDateInputFocused(!!e.target.value);
                  }}
                  onFocus={() => setIsDateInputFocused(true)}
                  onBlur={() => setIsDateInputFocused(!!date)}
                  placeholder="DD / MM / YYYY"
                  className="w-full border cursor-pointer border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 placeholder:text-gray-400"
                />

                <button
                  type="button"
                  className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                  onClick={openDatePicker}
                  aria-label="Open date picker"
                ></button>
              </div>
            </div>

            <div className="w-1/2 space-y-1 mt-3">
              <label className="block text-gray-700 font-medium text-sm">
                Time
              </label>

              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="block text-gray-500 text-xs mb-1">From</span>
                  <div className="flex gap-1">
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="border rounded-lg px-2 py-2 w-14"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const h = String(i + 1).padStart(2, "0");
                        return <option key={h}>{h}</option>;
                      })}
                    </select>

                    <select
                      value={startMinute}
                      onChange={(e) => setStartMinute(e.target.value)}
                      className="border rounded-lg px-2 py-2 w-16"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i * 5).padStart(2, "0");
                        return <option key={m}>{m}</option>;
                      })}
                    </select>

                    <select
                      value={startPeriod}
                      onChange={(e) => setStartPeriod(e.target.value as "AM" | "PM")}
                      className="border rounded-lg px-2 py-2 w-16"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1">
                  <span className="block text-gray-500 text-xs mb-1">To</span>
                  <div className="flex gap-1">
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                      className="border rounded-lg px-2 py-2 w-14"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const h = String(i + 1).padStart(2, "0");
                        return <option key={h}>{h}</option>;
                      })}
                    </select>

                    <select
                      value={endMinute}
                      onChange={(e) => setEndMinute(e.target.value)}
                      className="border rounded-lg px-2 py-2 w-16"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i * 5).padStart(2, "0");
                        return <option key={m}>{m}</option>;
                      })}
                    </select>

                    <select
                      value={endPeriod}
                      onChange={(e) => setEndPeriod(e.target.value as "AM" | "PM")}
                      className="border rounded-lg px-2 py-2 w-16"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-base"
            >
              Save Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
