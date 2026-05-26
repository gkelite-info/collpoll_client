"use client";

import { useState } from "react";
import WellbeingExecutiveRight from "../components/WellbeingExecutiveRight";
import CategoryFilters from "./components/CategoryFilters";
import CategorySummary from "./components/CategorySummary";
import RecentIssuesTable from "./components/RecentIssuesTable";
import type { IssueScope } from "./types";

export default function CategoriesPage() {
  const [scope, setScope] = useState<IssueScope>("college");

  return (
    <main className="flex w-full flex-col gap-2 pb-3 lg:min-h-screen lg:flex-row">
      <section className="flex w-full flex-col gap-3 overflow-y-auto p-2 lg:w-[68%]">
        <CategoryFilters scope={scope} onScopeChange={setScope} />
        <CategorySummary />
        <RecentIssuesTable scope={scope} />
      </section>
      <WellbeingExecutiveRight />
    </main>
  );
}
