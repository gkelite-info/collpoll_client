"use client";

import WellbeingManagerLeft from "./left";
import WellbeingManagerRight from "./right";
import DashboardShimmer from "./DashboardShimmer";
import { useUser } from "@/app/utils/context/UserContext";

export default function WellbeingManagerDashboard() {
  const { loading } = useUser();

  if (loading) {
    return <DashboardShimmer />;
  }

  return (
    <main className="flex min-h-full w-full gap-2 overflow-x-hidden pb-5">
      <WellbeingManagerLeft />
      <WellbeingManagerRight />
    </main>
  );
}
