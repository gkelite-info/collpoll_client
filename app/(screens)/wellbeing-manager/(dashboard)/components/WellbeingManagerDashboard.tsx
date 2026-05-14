"use client";

import { useEffect, useState } from "react";
import WellbeingManagerLeft from "./left";
import WellbeingManagerRight from "./right";
import DashboardShimmer from "./DashboardShimmer";
import { useUser } from "@/app/utils/context/UserContext";

export default function WellbeingManagerDashboard() {
  const { loading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || loading) {
      return;
    }

    const timers = [1, 2, 3].map((nextStage) =>
      window.setTimeout(() => setStage(nextStage), nextStage * 180),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [loading, mounted]);

  if (!mounted || loading || stage === 0) {
    return <DashboardShimmer />;
  }

  return (
    <main className="flex min-h-full w-full gap-2 overflow-x-hidden pb-5">
      <WellbeingManagerLeft />
      {stage >= 3 ? (
        <WellbeingManagerRight />
      ) : (
        <aside className="hidden w-[32%] flex-col p-2 pr-0 md:flex lg:w-[32%]">
          <div className="h-[54px] animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-5 h-[170px] animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-5 h-[520px] animate-pulse rounded-lg bg-gray-200" />
        </aside>
      )}
    </main>
  );
}
