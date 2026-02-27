"use client";

import { Suspense } from "react";
import FinanceDashLeft from "./components/left";
import FinanceDashRight from "./components/right";

export function DashboardContent() {
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
