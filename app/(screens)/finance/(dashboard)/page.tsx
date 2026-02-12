"use client";

import { Suspense } from "react";
import FinanceDashLeft from "./components/left";
import FinanceDashRight from "./components/right";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";

export default function DashboardPage() {

  const { financeManagerId, userId, loading } = useFinanceManager();

  if (loading) {
    return null;
  }

  console.log("What is finance mana", financeManagerId, userId);

  return (
    <main className="flex w-full min-h-screen pb-4">
      <Suspense fallback={null}>
        <FinanceDashLeft />
      </Suspense>

      <FinanceDashRight />
    </main>
  );
}
