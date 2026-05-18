"use client";

import CardComponent from "@/app/utils/card";
import {
  CurrencyInr,
  UserSound,
  UsersThree,
} from "@phosphor-icons/react";
import { financeSummaryCards } from "../../(dashboard)/components/data";

const summaryIcons = [
  <CurrencyInr key="revenue" size={22} weight="bold" />,
  <CurrencyInr key="pending" size={22} weight="bold" />,
  <UsersThree key="students" size={22} weight="fill" />,
  <UserSound key="managers" size={22} weight="fill" />,
];

export default function FinanceAnalyticsSummaryCards() {
  return (
    <section className="custom-scrollbar overflow-x-auto pb-2">
      <div className="grid min-w-[110%] grid-cols-4 gap-3">
        {financeSummaryCards.map((card, index) => (
          <CardComponent
            key={card.label}
            style={`${card.style} w-full !h-[108px] py-3 [&>div:first-child]:!mb-2 [&>div:nth-of-type(2)]:!text-md [&>span]:!text-sm [&>span]:!leading-tight`}
            textSize="text-sm"
            icon={summaryIcons[index]}
            value={card.value}
            label={index === 3 ? "Active Finance Managers" : card.label}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
          />
        ))}
      </div>
    </section>
  );
}
