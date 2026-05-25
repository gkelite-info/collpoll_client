"use client";

import { Plus } from "@phosphor-icons/react";

type Props = {
  onAddClick: () => void;
};

export default function CalendarHeader({ onAddClick }: Props) {
  return (
    <button
      onClick={onAddClick}
      className="mb-2 flex h-9 items-center gap-1 rounded-md bg-[#43C17A] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#39a868] active:scale-95 cursor-pointer"
    >
      <Plus size={18} weight="bold" />
      Add New
    </button>
  );
}
