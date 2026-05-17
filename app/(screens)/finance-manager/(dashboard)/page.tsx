"use client";

import { Suspense } from "react";
import FinanceManagerDashLeft from "./components/left";
import FinanceManagerDashRight from "./components/right";
import { Loader } from "../../(student)/calendar/right/timetable";

function DashboardContent() {
  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <FinanceManagerDashLeft />
      <FinanceManagerDashRight />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-10 text-black">
          <Loader />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
