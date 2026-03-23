import React from "react";
import { UserRegistrationData } from "../data";

interface TotalUsersCompareProps {
  data: UserRegistrationData[];
}

const TotalUsersCompare: React.FC<TotalUsersCompareProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <h2 className="text-[18px] font-bold text-[#2d2d2d]">
        Total User Registrations
      </h2>
      <div className="bg-[#fffdfd] rounded-xl p-4 shadow-sm border border-gray-100 h-[240px] flex flex-col">
        <p className="text-[12px] text-gray-500 mb-3 font-medium">
          Compare registrations across colleges
        </p>
        <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-14 text-[12px] font-bold text-[#1f2937] truncate">
                {item.name}
              </span>
              <div className="flex-1 bg-[#e9e9e9] h-[10px] rounded-full overflow-hidden">
                <div
                  className="bg-[#41c165] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-[12px] font-bold text-[#1f2937]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TotalUsersCompare;
