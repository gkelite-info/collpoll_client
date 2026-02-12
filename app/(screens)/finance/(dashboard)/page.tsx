"use client";

import { Suspense } from "react";
import FinanceDashLeft from "./components/left";
import FinanceDashRight from "./components/right";

export default function DashboardPage() {

  return (
    <main className="flex w-full min-h-screen pb-4">
      <Suspense fallback={null}>
        <FinanceDashLeft />
      </Suspense>

      <FinanceDashRight />
    </main>
  );
}
