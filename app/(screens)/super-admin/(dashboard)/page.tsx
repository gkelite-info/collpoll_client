"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DashLeft from "./components/left";
import DashRight from "./components/right";
import WipOverlay from "@/app/utils/WipOverlay";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return (
    <main className="relative overflow-hidden flex w-full min-h-screen pb-4">
      <WipOverlay fullHeight={true}/>
      <DashLeft />
      <DashRight />
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
