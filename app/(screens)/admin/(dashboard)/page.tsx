"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminDashLeft from "./components/left";
import AdminDashRight from "./components/right";
import PendingApprovals from "./components/pendingApprovals";
import PendingUserRegistration from "./components/pendingUserRegistration";

export default function DashboardPage() {
  const [showPendingFull, setShowPendingFull] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  if (currentView === "pending-registration") {
    return (
      <main className="w-full min-h-screen">
        <PendingUserRegistration onBack={() => router.push("/admin")} />
      </main>
    );
  }

  if (showPendingFull) {
    return (
      <main className="w-full min-h-screen">
        <PendingApprovals onBack={() => setShowPendingFull(false)} />
      </main>
    );
  }

  return (
    <main className="flex w-full min-h-screen">
      <AdminDashLeft onPendingFull={() => setShowPendingFull(true)} />
      <AdminDashRight />
    </main>
  );
}
