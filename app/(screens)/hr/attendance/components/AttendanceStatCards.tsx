"use client";

import { UsersThree, User, Clock } from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";

type Props = {
  activeTab: string;
  totalCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  isLoading?: boolean;
  onTabChange: (tabId: string) => void;
};

export default function AttendanceStatCards({
  activeTab,
  totalCount,
  presentCount,
  absentCount,
  lateCount,
  leaveCount,
  isLoading,
  onTabChange,
}: Props) {
  const cards = [
    {
      id: "total",
      label: "Total Staff",
      value: totalCount,
      icon: <UsersThree size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#6C20CA]",
        inactiveBg: "bg-[#E2DAFF]",
        iconHex: "#6C20CA",
      },
    },
    {
      id: "present",
      label: "Present Today",
      value: presentCount,
      icon: <User size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#43C17A]",
        inactiveBg: "bg-[#E6FBEA]",
        iconHex: "#43C17A",
      },
    },
    {
      id: "absent",
      label: "Absent Today",
      value: absentCount,
      icon: <User size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#FF0000]",
        inactiveBg: "bg-[#FFE0E0]",
        iconHex: "#FF0000",
      },
    },
    {
      id: "late",
      label: "Late Check-ins",
      value: lateCount,
      icon: <Clock size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#60AEFF]",
        inactiveBg: "bg-[#CEE6FF]",
        iconHex: "#60AEFF",
      },
    },
    {
      id: "leave",
      label: "On Leave",
      value: leaveCount,
      icon: <User size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#FFBE61]",
        inactiveBg: "bg-[#FFEDDA]",
        iconHex: "#FFBE61",
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex gap-3 w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-1 h-[126px] rounded-xl bg-gray-200 animate-pulse relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 w-full">
      {cards.map((card) => {
        const isActive = activeTab === card.id;
        return (
          <div key={card.id} className="flex-1">
            <CardComponent
              style={`${isActive ? card.colors.activeBg : card.colors.inactiveBg} w-full shadow-none`}
              isActive={isActive}
              icon={card.icon}
              value={String(card.value).padStart(2, "0")}
              label={card.label}
              iconBgColor="#FFFFFF"
              iconColor={card.colors.iconHex}
              onClick={() => onTabChange(card.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
