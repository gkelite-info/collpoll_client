"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminDashLeft from "./components/left";
import AdminDashRight from "./components/right";
import PendingApprovals from "./components/pendingApprovals";
import PendingUserRegistration from "./components/pendingUserRegistration";
import { Loader } from "../../(student)/calendar/right/timetable";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");
  const [showPendingFull, setShowPendingFull] = useState(false);

  if (currentView === "pending-registration") {
    return <PendingUserRegistration onBack={() => router.push("/admin")} />;
  }

  if (showPendingFull) {
    return <PendingApprovals onBack={() => setShowPendingFull(false)} />;
  }

  return (
    <main className="flex w-full min-h-screen">
      <AdminDashLeft onPendingFull={() => setShowPendingFull(true)} />
      <AdminDashRight />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="text-black p-10 flex items-center justify-center min-h-screen"><Loader /></div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
