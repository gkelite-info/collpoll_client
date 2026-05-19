"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Announcements from "./components/Announcements";
import ClubHeader from "./components/ClubHeader";
import ClubInfo from "./components/ClubInfo";
import RequestsList from "./components/RequestsList";
import TabNavigation from "./components/TabNavigation";

function FinanceManagerClubContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "requests";
  const currentFilter = searchParams.get("filter") || "all";

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-2 md:p-2">
      <ClubHeader />
      <main className="mt-4 min-h-[50vh] rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-8 flex justify-center">
          <TabNavigation currentTab={currentTab} />
        </div>

        {currentTab === "requests" ? (
          <div className="mx-auto max-w-4xl animate-in fade-in duration-300">
            <ClubInfo />
            <RequestsList currentFilter={currentFilter} />
          </div>
        ) : (
          <div className="mx-auto max-w-4xl animate-in fade-in duration-300">
            <div className="relative mb-8 flex items-center justify-center">
              <div className="absolute w-full border-t border-[#959595]" />
              <span className="relative bg-white px-6 text-xs font-bold text-[#3B3B3B]">
                Today
              </span>
            </div>
            <Announcements />
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-[#282828]">Loading...</div>}>
      <FinanceManagerClubContent />
    </Suspense>
  );
}
