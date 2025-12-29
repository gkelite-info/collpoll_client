import React from "react";
import {
  CalendarBlank,
  Confetti,
  ChalkboardTeacher,
  Exam,
  Island,
} from "@phosphor-icons/react";

interface CalendarToolbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { name: "All Scheduled", filterValue: "All", icon: CalendarBlank },
    { name: "Events", filterValue: "event", icon: Confetti },
    { name: "Classes", filterValue: "class", icon: ChalkboardTeacher },
    { name: "Exams", filterValue: "exam", icon: Exam },
    { name: "Holidays", filterValue: "holiday", icon: Island },
  ];

  return (
    <div className="bg-[#5252521C] rounded-t-[20px] border-b border-gray-200 px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 overflow-x-auto w-full lg:w-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.filterValue)}
            className={`flex items-center cursor-pointer gap-2 pb-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.filterValue
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon
              size={18}
              weight={activeTab === tab.filterValue ? "fill" : "regular"}
            />
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarToolbar;
