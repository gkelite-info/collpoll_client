"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BranchWiseCollectionView from "./components/BranchWiseCollectionView";
import FinanceAnalyticsShimmer, {
  BranchWiseCollectionShimmer,
  YearWiseFeeCollectionShimmer,
} from "./components/FinanceAnalyticsShimmer";
import FinanceAnalyticsView from "./components/FinanceAnalyticsView";
import YearWiseFeeCollectionView from "./components/YearWiseFeeCollectionView";

function FinanceAnalyticsContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");
  const program = searchParams.get("program") || "B-Tech";
  const branch = searchParams.get("branch") || "CSE";

  return (
    <FinanceAnalyticsRouteView
      key={`${currentView || "overview"}-${program}-${branch}`}
      currentView={currentView}
      program={program}
      branch={branch}
    />
  );
}

function FinanceAnalyticsRouteView({
  currentView,
  program,
  branch,
}: {
  currentView: string | null;
  program: string;
  branch: string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 450);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (isLoading && currentView === "year-wise") {
    return <YearWiseFeeCollectionShimmer />;
  }

  if (isLoading && currentView === "branch-wise") {
    return <BranchWiseCollectionShimmer />;
  }

  if (isLoading) {
    return <FinanceAnalyticsShimmer />;
  }

  if (currentView === "branch-wise") {
    return <BranchWiseCollectionView program={program} />;
  }

  if (currentView === "year-wise") {
    return <YearWiseFeeCollectionView branch={branch} />;
  }

  return <FinanceAnalyticsView />;
}

export default function Page() {
  return (
    <Suspense fallback={<FinanceAnalyticsShimmer />}>
      <FinanceAnalyticsContent />
    </Suspense>
  );
}
