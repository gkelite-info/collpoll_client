"use client";

import { useTranslations } from "next-intl";
import { FaChevronRight } from "react-icons/fa6";

export default function AcademicPerformanceShimmer() {
  const t = useTranslations("Dashboard.student");

  // Recharts Y-axis ticks for shimmer
  const yTicks = [100, 75, 50, 25, 0];
  
  // Random heights for shimmer poles
  const heights = [70, 45, 80, 60];

  return (
    <div className="relative mx-auto h-full w-full max-w-6xl overflow-hidden rounded-lg bg-white px-2 pt-5 shadow-md">
      <div className="flex justify-between items-center pr-3 mb-6">
        <h2 className="ml-3 text-xl font-semibold text-[#282828] max-md:text-[17px] max-md:ml-1">
          {t("Academic Performance")}
        </h2>
        <FaChevronRight
          className="hidden max-md:block text-[#282828]"
          size={16}
        />
      </div>

      <div className="flex h-80 w-full items-end pb-8 max-md:h-72 max-md:px-0">
        {/* Y-axis mock */}
        <div className="flex h-full flex-col justify-between items-end pb-1 pr-2 text-[12px] text-[#888] max-md:text-[10px] w-12 max-md:w-10">
          {yTicks.map((tick) => (
            <span key={tick}>{tick}%</span>
          ))}
        </div>
        
        {/* X-axis and Bars mock */}
        <div className="relative flex h-full flex-1 items-end justify-around border-b border-[#666] pb-0">
          {heights.map((height, i) => (
            <div key={i} className="flex flex-col items-center justify-end h-full">
              {/* Bar mock */}
              <div 
                className="relative flex justify-center w-[50px] rounded-[10px] rounded-b-none bg-[rgba(233,245,230,0.7)] animate-pulse max-md:w-[28px] max-md:rounded-[6px] max-md:rounded-b-none pt-3 max-md:pt-1.5" 
                style={{ height: `${height}%` }}
              >
                <div className="absolute inset-0 w-full h-full rounded-[10px] rounded-b-none bg-gradient-to-b from-[#A8E089] to-[#9ACC7D] opacity-40 max-md:rounded-[6px] max-md:rounded-b-none"></div>
                {/* Value circle mock */}
                <div className="z-10 h-[23px] w-[23px] rounded-full bg-[#E8F6E2] max-md:h-[18px] max-md:w-[18px]"></div>
              </div>
              {/* X-axis tick mock */}
              <div className="absolute -bottom-6 h-3 w-10 rounded bg-gray-200 animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="w-4 max-md:w-2"></div>
      </div>
    </div>
  );
}
