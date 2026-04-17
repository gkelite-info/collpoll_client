"use client";

import { useSearchParams } from "next/navigation";
import StudentTabNavigation from "./components/StudentTabNavigation";
import AllClubsGrid from "./components/AllClubsGrid";
import MyClubView from "./components/MyClubView";

export default function StudentClubsClient() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";

  return (
    <main className="mt-8 rounded-3xl bg-white p-6 shadow-sm min-h-[80vh]">
      <div className="flex justify-center mb-12">
        <StudentTabNavigation currentTab={currentTab} />
      </div>

      <div className="animate-in fade-in duration-300">
        {currentTab === "all" ? (
          <AllClubsGrid />
        ) : (
          <MyClubView />
        )}
      </div>
    </main>
  );
}