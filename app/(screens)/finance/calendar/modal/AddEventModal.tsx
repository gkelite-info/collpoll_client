"use client";

import { X } from "@phosphor-icons/react";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INPUT =
  "w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all";

export default function AddEventModal({
  isOpen,
  onClose,
}: AddEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-[480px] max-h-[90vh] rounded-xl flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-5 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Add Event
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <div className="p-5 pt-0 space-y-2 overflow-y-auto">

          {/* Event Title */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              placeholder=""
              className={INPUT}
            />
          </div>

          {/* Event Topic */}
          <div className="felx flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Event Topic
            </label>
            <input
              type="text"
              className={INPUT}
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              className={INPUT}
            />
          </div>

          {/* TIME */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Time
            </label>

            <div className="flex gap-4 mt-2">

              {/* FROM */}
              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">
                  From
                </span>
                <div className="flex gap-2">
                  <select className={`${INPUT} w-16 px-2`}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      return <option key={h}>{h}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16 px-2`}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i * 5).padStart(2, "0");
                      return <option key={m}>{m}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16 px-2`}>
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              {/* TO */}
              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">
                  To
                </span>
                <div className="flex gap-2">
                  <select className={`${INPUT} w-16 px-2`}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      return <option key={h}>{h}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16 px-2`}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i * 5).padStart(2, "0");
                      return <option key={m}>{m}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16 px-2`}>
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Department + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>
              <select className={INPUT}>
                <option>Select Department</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>MECH</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Year
              </label>
              <select className={INPUT}>
                <option>Select year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
              </select>
            </div>
          </div>

          {/* Semester + Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Semester
              </label>
              <select className={INPUT}>
                <option>Select Semester</option>
                <option>Sem 1</option>
                <option>Sem 2</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Section
              </label>
              <select className={INPUT}>
                <option>Select Section</option>
                <option>A</option>
                <option>B</option>
              </select>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-[#43C17A] hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Save
          </button>

        </div>
      </div>
    </div>
  );
}
