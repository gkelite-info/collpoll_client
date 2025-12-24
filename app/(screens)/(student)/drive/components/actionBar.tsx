"use client";

import { Plus, FunnelSimple, SortDescending } from "@phosphor-icons/react";

type Props = {
  sortBy: string;
  onSort: (val: string) => void;
  onNew: () => void;
  onFilters: () => void;
};

export default function ActionBar({ sortBy, onSort, onNew, onFilters }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onNew}
        className="flex h-6 items-center gap-2 rounded-lg bg-[#43C17A] px-2 text-sm font-medium text-white"
      >
        <Plus size={18} weight="bold" />
        <span>New</span>
      </button>

      <button
        onClick={onFilters}
        className="flex h-6 items-center gap-2 rounded-lg bg-[#43C17A14] px-2 text-sm font-medium text-[#43C17A]"
      >
        <FunnelSimple size={18} weight="bold" />
        <span>Filters</span>
      </button>

      <div className="flex h-6 items-center gap-2 rounded-lg bg-[#43C17A14] px-2 text-sm font-medium text-[#43C17A]">
        <SortDescending size={18} weight="bold" />
        <span>Sort by :</span>
        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value)}
          className="bg-transparent text-[#43C17A] focus:outline-none cursor-pointer"
        >
          <option value="latest">Latest</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>
      </div>
    </div>
  );
}
