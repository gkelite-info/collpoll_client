import React from "react";
import { Laptop } from "@phosphor-icons/react";

export interface TalkDetail {
  label: string;
  value: string;
}

export interface PrePlacementTalk {
  time: string;
  title: string;
  branch: string;
  details: TalkDetail[];
}

export interface PrePlacementTalksProps {
  talks: PrePlacementTalk[];
}

export const PrePlacementTalks: React.FC<PrePlacementTalksProps> = ({
  talks,
}) => {
  return (
    <div className="bg-white rounded-[12px] shadow-sm border border-gray-100/50 flex flex-col gap-3 p-2 h-[300px] overflow-y-auto snap-y snap-mandatory scrollbar-hide">
      {talks.map((talk, index) => (
        <div
          key={index}
          className="border border-green-100 rounded-lg overflow-hidden flex-shrink-0"
        >
          <div className="bg-[#E2F5E9] text-[#22C55E] px-3 py-1.5 flex items-center gap-2 font-medium text-[12px] border-b-[1.5px] border-dotted border-[#86EFAC]">
            <Laptop size={14} weight="fill" /> {talk.time}
          </div>
          <div className="p-3 bg-white">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="text-[#22C55E] font-medium text-[14px]">
                {talk.title}
              </h3>
              <span className="bg-[#22C55E] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                {talk.branch}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {talk.details.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-500 w-[110px]">{row.label}</span>
                  <span className="bg-[#F1F5F9] px-2 py-0.5 rounded-full font-medium text-gray-600 text-[10px]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <button className="bg-[#1D2B4A] text-white px-4 py-1.5 rounded-full text-[11px] font-semibold hover:bg-[#15213d] transition-colors">
                Join Meeting
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
