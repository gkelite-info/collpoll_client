"use client";

import { Warning } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { wellbeingCards } from "../data";
import CardComponent from "@/app/utils/card";

export default function TopCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "";

  const handleCardClick = (id: string) => {
    // If clicking the currently active tab, maybe unselect it to go back to the form?
    // Or just always navigate to it. The requirement implies clicking switches to list.
    const params = new URLSearchParams(searchParams);
    params.set("tab", id);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0 cursor-pointer">
      {wellbeingCards.map((card) => {
        const isActive = currentTab === card.id;
        
        return (
          <div key={card.id} onClick={() => handleCardClick(card.id)}>
            <CardComponent
              style={`h-28 w-full transition-all duration-200 hover:scale-105 ${
                isActive ? "shadow-md ring-2 ring-offset-2 ring-opacity-50" : "shadow-sm"
              }`}
              inlineStyle={{ 
                backgroundColor: isActive ? card.iconColor : card.bg,
                borderColor: isActive ? card.iconColor : "transparent",
              }}
              icon={
                <Warning
                  size={18}
                  weight="fill"
                  style={{ color: isActive ? card.iconColor : card.iconColor }}
                />
              }
              value={
                <span style={{ color: isActive ? "#FFFFFF" : card.iconColor }} className="font-bold">
                  {card.value}
                </span>
              }
              label={
                <span style={{ color: isActive ? "#FFFFFF" : "inherit" }}>
                  {card.label}
                </span>
              }
              iconBgColor="#FFFFFF"
              textSize="text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}
