"use client";

import FacultyDashLeft from "./components/left";
import FacultyDashRight from "./components/right";

export default function DashboardPage() {
  return (
    <>
      <main className="flex h-full min-h-0 w-full gap-0 overflow-hidden md:gap-1 lg:gap-0">
        <FacultyDashLeft />
        <FacultyDashRight />
      </main>
    </>
  );
}
