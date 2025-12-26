"use client";

import FacultyDashLeft from "./components/left";
import FacultyDashRight from "./components/right";

export default function DashboardPage() {
  return (
    <>
      <main className="flex w-full min-h-screen">
        <FacultyDashLeft />
        <FacultyDashRight />
      </main>
    </>
  );
}
