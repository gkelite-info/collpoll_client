"use client";

import FinanceDashLeft from "./components/left";
import FinanceDashRight from "./components/right";
import { useSearchParams } from "next/navigation";
import BranchWiseCollection from "./components/branchWiseCollection";
import YearWiseFeeCollection from "./components/yearWiseFeeCollection";
import { Suspense } from "react";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "branchWiseCollection") {
    return (
      <div className="w-full p-2">
        <BranchWiseCollection />
      </div>
    );
  }

  if (view === "yearWiseCollection") {
    return <YearWiseFeeCollection />;
  }

  return (
    <main className="flex w-full min-h-screen pb-4">
      <FinanceDashLeft />
      <FinanceDashRight />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
