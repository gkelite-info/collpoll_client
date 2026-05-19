"use client";

import CardComponent from "@/app/utils/card";
import { UsersThree } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { leaveSummaryCards } from "../data";

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
        const activeStyleByStatus: Record<string, string> = {
          approved: "bg-[#43C17A]",
          rejected: "bg-[#FF2020]",
        };
        const activeStyle = activeStyleByStatus[card.status] || card.style;

        return (
          <CardComponent
            key={card.label}
            icon={<UsersThree size={20} weight="fill" />}
            value={card.value}
            label={card.label}
            isActive={isActive}
            iconColor={card.iconColor}
            iconBgColor="#FFFFFF"
            style={`${isActive ? activeStyle : card.style} h-24 w-full rounded-sm shadow-sm`}
            textSize="text-sm"
            onClick={() => handleCardClick(card.status)}
          />
        );
      })}
    </section>
  );
}
