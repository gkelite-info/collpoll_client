"use client";

import CardComponent from "@/app/utils/card";
import { CurrencyDollarSimple } from "@phosphor-icons/react";
import FinanceCharts from "./FinanceCharts";
import DetailedBreakdown from "./DetailedBreakdown";
import { useRouter, useSearchParams } from "next/navigation";
import FinanceEducationView from "./FinanceEducationView";


export default function FinanceOverview() {
  const router = useRouter();
  const sp = useSearchParams();
  const view = sp.get("view");

  const handleOpenEducation = (educationType: string) => {
    router.push(
      `/college-admin/institution-management?tab=finance&view=education&type=${encodeURIComponent(
        educationType
      )}`
    );
  };

  if (view === "education") {
    return <FinanceEducationView />;
  }
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 -mb-1">
        <CardComponent
          style="bg-[#E2DAFF] w-[183px] h-[127px] rounded-[8px] shadow-[0_3.79px_7.39px_rgba(0,0,0,0.05)]"
          icon={<CurrencyDollarSimple size={18} weight="fill" />}
          value="8.2 Cr"
          label="Total Expected"
          iconBgColor="#FFFFFF"
          iconColor="#7B61FF"
        />

        <CardComponent
          style="bg-[#FFEDDA] w-[183px] h-[127px] rounded-[8px] shadow-[0_3.79px_7.39px_rgba(0,0,0,0.05)]"
          icon={<CurrencyDollarSimple size={18} weight="fill" />}
          value="7.6 Cr"
          label="Collected Amount"
          iconBgColor="#FFFFFF"
          iconColor="#F59E0B"
        />

        <CardComponent
          style="bg-[#E6FBEA] w-[183px] h-[127px] rounded-[8px] shadow-[0_3.79px_7.39px_rgba(0,0,0,0.05)]"
          icon={<CurrencyDollarSimple size={18} weight="fill" />}
          value="0.6 Cr"
          label="Pending Amount"
          iconBgColor="#FFFFFF"
          iconColor="#22C55E"
        />

        <CardComponent
          style="bg-[#CEE6FF] w-[183px] h-[127px] rounded-[8px] shadow-[0_3.79px_7.39px_rgba(0,0,0,0.05)]"
          icon={<CurrencyDollarSimple size={18} weight="fill" />}
          value="3"
          label="Education Types"
          iconBgColor="#FFFFFF"
          iconColor="#3B82F6"
        />
      </div>
      <FinanceCharts />
      <DetailedBreakdown />
    </div>
  );
}
