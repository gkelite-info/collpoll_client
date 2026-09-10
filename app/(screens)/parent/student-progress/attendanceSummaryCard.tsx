"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslations } from "next-intl";

interface AttendanceSummaryProps {
  percentage: number;
}

export function AttendanceSummaryCard({ percentage }: AttendanceSummaryProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const t = useTranslations("Progress.parent");

  useEffect(() => {
    const controls = animate(count, percentage, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [percentage]);

  const radius = 80;
  const circumference = Math.PI * radius;
  return (
    <div>
      <h2 className="text-[16px] md:text-[28px] font-bold text-[#333] mb-4 md:mb-6 tracking-tight">
        {t("Attendance Summary")}
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[180px]">
        <div className="w-full max-w-[220px] md:max-w-[300px] aspect-[2/1] relative">
          <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#D9F9C3"
              strokeWidth="24"
              strokeLinecap="round"
            />

            <motion.path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#4ABF08"
              strokeWidth="24"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: percentage / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0 md:pb-2">
            <div className="flex items-baseline leading-none">
              <motion.span className="text-2xl md:text-3xl font-black text-[#2D3139]">
                {rounded}
              </motion.span>
              <span className="text-xl md:text-2xl font-bold text-[#2D3139]">
                %
              </span>
            </div>
            <p className="text-xs md:text-sm font-bold text-[#888] mt-1 uppercase tracking-widest">
              {t("Attendance")}
            </p>
          </div>
        </div>

        <div className="flex gap-6 md:gap-10 mt-6 md:mt-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#D9F9C3]"></div>
            <span className="text-[13px] md:text-[15px] font-bold text-gray-600">
              {t("Absent")}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#4ABF08]"></div>
            <span className="text-[13px] md:text-[15px] font-bold text-gray-600">
              {t("Present")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
