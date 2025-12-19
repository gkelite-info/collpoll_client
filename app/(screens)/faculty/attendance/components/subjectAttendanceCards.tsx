"use client";

import { ChalkboardIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubjectAttendanceCards({
  summary,
  active,
  onChange,
}: {
  summary: {
    totalClasses: number;
    attended: number;
    absent: number;
    leave: number;
  };
  active: "ALL" | "Present" | "Absent" | "Leave";
  onChange: (v: "ALL" | "Present" | "Absent" | "Leave") => void;
}) {
  const cards = [
    {
      label: "Total Classes",
      value: summary.totalClasses,
      key: "ALL",
      bgColor: "bg-[#EBE9FE]",
      iconBg: "bg-[#7C3AED]",
    },
    {
      label: "Attended",
      value: summary.attended,
      key: "Present",
      bgColor: "bg-[#E1F9E6]",
      iconBg: "bg-[#43C17A]",
    },
    {
      label: "Absent",
      value: summary.absent,
      key: "Absent",
      bgColor: "bg-[#FFE9E9]",
      iconBg: "bg-[#FF2020]",
    },
    {
      label: "Leave",
      value: summary.leave,
      key: "Leave",
      bgColor: "bg-[#E1EFFF]",
      iconBg: "bg-[#60AEFF]",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
      {cards.map((c) => (
        <motion.button
          key={c.key}
          onClick={() => onChange(c.key)}
          // Hover and Tap Effects
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative rounded-xl p-5 text-left transition-shadow flex flex-col items-start ${c.bgColor} shadow-sm`}
        >
          {/* Active Selection Ring (Animated) */}
          {active === c.key && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 border-2 border-gray-400/50 rounded-xl z-10 pointer-events-none"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}

          <div className={`${c.iconBg} p-1.5 rounded-sm mb-6 shadow-sm`}>
            <ChalkboardIcon size={20} weight="fill" className="text-white" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 leading-none mb-2"
          >
            {c.value}
          </motion.div>

          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {c.label}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
