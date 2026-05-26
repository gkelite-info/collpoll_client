"use client";

import CardComponent from "@/app/utils/card";
import { UsersThree } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { leaveSummaryCards } from "../data";

const cardPalette: Record<
  string,
  { active: string; inactive: string; iconBg: string }
> = {
  total: {
    active: "bg-[#5C98FF]",
    inactive: "bg-[#EBF2FF]",
    iconBg: "#5C98FF",
  },
  approved: {
    active: "bg-[#48C37C]",
    inactive: "bg-[#E7F8EE]",
    iconBg: "#48C37C",
  },
  pending: {
    active: "bg-[#FFB874]",
    inactive: "bg-[#FFF4EB]",
    iconBg: "#FFB874",
  },
  rejected: {
    active: "bg-[#FF4242]",
    inactive: "bg-[#FFE5E5]",
    iconBg: "#FF4242",
  },
};

export default function LeaveSummaryCards() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") || "total";

  const handleCardClick = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status === "total") {
      params.delete("status");
    } else {
      params.set("status", status);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {leaveSummaryCards.map((card) => {
        const isActive = activeStatus === card.status;
        const palette = cardPalette[card.status];

        return (
          <CardComponent
            key={card.label}
            icon={<UsersThree size={20} weight="fill" />}
            value={card.value}
            label={card.label}
            isActive={isActive}
            iconColor="#FFFFFF"
            iconBgColor={
              isActive ? "rgba(255,255,255,0.2)" : palette.iconBg
            }
            style={`${isActive ? palette.active : palette.inactive} h-24 w-full rounded-sm shadow-sm transition-all duration-300`}
            textSize={isActive ? "text-white" : "text-[#282828]"}
            onClick={() => handleCardClick(card.status)}
          />
        );
      })}
    </section>
  );
}
