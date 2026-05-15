"use client";

import { useUser } from "@/app/utils/context/UserContext";
import FinanceBottomSection from "./FinanceBottomSection";
import FinanceChartsSection from "./FinanceChartsSection";
import FinanceManagerInfoCard from "./FinanceManagerInfoCard";
import FinanceSummaryCards from "./FinanceSummaryCards";

export default function FinanceManagerDashLeft() {
  const { fullName, gender } = useUser();
  const avatarImage = gender === "Female" ? undefined : "/male-f-m.png";

  return (
    <div className="w-full md:w-[68%] lg:w-[68%] p-2 pb-7 lg:pb-5">
      <FinanceManagerInfoCard
        fullName={fullName}
        image={avatarImage}
        todayCollection={245000}
      />
      <FinanceSummaryCards />
      <FinanceChartsSection />
      <FinanceBottomSection />
    </div>
  );
}
