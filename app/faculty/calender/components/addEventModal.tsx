"use client";

import { X, CalendarBlank } from "@phosphor-icons/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
}

const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("Class");
  const [date, setDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isDateInputFocused, setIsDateInputFocused] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null); // Ref for the modal's content box

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setSelectedType("Class");
      setDate(getTodayDateString());
      setStartTime("09:00");
      setEndTime("10:00");
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    if (!title || !date) {
      alert("Please fill in the required fields (Title and Date).");
      return;
    }

    if (startTime && endTime && startTime >= endTime) {
      alert("End time must be after start time.");
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
  }, [title, selectedType, date, startTime, endTime, onSave, onClose]);

  // --- NEW: Handle Click Outside and Enter Key Press ---
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

  if (!isOpen) return null;

  const eventTypes = ["Class", "Event", "Exam", "Holiday"];

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
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-gray-800 transition-colors p-1"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-5 space-y-5">
          {/* Event Title */}
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

          {/* Type Selector */}
          <div className="space-y-1">
            <label className="block text-gray-700 font-medium text-sm">
              Type
            </label>
            <div className="flex gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                    selectedType === type
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 🗓️ TIME & DATE ROW FIX */}
          <div>
            {/* 📅 Date Selection Group (w-1/2) */}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 placeholder:text-gray-400"
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                  onClick={openDatePicker}
                  aria-label="Open date picker"
                ></button>
              </div>
            </div>

            {/* ⏱️ Time Selection Group (w-1/2) */}
            <div className="w-1/2 space-y-1 mt-3">
              <label className="block text-gray-700 font-medium text-sm">
                Time
              </label>
              <div className="flex gap-2">
                {/* From Input Group */}
                <div className="flex-1">
                  <span className="block text-gray-500 text-xs mb-1">From</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    aria-label="Start time"
                    className="w-full border border-gray-300 rounded-lg px-2 py-2.5 outline-none focus:border-emerald-500 text-center transition-all text-gray-700"
                  />
                </div>

                {/* To Input Group */}
                <div className="flex-1">
                  <span className="block text-gray-500 text-xs mb-1">To</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    aria-label="End time"
                    className="w-full border border-gray-300 rounded-lg px-2 py-2.5 outline-none focus:border-emerald-500 text-center transition-all text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-base"
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
