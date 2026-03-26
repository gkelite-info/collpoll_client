"use client";

import { useState, useEffect } from "react";

type Props = {
  value:          string;           // "09:30 AM" or ""
  defaultMeridiem?: "AM" | "PM";   // default when no value — "AM" for checkIn, "PM" for checkOut
  onChange:       (val: string) => void;
};

function parseValue(val: string, defaultMer: "AM" | "PM"): { hh: string; mm: string; mer: "AM" | "PM" } {
  if (!val) return { hh: "", mm: "", mer: defaultMer };
  // Match "H:MM AM/PM" or "HH:MM AM/PM" (1 or 2 digit hour)
  const match = val.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (match) return {
    hh:  match[1], // keep as-is, padStart handled in emit
    mm:  match[2],
    mer: match[3].toUpperCase() as "AM" | "PM",
  };
  return { hh: "", mm: "", mer: defaultMer };
}

function emit(hh: string, mm: string, mer: "AM" | "PM", onChange: (v: string) => void) {
  // Accept 1 or 2 digit hour, but require exactly 2 digit minutes
  if (hh.length >= 1 && mm.length === 2) {
    const paddedHH = hh.padStart(2, "0");
    onChange(`${paddedHH}:${mm} ${mer}`);
  } else {
    onChange("");
  }
}

export default function TimeInput({ value, defaultMeridiem = "AM", onChange }: Props) {
  const parsed = parseValue(value, defaultMeridiem);
  const [hh,  setHh]  = useState(parsed.hh);
  const [mm,  setMm]  = useState(parsed.mm);
  const [mer, setMer] = useState<"AM" | "PM">(parsed.mer);

  useEffect(() => {
    const p = parseValue(value, defaultMeridiem);
    setHh(p.hh);
    setMm(p.mm);
    setMer(p.mer);
  }, [value]);

  const handleHH = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setHh(digits);
    emit(digits, mm, mer, onChange);
  };

  const handleMM = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setMm(digits);
    emit(hh, digits, mer, onChange);
  };

  const handleMer = (m: "AM" | "PM") => {
    setMer(m);
    emit(hh, mm, m, onChange);
  };

  const isComplete = hh.length >= 1 && mm.length === 2;

  return (
    <div className={`flex items-center border rounded overflow-hidden w-[120px]
      focus-within:ring-1 focus-within:ring-[#6C20CA] focus-within:border-[#6C20CA]
      ${isComplete ? "border-[#d1d5db]" : "border-[#d1d5db]"}`}
    >
      {/* HH */}
      <input
        type="text"
        inputMode="numeric"
        value={hh}
        onChange={(e) => handleHH(e.target.value)}
        placeholder="HH"
        maxLength={2}
        className="w-[28px] text-xs text-center px-1 py-1 outline-none bg-white placeholder:text-gray-400"
      />

      {/* Fixed colon */}
      <span className="text-xs text-gray-500 select-none">:</span>

      {/* MM */}
      <input
        type="text"
        inputMode="numeric"
        value={mm}
        onChange={(e) => handleMM(e.target.value)}
        placeholder="MM"
        maxLength={2}
        className="w-[28px] text-xs text-center px-1 py-1 outline-none bg-white placeholder:text-gray-400"
      />

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* AM/PM */}
      <select
        value={mer}
        onChange={(e) => handleMer(e.target.value as "AM" | "PM")}
        className="text-[11px] font-medium px-0.5 py-1 outline-none bg-white text-gray-600 cursor-pointer border-none appearance-none w-[30px]"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
