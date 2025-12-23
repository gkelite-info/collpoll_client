"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface AttendanceSummaryProps {
  percentage: number;
}

export function AttendanceSummaryCard({ percentage }: AttendanceSummaryProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

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
    <div className="bg-white shadow:md p-4 rounded-xl">
      <h2 className="text:md font-bold text-[#333] mb-4 tracking-tight">
        Attendance Summary
      </h2>

      <div className="relative flex flex-col bg items-center">
        <div className="w-full max-w-[300px] aspect-2/1 relative">
          <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="gaugeGradient" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#4ABF08" />
                <stop offset="100%" stopColor="#A1D683" />
              </linearGradient>
            </defs>

            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#D9F9C3"
              strokeWidth="24"
              strokeLinecap="round"
            />

            <motion.path
              d="M 180 100 A 80 80 0 0 0 20 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="24"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: percentage / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-[-19] flex flex-col items-center justify-end pb-2">
            <div className="flex items-baseline leading-none">
              <motion.span className="text-3xl font-bold text-[#2D3139]">
                {rounded}
              </motion.span>
              <span className="text-3xl font-bold text-[#2D3139]">%</span>
            </div>
            <p className="text-3xl font-bold text-[#2D3139] mt-2">Attendance</p>
          </div>
        </div>

        <div className="flex gap-10 mt-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#D9F9C3]"></div>
            <span className="text-lg font-medium text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#4ABF08]"></div>
            <span className="text-lg font-medium text-gray-600">Present</span>
          </div>
        </div>
      </div>
    </div>
  );
}
