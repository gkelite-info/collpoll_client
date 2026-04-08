"use client";

import { useState, useEffect } from "react";

type Props = {
  value: string;
  defaultMeridiem?: "AM" | "PM";
  onChange: (val: string) => void;
};

function parseValue(val: string, defaultMer: "AM" | "PM") {
  if (!val) return { hh: "", mm: "", mer: defaultMer };
  const exactMatch = val.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (exactMatch)
    return {
      hh: exactMatch[1],
      mm: exactMatch[2],
      mer: exactMatch[3].toUpperCase() as "AM" | "PM",
    };

  const partial = val.trim().match(/^(\d{0,2}):?(\d{0,2})\s?(AM|PM)?/i);
  return {
    hh: partial?.[1] || "",
    mm: partial?.[2] || "",
    mer: (partial?.[3]?.toUpperCase() as "AM" | "PM") || defaultMer,
  };
}

function emit(
  hh: string,
  mm: string,
  mer: "AM" | "PM",
  onChange: (v: string) => void,
) {
  onChange(`${hh}:${mm} ${mer}`);
}

export default function TimeInput({
  value,
  defaultMeridiem = "AM",
  onChange,
}: Props) {
  const parsed = parseValue(value, defaultMeridiem);
  const [hh, setHh] = useState(parsed.hh);
  const [mm, setMm] = useState(parsed.mm);
  const [mer, setMer] = useState<"AM" | "PM">(parsed.mer);

  useEffect(() => {
    const p = parseValue(value, defaultMeridiem);
    setHh(p.hh);
    setMm(p.mm);
    setMer(p.mer);
  }, [value]);

  const handleHH = (raw: string) => {
    let digits = raw.replace(/\D/g, "").slice(0, 2);
    // STRCIT ACTIVE CAP: Instantly forces hours <= 12
    if (digits.length > 0 && parseInt(digits, 10) > 12) {
      digits = "12";
    }
    setHh(digits);
    emit(digits, mm, mer, onChange);
  };

  const handleMM = (raw: string) => {
    let digits = raw.replace(/\D/g, "").slice(0, 2);
    if (digits.length > 0 && parseInt(digits, 10) > 59) {
      digits = "59";
    }
    setMm(digits);
    emit(hh, digits, mer, onChange);
  };

  const handleMer = (m: "AM" | "PM") => {
    setMer(m);
    emit(hh, mm, m, onChange);
  };

  const isComplete = hh.length >= 1 && mm.length === 2;

  return (
    <div
      className={`flex items-center border rounded overflow-hidden w-fit shrink-0 bg-white
      focus-within:ring-1 focus-within:ring-[#6C20CA] focus-within:border-[#6C20CA]
      ${isComplete ? "border-[#d1d5db]" : "border-red-300"}`}
    >
      <input
        type="text"
        inputMode="numeric"
        value={hh}
        onChange={(e) => handleHH(e.target.value)}
        placeholder="HH"
        maxLength={2}
        className="w-[30px] text-xs text-center px-1 py-1.5 outline-none bg-white placeholder:text-gray-400"
      />

      <span className="text-xs text-gray-500 select-none pb-[2px]">:</span>

      <input
        type="text"
        inputMode="numeric"
        value={mm}
        onChange={(e) => handleMM(e.target.value)}
        placeholder="MM"
        maxLength={2}
        className="w-[30px] text-xs text-center px-1 py-1.5 outline-none bg-white placeholder:text-gray-400"
      />

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <select
        value={mer}
        onChange={(e) => handleMer(e.target.value as "AM" | "PM")}
        className="text-[11px] font-medium pl-0.5 pr-1 py-1.5 outline-none bg-white text-gray-600 cursor-pointer border-none appearance-none w-fit"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
