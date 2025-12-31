"use client";

import { useState } from "react";
import AdminDashLeft from "./components/left";
import AdminDashRight from "./components/right";
import PendingApprovals from "./components/pendingApprovals";

export default function DashboardPage() {
  const [showPendingFull, setShowPendingFull] = useState(false);

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
