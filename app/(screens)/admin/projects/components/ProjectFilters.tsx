"use client";

import { CaretDown, Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";


export default function ProjectFilters() {
  const router = useRouter();
  return (
    <div className="mt-6 space-y-4">
      {/* Top Row */}
      <div className="flex items-center gap-6">
        {/* Add Project */}
        <button
          onClick={() => router.push("/admin/projects/add")}
          className="flex items-center gap-2 h-9 px-4 bg-[#43C17A] rounded-lg cursor-pointer"
        >
          <Plus size={16} color="#FFFFFF" weight="bold" />
          <span className="text-sm font-medium text-white">
            Add Project
          </span>
        </button>

        {/* Year */}
        <FilterSelect
          label="Year"
          value="2nd Year"
        />

        {/* Subject */}
        <FilterSelect
          label="Subject"
          value="DBMS Project"
        />

        {/* Status */}
        <FilterSelect
          label="Status"
          value="Completed"
        />
      </div>

      {/* Bottom helper text (optional like Opportunities) */}
      {/* <p className="text-sm font-medium text-[#43C17A]">
        Projects
      </p> */}
    </div>
  );
}

/* -------------------------------
   Reusable Filter Select
-------------------------------- */

function FilterSelect({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#5C5C5C]">
        {label}
      </span>

      <div className="flex items-center gap-1 h-9 px-4 rounded-full bg-[#43C17A1C] cursor-pointer">
        <span className="text-sm font-medium text-[#43C17A]">
          {value}
        </span>
        <CaretDown size={14} color="#43C17A" />
      </div>
    </div>
  );
}
