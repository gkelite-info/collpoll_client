"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CollegeAdminDashLeft from "./components/left";
import CollegeAdminDashRight from "./components/right";

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
    <main className="flex w-full min-h-screen overflow-hidden pb-4">
      <CollegeAdminDashLeft />
      <CollegeAdminDashRight />
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
