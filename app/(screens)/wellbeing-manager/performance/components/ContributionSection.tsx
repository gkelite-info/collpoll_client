"use client";

import { useEffect, useState } from "react";

export default function ContributionSection() {
  const totalIssues = 128;
  const resolvedIssues = 44;
  const contributionShare = 34;

  const size = 140;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (contributionShare / 100) * circumference;

  const [offset, setOffset] = useState(circumference);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(targetOffset);
      setBarWidth(contributionShare);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetOffset, contributionShare]);

  return (
    <div className="flex flex-col gap-4 shrink-0">
      <h2 className="text-[18px] font-bold text-[#282828] mt-2 -mb-2">
        Contribution : <span className="text-[#43C17A]">Infrastructure</span>
      </h2>

      <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-8">

        <div className="relative w-[140px] h-[140px] flex items-center justify-center flex-shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#CBDAC9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#437E66"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[26px] font-extrabold text-[#16284F] leading-none mb-0.5">
              {resolvedIssues}
            </span>
            <span className="text-[10px] font-bold text-[#16284F] uppercase tracking-tight text-center px-4 leading-tight">
              Issues<br />Resolved
            </span>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col justify-center mt-2 sm:mt-0">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[32px] font-extrabold text-[#282828] leading-none">
              {totalIssues}
            </span>
            <span className="text-[14px] text-[#16284F] font-bold">Total Issues</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-[#437E66] h-2.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${barWidth}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[13px] font-bold">
            <span className="text-gray-500">Issues Resolved</span>
            <span className="text-[#16284F]">
              Contribution Share <span className="text-[#282828] ml-0.5 text-[14px]">{contributionShare}%</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}