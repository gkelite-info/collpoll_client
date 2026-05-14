"use client";

import { CalendarBlank } from "@phosphor-icons/react";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function CalendarToolbar({ activeTab, setActiveTab }: Props) {
  const isActive = activeTab === "All";

  return (
    <div className="flex w-fit rounded-t-[20px] bg-[#5252521C] px-6 pt-3">
      <button
        onClick={() => setActiveTab("All")}
        className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-all ${
          isActive
            ? "border-[#43C17A] text-[#43C17A]"
            : "border-transparent text-gray-400 hover:text-gray-600"
        }`}
      >
        <CalendarBlank size={18} weight={isActive ? "fill" : "bold"} />
        <span>All Scheduled</span>
      </button>
    </div>
  );
}
