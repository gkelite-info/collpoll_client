"use client";

import { ElementType } from "react";

interface FeeStatsProps {
  stats: {
    label: string;
    value: string;
    bg: string;
    iconColor: string;
    icon: ElementType;
  }[];
}

const FeeStats = ({ stats }: FeeStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className={`${stat.bg} rounded-lg p-5 flex flex-col justify-between min-h-[120px]`}
          >
            <div className="mb-4">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <Icon weight="fill" size={24} className={stat.iconColor} />
              </div>
            </div>

            <div>
              <h4 className="text-[#282828] font-bold text-xl mb-1">
                {stat.value}
              </h4>
              <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeeStats;
