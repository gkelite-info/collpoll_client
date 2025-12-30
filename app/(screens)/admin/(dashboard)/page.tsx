"use client";

import AdminDashLeft from "./components/left";
import AdminDashRight from "./components/right";

export default function DashboardPage() {
  return (
    <>
      <main className="flex w-full min-h-screen">
        <AdminDashLeft />
        <AdminDashRight />
      </main>
    </>
  );
}
