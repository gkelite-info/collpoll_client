"use client";

import { Suspense } from "react";
import WellbeingManagerDashboard from "./components/WellbeingManagerDashboard";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#F8F9FB] animate-pulse"></div>}>
      <WellbeingManagerDashboard />
    </Suspense>
  );
}
