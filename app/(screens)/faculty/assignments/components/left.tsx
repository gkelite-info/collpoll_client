"use client";

import {
  Users,
  User,
  CalendarBlank,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Total Students",
    value: 60,
    color: "bg-[#FFF1E2]",
    iconColor: "bg-[#FFB36D]",
    icon: <Users size={20} weight="fill" />,
  },
  {
    label: "Total Students Present",
    value: 50,
    color: "bg-[#E7F9ED]",
    iconColor: "bg-[#52C47D]",
    icon: <User size={20} weight="fill" />,
  },
  {
    label: "Total Students Absent",
    value: 10,
    color: "bg-[#FFE9E9]",
    iconColor: "bg-[#FF3B30]",
    icon: <User size={20} weight="fill" />,
  },
  {
    label: "Total Students on Leave",
    value: 10,
    color: "bg-[#E1F0FF]",
    iconColor: "bg-[#55A6FF]",
    icon: <User size={20} weight="fill" />,
  },
];

export const AssignmentsLeft = () => {
  return (
    <main className="w-[68%] p-2">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full p-4 bg-gray-50">
        //////
        <div className="bg-white rounded-2xl p-5 shadow-sm flex-[1.2] min-w-[320px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">January 2022</h3>
            <div className="flex gap-2 text-gray-400">
              <CaretLeft
                size={18}
                className="cursor-pointer hover:text-gray-600"
              />
              <CaretRight
                size={18}
                className="cursor-pointer hover:text-gray-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-400 uppercase">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
          <div className="grid grid-cols-7 gap-2 mt-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-10 bg-gradient-to-b from-[#52C47D] to-white/10 rounded-t-lg mb-1" />
              <span className="bg-[#52C47D] text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md">
                1
              </span>
            </div>
            {[2, 3, 4, "", 6, 7].map((d, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-end pb-1 text-gray-600 font-medium"
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
