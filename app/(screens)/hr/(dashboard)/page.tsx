"use client";

import HrDashLeft from "./components/left";
import HrDashRight from "./components/right";

export default function DashboardPage() {
  return (
    <>
      <main className="flex w-full min-h-screen">
        <HrDashLeft />
        <HrDashRight />
      </main>
    </>
  );
}
