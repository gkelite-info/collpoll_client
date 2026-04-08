"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { ROLE_FILTERS } from "./types";

type Props = {
  activeRole: string | null;
  searchQuery: string;
  onRoleChange: (role: string | null) => void;
  onSearchChange: (q: string) => void;
};

export default function AttendanceFilters({
  activeRole,
  searchQuery,
  onRoleChange,
  onSearchChange,
}: Props) {
  return (
    <>
      {/* Role filter pills */}
      <div className="flex gap-1 flex-wrap mb-2">
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(activeRole === r ? null : r)}
            className={`text-xs font-medium px-3 py-1 rounded-full border cursor-pointer transition-colors
              ${
                activeRole === r
                  ? "bg-[#E8F8EF] text-[#22C55E] border-[#22C55E]"
                  : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#22C55E] hover:text-[#22C55E]"
              }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="w-full bg-[#EAEAEA] px-3 rounded-full flex items-center mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Name or ID"
          className="w-full p-2 outline-none text-sm bg-transparent text-[#282828] placeholder:text-[#6B7280]"
        />
        <MagnifyingGlass size={18} className="text-[#22C55E] flex-shrink-0" />
      </div>
    </>
  );
}
