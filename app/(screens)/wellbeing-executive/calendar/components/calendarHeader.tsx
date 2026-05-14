"use client";

import { Plus } from "@phosphor-icons/react";

type Props = {
  onAddClick: () => void;
};

export default function CalendarHeader({ onAddClick }: Props) {
  return (
    <button
      onClick={onAddClick}
      className="mb-2 flex h-10 items-center gap-1 rounded-xl bg-[#06C681] px-3 text-base text-white shadow-lg hover:bg-[#05b875] cursor-pointer"
    >
      <Plus size={20} weight="regular" />
      Add Event
    </button>
  );
}
