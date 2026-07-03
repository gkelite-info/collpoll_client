"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnalyticsOverviewScreen } from "./components/AnalyticsOverviewScreen";
import { RevenueManagementScreen } from "./components/RevenueManagementScreen";
import { StudentFeesScreen } from "./components/StudentFeesScreen";

type AnalyticsView = "overview" | "revenue" | "studentFees";

function AccountantAnalyticsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const view: AnalyticsView =
    viewParam === "revenue" || viewParam === "studentFees"
      ? viewParam
      : "overview";

  const setView = (nextView: AnalyticsView) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "overview") {
      params.delete("view");
    } else {
      params.set("view", nextView);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  if (view === "studentFees") {
    return <StudentFeesScreen onBack={() => setView("revenue")} />;
  }

  if (view === "revenue") {
    return (
      <RevenueManagementScreen
        onOpenStudentFees={() => setView("studentFees")}
        onBack={() => setView("overview")}
      />
    );
  }

  return <AnalyticsOverviewScreen onOpenRevenue={() => setView("revenue")} />;
}

export default function AccountantAnalyticsPage() {
  return (
    <Suspense fallback={null}>
      <AccountantAnalyticsContent />
    </Suspense>
  );
}
