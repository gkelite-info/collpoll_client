"use client";

import { useSearchParams } from "next/navigation";
import FinanceOverview from "./FinanceOverview";
import FinanceEducationView from "./FinanceEducationView";

export default function FinanceEntry() {
  const sp = useSearchParams();
  const view = sp.get("view");

  if (view === "education") return <FinanceEducationView />;
  return <FinanceOverview />;
}
