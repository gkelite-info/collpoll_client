"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ActiveManagersShimmer,
  FinanceManagerDashboardShimmer,
  ManagerFeeOverviewShimmer,
  MonthlyFeeCollectionShimmer,
  TotalPendingFeesShimmer,
  TotalRevenueShimmer,
  TotalStudentsShimmer,
} from "./components/FinanceDashboardShimmer";
import ActiveManagersView from "./components/ActiveManagersView";
import BranchWiseCollectionView from "../finance-analytics/components/BranchWiseCollectionView";
import {
  BranchWiseCollectionShimmer,
  YearWiseFeeCollectionShimmer,
} from "../finance-analytics/components/FinanceAnalyticsShimmer";
import FinanceManagerDashLeft from "./components/left";
import FinanceManagerDashRight from "./components/right";
import ManagerFeeOverviewView from "./components/ManagerFeeOverviewView";
import MonthlyFeeCollectionView from "./components/MonthlyFeeCollectionView";
import TotalPendingFeesView from "./components/TotalPendingFeesView";
import TotalRevenueCollectedView from "./components/TotalRevenueCollectedView";
import TotalStudentsOverviewView from "./components/TotalStudentsOverviewView";
import YearWiseFeeCollectionView from "../finance-analytics/components/YearWiseFeeCollectionView";
import { Loader } from "../../(student)/calendar/right/timetable";

function DashboardContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");
  const program = searchParams.get("program") || "B-Tech";
  const branch = searchParams.get("branch") || "CSE";

  return (
    <DashboardView
      key={`${currentView || "dashboard"}-${program}-${branch}`}
      currentView={currentView}
      program={program}
      branch={branch}
    />
  );
}

function DashboardView({
  currentView,
  program,
  branch,
}: {
  currentView: string | null;
  program: string;
  branch: string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 450);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (currentView === "total-revenue") {
    if (isLoading) {
      return <TotalRevenueShimmer />;
    }

    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
        <TotalRevenueCollectedView />
      </main>
    );
  }

  if (currentView === "total-pending-fees") {
    if (isLoading) {
      return <TotalPendingFeesShimmer />;
    }

    return (
      <main className="flex min-h-screen w-full items-stretch justify-between overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
        <div className="w-full md:w-[68%] lg:w-[68%]">
          <TotalPendingFeesView />
        </div>
        <FinanceManagerDashRight />
      </main>
    );
  }

  if (currentView === "total-students") {
    if (isLoading) {
      return <TotalStudentsShimmer />;
    }

    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
        <TotalStudentsOverviewView />
      </main>
    );
  }

  if (currentView === "active-managers") {
    if (isLoading) {
      return <ActiveManagersShimmer />;
    }

    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
        <ActiveManagersView />
      </main>
    );
  }

  if (currentView === "fee-collection-overview") {
    if (isLoading) {
      return <ManagerFeeOverviewShimmer />;
    }

    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
        <ManagerFeeOverviewView />
      </main>
    );
  }

  if (currentView === "monthly-fee-collection") {
    if (isLoading) {
      return <MonthlyFeeCollectionShimmer />;
    }

    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
        <MonthlyFeeCollectionView />
      </main>
    );
  }

  if (currentView === "revenue-branch-wise") {
    if (isLoading) {
      return <BranchWiseCollectionShimmer />;
    }

    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
        <BranchWiseCollectionView
          program={program}
          backHref="?view=total-revenue"
          yearWiseView="revenue-year-wise"
        />
      </main>
    );
  }

  if (currentView === "revenue-year-wise") {
    if (isLoading) {
      return <YearWiseFeeCollectionShimmer />;
    }

    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
        <YearWiseFeeCollectionView
          branch={branch}
          backHref={`?view=revenue-branch-wise&program=${encodeURIComponent(program)}`}
        />
      </main>
    );
  }

  if (isLoading) {
    return <FinanceManagerDashboardShimmer />;
  }

  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <FinanceManagerDashLeft />
      <FinanceManagerDashRight />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-10 text-black">
          <Loader />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
