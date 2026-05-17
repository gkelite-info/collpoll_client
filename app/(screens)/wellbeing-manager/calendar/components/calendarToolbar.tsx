"use client";

import {
  Calendar,
} from "@phosphor-icons/react";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function CalendarToolbar({
  activeTab,
  setActiveTab,
}: Props) {
  // Updated labels to match your request
  const tabs = [
    { label: "All Scheduled", value: "All", icon: Calendar },
  ];

  return (
    <div className="bg-[#5252521C] rounded-t-[20px] border-b border-gray-200 px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 overflow-x-auto w-full lg:w-auto hide-scrollbar"></div>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 text-sm font-semibold border-b-2 pb-2 transition-all duration-200 cursor-pointer ${isActive
                ? "border-[#43C17A] text-[#43C17A]"
                : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
          >
            <tab.icon
              size={20}
              weight={isActive ? "fill" : "bold"}
              className={isActive ? "text-[#43C17A]" : "text-gray-400"}
            />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}