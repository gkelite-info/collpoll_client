"use client";

import React from "react";

interface TypeAndModeFieldsProps {
  calendarMode: "single" | "bulk";
  setCalendarMode: (mode: "single" | "bulk") => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

const TypeAndModeFields: React.FC<TypeAndModeFieldsProps> = ({
  calendarMode,
  setCalendarMode,
  selectedType,
  setSelectedType,
}) => {
  const eventTypes = ["class", "meeting", "exam"];
  const formatLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  return (
    <>
      <div className="space-y-1">
        <label className="block text-gray-700 font-medium text-sm">
          Calendar Mode
        </label>
        <div className="flex gap-2">
          {["single", "bulk"].map((mode) => (
            <button
              key={mode}
              onClick={() => setCalendarMode(mode as "single" | "bulk")}
              className={`flex-1 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all border ${
                calendarMode === mode
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {formatLabel(mode)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-gray-700 font-medium text-sm">Type</label>
        <div className="flex gap-2">
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all border ${
                selectedType === type
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {formatLabel(type)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default TypeAndModeFields;
