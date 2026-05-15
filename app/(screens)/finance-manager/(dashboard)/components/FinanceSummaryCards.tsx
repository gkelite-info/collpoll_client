"use client";

import CardComponent from "@/app/utils/card";
import {
  CurrencyInr,
  UsersThree,
  UserSound,
} from "@phosphor-icons/react";
import { financeSummaryCards } from "./data";

const summaryIcons = [
  <CurrencyInr key="revenue" size={22} weight="bold" />,
  <CurrencyInr key="pending" size={22} weight="bold" />,
  <UsersThree key="students" size={22} weight="fill" />,
  <UserSound key="executives" size={22} weight="fill" />,
];

export default function FinanceSummaryCards() {
  return (
    <section className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-4">
      {financeSummaryCards.map((card, index) => (
        <CardComponent
          key={card.label}
          style={`${card.style} w-full !h-[92px] py-3 [&>div:nth-of-type(2)]:!text-sm [&>span]:!text-xs`}
          textSize="text-sm"
          icon={summaryIcons[index]}
          value={card.value}
          label={card.label}
          iconBgColor={card.iconBgColor}
          iconColor={card.iconColor}
        />
      ))}
    </section>
  );
}
