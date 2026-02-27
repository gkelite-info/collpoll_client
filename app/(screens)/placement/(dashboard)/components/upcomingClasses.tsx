import React from "react";
import { DotsThreeVertical, Plus } from "@phosphor-icons/react";

export interface UpcomingClass {
  title: string;
  desc: string;
  time: string;
}

export interface UpcomingClassesProps {
  classes: UpcomingClass[];
}

export const UpcomingClasses: React.FC<UpcomingClassesProps> = ({
  classes,
}) => {
  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100/50 flex-grow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-bold text-[#1F2937]">
          Upcoming Classes
        </h2>
        <div className="flex items-center gap-2">
          <button className="bg-[#F1F5F9] p-1 rounded-full text-[#1D2B4A] hover:bg-gray-200 transition-colors">
            <Plus size={14} weight="bold" />
          </button>
          <button className="text-[#1D2B4A] hover:text-gray-600 transition-colors">
            <DotsThreeVertical size={20} weight="bold" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {classes.map((cls, idx) => (
          <div
            key={idx}
            className="bg-[#F1F5F9] rounded-r-md border-l-[3px] border-[#1D2B4A] p-3 relative"
          >
            <h3 className="font-bold text-[#1D2B4A] text-[13px]">
              {cls.title}
            </h3>
            <p className="text-[#64748B] text-[11px] mt-1 leading-[1.35] w-[85%]">
              {cls.desc}
            </p>
            <div className="absolute bottom-2 right-3 text-[#34D399] text-[10px] font-semibold">
              {cls.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
