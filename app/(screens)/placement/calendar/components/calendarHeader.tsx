"use client";

import { Plus } from "@phosphor-icons/react";

type Props = {
  onAddClick: () => void;
};

export default function CalendarHeader({ onAddClick }: Props) {
  return (
    <button
      onClick={onAddClick}
      className="flex items-center gap-2 px-3 mb-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm text-sm font-medium"
    >
      <Plus size={18} weight="bold" />
      Add Event
    </button>
  );
}