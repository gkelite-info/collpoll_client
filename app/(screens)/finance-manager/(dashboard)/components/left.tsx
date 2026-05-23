"use client";

import { useUser } from "@/app/utils/context/UserContext";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import {
  fetchFinanceManagerDashboardCards,
  formatFinanceManagerDashboardCards,
} from "@/lib/helpers/finance-manager/dashboard/FetchFinanceManagerDashboardCards";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FinanceBottomSection from "./FinanceBottomSection";
import FinanceChartsSection from "./FinanceChartsSection";
import FinanceManagerInfoCard from "./FinanceManagerInfoCard";
import FinanceSummaryCards from "./FinanceSummaryCards";

type SummaryCard = {
  label: string;
  value: string;
};

export default function FinanceManagerDashLeft() {
  const router = useRouter();
  const { fullName, gender } = useUser();
  const { collegeId, collegeEducationId, loading: financeManagerLoading } =
    useFinanceManager();
  const avatarImage = gender === "Female" ? undefined : "/male-f-m.png";
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>(
    formatFinanceManagerDashboardCards({
      totalRevenueCollected: 0,
      totalPendingFees: 0,
      totalStudents: 0,
      activeFinanceExecutives: 0,
    }),
  );

  useEffect(() => {
    let isMounted = true;

    const loadSummaryCards = async () => {
      if (financeManagerLoading) return;

      try {
        const stats = await fetchFinanceManagerDashboardCards(
          collegeId,
          collegeEducationId,
        );
        if (isMounted) {
          setSummaryCards(formatFinanceManagerDashboardCards(stats));
        }
      } catch {
        if (isMounted) {
          setSummaryCards(
            formatFinanceManagerDashboardCards({
              totalRevenueCollected: 0,
              totalPendingFees: 0,
              totalStudents: 0,
              activeFinanceExecutives: 0,
            }),
          );
        }
      }
    };

    loadSummaryCards();

    return () => {
      isMounted = false;
    };
  }, [collegeEducationId, collegeId, financeManagerLoading]);

  return (
    <div className="w-full md:w-[68%] lg:w-[68%] p-2 pb-7 lg:pb-5">
      <FinanceManagerInfoCard
        fullName={fullName}
        image={avatarImage}
        todayCollection={245000}
      />
      <FinanceSummaryCards
        cards={summaryCards}
        onRevenueClick={() => router.push("?view=total-revenue")}
        onPendingClick={() => router.push("?view=total-pending-fees")}
        onStudentsClick={() => router.push("?view=total-students")}
        onExecutivesClick={() => router.push("?view=active-managers")}
      />
      <FinanceChartsSection />
      <FinanceBottomSection />
    </div>
  );
}
