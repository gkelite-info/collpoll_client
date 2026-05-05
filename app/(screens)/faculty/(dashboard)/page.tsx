"use client";

import FacultyDashLeft from "./components/left";
import FacultyDashRight from "./components/right";

export default function DashboardPage() {
  return (
    <>
      <main className="flex w-full min-h-screen gap-0 md:gap-1 lg:gap-0">
        <FacultyDashLeft />
        <FacultyDashRight />
      </main>
    </>
  );
}
