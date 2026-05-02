"use client";

import { FaChevronDown } from "react-icons/fa6";

const eligibilityOptions = ["Eligible", "Not Eligible", "All"] as const;
const sortOptions = [
  "Recently Uploaded",
  "Oldest First",
  "Company Name A-Z",
  "Company Name Z-A",
  "CTC (High to Low)",
  "CTC (Low to High)",
] as const;

export type PlacementFilterBarProps = {
  cycle: string;
  cycles: string[];
  eligibility: (typeof eligibilityOptions)[number];
  sortBy: (typeof sortOptions)[number];
  isCycleLoading?: boolean;
  isEligibilityLoading?: boolean;
  isSortLoading?: boolean;
  onCycleChange: (v: string) => void;
  onCycleOpen?: () => void;
  onEligibilityChange: (v: (typeof eligibilityOptions)[number]) => void;
  onEligibilityOpen?: () => void;
  onSortChange: (v: (typeof sortOptions)[number]) => void;
  onSortOpen?: () => void;
};

export function PlacementFilterBar({
  cycle,
  cycles,
  eligibility,
  sortBy,
  isCycleLoading = false,
  isEligibilityLoading = false,
  isSortLoading = false,
  onCycleChange,
  onCycleOpen,
  onEligibilityChange,
  onEligibilityOpen,
  onSortChange,
  onSortOpen,
}: PlacementFilterBarProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-[#4B4B4B]">
      <div className="flex items-center gap-2">
        <span>Placement Cycle :</span>
        <div className="relative">
          <select
            className="h-9 cursor-pointer rounded-md border border-gray-300 bg-[#F5F5F5] bg-none appearance-none px-3 pr-8 text-sm font-medium text-[#2B2B2B] focus:outline-none [&::-ms-expand]:hidden"
            value={cycle}
            onPointerDown={onCycleOpen}
            onChange={(e) => onCycleChange(e.target.value)}
          >
            {cycles.map((cy) => (
              <option key={cy} value={cy} disabled={Number(cy) > currentYear}>
                {cy}
              </option>
            ))}
          </select>
          {isCycleLoading && (
            <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
          )}

          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 text-xs">
            <FaChevronDown />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span>Eligibility :</span>
        <div className="relative">
          <select
            className="h-9 cursor-pointer rounded-md border border-gray-300 bg-[#F5F5F5] bg-none appearance-none px-3 pr-8 text-sm font-medium text-[#2B2B2B] focus:outline-none [&::-ms-expand]:hidden"
            value={eligibility}
            onPointerDown={onEligibilityOpen}
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
          {isEligibilityLoading && (
            <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span>Sort By :</span>
        <div className="relative">
          <select
            className="h-9 cursor-pointer rounded-md border border-gray-300 bg-[#F5F5F5] bg-none appearance-none px-3 pr-8 text-sm font-medium text-[#2B2B2B] focus:outline-none [&::-ms-expand]:hidden"
            value={sortBy}
            onPointerDown={onSortOpen}
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
          {isSortLoading && (
            <span className="absolute inset-x-2 bottom-0 h-0.5 animate-pulse rounded-full bg-[#43C17A]" />
          )}
        </div>
      </div>
    </div>
  );
}
