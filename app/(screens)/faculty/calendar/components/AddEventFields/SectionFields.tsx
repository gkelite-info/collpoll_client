"use client";

import React, { useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";

interface SectionFieldsProps {
  sectionIds: number[];
  setSectionIds: (ids: number[] | ((prev: number[]) => number[])) => void;
  sections: any[];
  isSectionOpen: boolean;
  setIsSectionOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  INPUT_HEIGHT: string;
}

const SectionFields: React.FC<SectionFieldsProps> = ({
  sectionIds,
  setSectionIds,
  sections,
  isSectionOpen,
  setIsSectionOpen,
  INPUT_HEIGHT,
}) => {
  const sectionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDropdownClose = (e: MouseEvent) => {
      if (isSectionOpen && sectionDropdownRef.current && !sectionDropdownRef.current.contains(e.target as Node)) {
        setIsSectionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDropdownClose);
    return () => document.removeEventListener("mousedown", handleDropdownClose);
  }, [isSectionOpen, setIsSectionOpen]);

  return (
    <div className="flex-1 min-w-0 relative" ref={sectionDropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Section <span className="text-red-500">*</span>
      </label>

      <div
        onClick={() => setIsSectionOpen((p) => !p)}
        className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] rounded-lg px-3 bg-white text-sm cursor-pointer flex items-center justify-between focus:ring-2 focus:ring-[#43C17A]`}
      >
        <span className={sectionIds.length ? "text-gray-900" : "text-gray-400"}>
          {sectionIds.length === 0
            ? "Select sections"
            : sections
                .filter((s) => sectionIds.includes(s.collegeSectionsId))
                .map((s) => s.collegeSections)
                .join(", ")}
        </span>

        <CaretDown
          size={16}
          weight="bold"
          className={`text-gray-400 transition-transform duration-200 ${isSectionOpen ? "rotate-180" : "rotate-0"}`}
        />
      </div>

      {isSectionOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
          {sections.map((s) => {
            const checked = sectionIds.includes(s.collegeSectionsId);
            return (
              <label key={s.collegeSectionsId} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setSectionIds((prev) =>
                      checked ? prev.filter((id) => id !== s.collegeSectionsId) : [...prev, s.collegeSectionsId]
                    );
                  }}
                  className="accent-emerald-500"
                />
                <span className="text-sm text-gray-700">{s.collegeSections}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SectionFields;
