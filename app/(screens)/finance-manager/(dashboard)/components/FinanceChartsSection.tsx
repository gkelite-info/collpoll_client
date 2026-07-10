"use client";

import { useRouter } from "next/navigation";
import ChartCard from "./ChartCard";
import FeeCollectionOverviewChart from "./FeeCollectionOverviewChart";
import MonthlyFeeCollectionChart from "./MonthlyFeeCollectionChart";

export default function FinanceChartsSection() {
  const router = useRouter();

  return (
    <section className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
      <FeeCollectionOverviewChart />
      <ChartCard
        title="Monthly Fee Collection"
        minWidth="min-w-[900px]"
        onViewClick={() => router.push("?view=monthly-fee-collection")}
        showDropdown
      >
        <MonthlyFeeCollectionChart />
      </ChartCard>
    </section>
  );
}
