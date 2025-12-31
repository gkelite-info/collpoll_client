"use client";

import React, { useState } from "react";
import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyView from "./facultyView";
import UptimeChart, { UptimeDataPoint } from "./uptimeChart";
interface TotalUsersProps {
  onBack: () => void;

  onViewDetails?: (dept: string) => void;
}

const cardData: CardProps[] = [
  {
    value: "Active",
    label: "Server Status",
    bgColor: "bg-[#CEE6FF]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#60AEFF]",
    iconColor: "text-[#FFFFFF]",
  },
  {
    value: "1.2 Sec",
    label: "Response Time",
    bgColor: "bg-[#E6FBEA]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#43C17A]",
    iconColor: "text-[#FFFFFF]",
  },
  {
    value: "65% of 500GB",
    label: "Storage Usage",
    bgColor: "bg-[#FFEDDA]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FFBB70]",
    iconColor: "text-[#FFFFFF]",
  },
  {
    value: "99.8%",
    label: "API Uptime",
    bgColor: "bg-[#FFE0E0]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FF2020]",
    iconColor: "text-[#FFFFFF]",
  },
];

const mockData: UptimeDataPoint[] = [
  { date: "1 Nov", value: 58 },
  { date: "2 Nov", value: 78 },
  { date: "3 Nov", value: 66 },
  { date: "4 Nov", value: 74 },
  { date: "5 Nov", value: 71 },
  { date: "6 Nov", value: 64 },
  { date: "7 Nov", value: 63 },
  { date: "8 Nov", value: 72 },
  { date: "9 Nov", value: 72 },
];

const SystemHealth: React.FC<TotalUsersProps> = ({ onBack }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  if (selectedDept) {
    return (
      <FacultyView
        department={selectedDept}
        onBack={() => setSelectedDept(null)}
      />
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="mb-5">
        <div className="flex items-center gap-2 group w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer group-hover:-translate-x-1 transition-transform"
          />
          <h1 className="text-2xl font-bold text-[#282828]">System Health</h1>
        </div>
        <p className="text-[#282828] mt-2 ml-8 text-sm">
          Review and track current uptime and response time metrics.
        </p>
      </div>

      <article className="flex gap-3 justify-center items-center mb-4">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            value={item.value}
            label={item.label}
            bgColor={item.bgColor}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
          />
        ))}
      </article>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <UptimeChart data={mockData} />
      </div>
    </div>
  );
};

export default SystemHealth;
