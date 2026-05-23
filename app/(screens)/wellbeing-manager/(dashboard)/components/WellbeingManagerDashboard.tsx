"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import WellbeingManagerLeft from "./left";
import DashboardShimmer from "./DashboardShimmer";
import { useUser } from "@/app/utils/context/UserContext";
import AllIssuesView from "./AllIssuesViewNew";
import WellbeingRight from "../../components/WellbeingRight";
import TicketDetailsView from "../../new-issues/components/TicketDetailsView";
import DashboardAllIssueListView from "./DashboardAllIssueListView";

function DashboardRouteFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center text-sm font-semibold text-[#667085]">
      Loading issues...
    </div>
  );
}


export default function WellbeingManagerDashboard() {
  const { loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const ticketId = searchParams.get("ticketId");
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

  if (view === "issues") {
    return <AllIssuesView stage={stage} />;
  }

  if (view === "issue-list") {
    return (
      <Suspense fallback={<DashboardRouteFallback />}>
        <DashboardAllIssueListView stage={stage} />
      </Suspense>
    );
  }

  if (ticketId) {
    return (
      <TicketDetailsView
        ticketId={ticketId}
        onBack={() => router.push(pathname)}
      />
    );
  }

  return (
    <main className="flex min-h-full w-full overflow-x-hidden pb-5">
      <WellbeingManagerLeft />
      {stage >= 3 ? (
        // <WellbeingManagerRight />
        <WellbeingRight />
      ) : (
        <aside className="hidden w-[32%] flex-col p-2 pr-0 lg:flex lg:w-[32%]">
          <div className="h-[54px] animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-5 h-[170px] animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-5 h-[520px] animate-pulse rounded-lg bg-gray-200" />
        </aside>
      )}
    </main>
  );
}
