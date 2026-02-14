"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import FinanceDashLeft from "./components/left";
import FinanceDashRight from "./components/right";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  // if (view === "branchWiseCollection") {
  //   return (
  //     <div className="w-full p-2">
  //       <BranchWiseCollection />
  //     </div>
  //   );
  // }

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
