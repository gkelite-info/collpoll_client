"use client";

import AllClubsGrid from "./components/AllClubsGrid";

export default function CollegeAdminClubsClient() {
  return (
    <main className="mt-4 rounded-3xl bg-white p-6 shadow-sm min-h-[80vh]">
      <div className="animate-in fade-in duration-300">
          <AllClubsGrid />
      </div>
    </main>
  );
}