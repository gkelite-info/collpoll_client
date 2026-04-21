import React from "react";
import { IconProps } from "@phosphor-icons/react";

export interface StatItem {
  title: string;
  value: string;
  bgColor: string;
  iconColor: string;
  Icon: React.ElementType<IconProps>;
  isSplitCard?: boolean;
  placed?: string;
  unplaced?: string;
}

export interface DashboardStatsProps {
  stats: StatItem[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="min-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex flex-col p-5 h-[120px] rounded-lg ${stat.bgColor} ${
              stat.isSplitCard ? "justify-start gap-2" : "justify-between"
            }`}
          >
            {stat.isSplitCard ? (
              <>
                {/* Top row: icon + Total label + value */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 aspect-square bg-white rounded-md flex items-center justify-center flex-shrink-0">
                    <stat.Icon size={20} weight="duotone" color={stat.iconColor} />
                  </div>
                  <span className="text-xs font-medium text-[#4B5563]">Total</span>
                  <span className="text-sm font-bold text-[#1F2937]">{stat.value}</span>
                </div>

                {/* Bottom row: Placed + Unplaced boxes */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-white rounded-md px-3 py-1.5 flex flex-col">
                    <span className="text-[10px] font-medium text-[#4B5563]">Placed</span>
                    <span className="text-sm font-bold" style={{ color: stat.iconColor }}>
                      {stat.placed}
                    </span>
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1.5 flex flex-col">
                    <span className="text-[10px] font-medium text-[#4B5563]">Unplaced</span>
                    <span className="text-sm font-bold" style={{ color: stat.iconColor }}>
                      {stat.unplaced}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 aspect-square bg-white rounded-md flex items-center justify-center">
                  <stat.Icon size={20} weight="duotone" color={stat.iconColor} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-[#1F2937] leading-none tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-medium text-[#4B5563]">{stat.title}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}