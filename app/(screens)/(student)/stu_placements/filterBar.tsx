"use client";

import { FaChevronDown } from "react-icons/fa6";

const placementCycles = ["2024", "2025", "2026"];
const eligibilityOptions = ["Eligible", "Not Eligible", "All"] as const;
const sortOptions = [
  "Recently Uploaded",
  "Oldest First",
  "Company Name",
] as const;

export type PlacementFilterBarProps = {
  cycle: string;
  eligibility: (typeof eligibilityOptions)[number];
  sortBy: (typeof sortOptions)[number];
  onCycleChange: (v: string) => void;
  onEligibilityChange: (v: (typeof eligibilityOptions)[number]) => void;
  onSortChange: (v: (typeof sortOptions)[number]) => void;
};

export function PlacementFilterBar({
  cycle,
  eligibility,
  sortBy,
  onCycleChange,
  onEligibilityChange,
  onSortChange,
}: PlacementFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-[#4B4B4B]">
      <div className="flex items-center gap-2">
        <span>Placement Cycle :</span>
        <div className="relative">
          <select
            className="h-9 rounded-md border border-gray-300 bg-[#F5F5F5] bg-none appearance-none px-3 pr-8 text-sm font-medium text-[#2B2B2B] focus:outline-none [&::-ms-expand]:hidden"
            value={cycle}
            onChange={(e) => onCycleChange(e.target.value)}
          >
            {placementCycles.map((cy) => (
              <option key={cy} value={cy}>
                {cy}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 text-xs">
            <FaChevronDown />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span>Eligibility :</span>
        <div className="relative">
          <select
            className="h-9 rounded-md border border-gray-300 bg-[#F5F5F5] bg-none appearance-none px-3 pr-8 text-sm font-medium text-[#2B2B2B] focus:outline-none [&::-ms-expand]:hidden"
            value={eligibility}
            onChange={(e) =>
              onEligibilityChange(
                e.target.value as (typeof eligibilityOptions)[number]
              )
            }
          >
            {eligibilityOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 text-xs">
            <FaChevronDown />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span>Sort By :</span>
        <div className="relative">
          <select
            className="h-9 rounded-md border border-gray-300 bg-[#F5F5F5] bg-none appearance-none px-3 pr-8 text-sm font-medium text-[#2B2B2B] focus:outline-none [&::-ms-expand]:hidden"
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as (typeof sortOptions)[number])
            }
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 text-xs">
            <FaChevronDown />
          </span>
        </div>
      </div>
    </div>
  );
}
