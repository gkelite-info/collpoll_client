"use client";

import WellbeingExecutiveLeft from "./left";
import WellbeingExecutiveRight from "./right";
import DashboardShimmer from "./DashboardShimmer";
import { useUser } from "@/app/utils/context/UserContext";

export default function WellbeingExecutiveDashboard() {
  const { loading } = useUser();

  if (loading) {
    return <DashboardShimmer />;
  }

  return (
    <main className="flex min-h-full w-full gap-2 overflow-x-hidden pb-5">
      <WellbeingExecutiveLeft />
      <WellbeingExecutiveRight />
    </main>
  );
}
