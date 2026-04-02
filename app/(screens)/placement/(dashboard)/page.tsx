"use client";

import { Suspense } from "react";
import FinanceDashLeft from "./components/left";
import FinanceDashRight from "./components/right";
import WipOverlay from "@/app/utils/WipOverlay";

export function DashboardContent() {
  return (
    <main className="relative overflow-hidden flex w-full min-h-screen pb-4">
      <WipOverlay fullHeight={true}/>
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
