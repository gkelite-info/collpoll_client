"use client";

import { Suspense } from "react"; 
import HrDashLeft from "./components/left";
import HrDashRight from "./components/right";

export default function DashboardPage() {
  return (
    <>      
      <Suspense fallback={<div>Loading...</div>}> 
        <main className="flex w-full min-h-screen">
          <HrDashLeft />
          <HrDashRight />
        </main>
      </Suspense>
    </>
  );
}