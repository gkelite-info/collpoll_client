"use client";

import { useMemo, useState } from "react";
import { List } from "@phosphor-icons/react";
import WellbeingExecutiveRight from "../components/WellbeingExecutiveRight";
import ContributionSection from "./components/ContributionSection";
import ExecutiveProfileCard from "./components/ExecutiveProfileCard";
import ExecutivesPanel from "./components/ExecutivesPanel";
import ResolvedIssuesList from "./components/ResolvedIssuesList";
import { executives } from "./data";

export default function PerformancePage() {
  const [selectedExecutiveId, setSelectedExecutiveId] = useState(1);
  const [month, setMonth] = useState("January");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const selectedExecutive = useMemo(
    () =>
      executives.find((executive) => executive.id === selectedExecutiveId) ||
      executives[0],
    [selectedExecutiveId],
  );

  const executivesSidebar = (
    <ExecutivesPanel
      selectedId={selectedExecutive.id}
      onSelect={(id) => {
        setSelectedExecutiveId(id);
        setIsMobileDrawerOpen(false);
      }}
    />
  );

  return (
    <main className="flex w-full flex-col gap-2 lg:min-h-screen lg:flex-row">
      <section className="flex min-h-0 w-full flex-col gap-4 overflow-y-auto p-2 lg:h-full lg:w-[68%]">
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-[#282828]">
              Performance
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#282828]">
              Monitor and track performance of well-being executives
            </p>
          </div>
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="rounded-lg border border-gray-200 bg-white p-2 text-[#16284F] shadow-sm lg:hidden"
          >
            <List size={22} weight="bold" />
          </button>
        </div>

        <ExecutiveProfileCard
          executive={selectedExecutive}
          month={month}
          onMonthChange={setMonth}
        />
        <ContributionSection executive={selectedExecutive} />
        <ResolvedIssuesList executive={selectedExecutive} />
      </section>

      <WellbeingExecutiveRight
        bounded
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        hideDefaultMobileContent
        showCalendar
        showHeaderCards={false}
        showCourseScheduleCard
      >
        {executivesSidebar}
      </WellbeingExecutiveRight>
    </main>
  );
}
