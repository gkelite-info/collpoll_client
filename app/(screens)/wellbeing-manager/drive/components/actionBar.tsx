"use client";

import { Plus, FunnelSimple, SortDescending } from "@phosphor-icons/react";

type Props = {
  sortBy: string;
  onSort: (val: string) => void;
  onNew: () => void;
  onFilters: () => void;
  isVisible?: boolean;
};

export default function ActionBar({ sortBy, onSort, onNew, onFilters, isVisible }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onNew}
        style={{ cursor: "pointer" }}
        className="flex h-8 items-center gap-2 rounded-lg bg-[#43C17A] px-3 text-sm font-medium text-white hover:bg-[#3aad6d] transition-colors"
      >
        <Plus size={18} weight="bold" />
        <span>New</span>
      </button>

      <div className="flex h-8 items-center gap-2 rounded-lg bg-[#43C17A14] px-3 text-sm font-medium text-[#43C17A] cursor-pointer">
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
