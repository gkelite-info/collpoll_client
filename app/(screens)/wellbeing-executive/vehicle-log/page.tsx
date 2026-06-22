"use client";

import { useUser } from "@/app/utils/context/UserContext";
import { VehicleLogDashboard } from "./components";

const isSafetyCategory = (categoryName: string | null | undefined) => {
  const category = categoryName?.toLowerCase().replace(/[^a-z]/g, "");
  return category === "safetyandsecurity" || category === "safetysecurity";
};

export default function VehicleLogPage() {
  const { loading, wellBeingCategoryName, wellBeingCategoryNames } = useUser();
  const canViewVehicleLogs = [wellBeingCategoryName, ...wellBeingCategoryNames].some(isSafetyCategory);

  if (loading) return <main className="min-h-screen bg-[#F4F4F4] p-2" />;

  if (!canViewVehicleLogs) {
    return (
      <main className="min-h-screen p-2">
        <section className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#16284F]">Vehicle Logs</h1>
          <p className="mt-2 text-sm font-semibold text-[#64748B]">Vehicle Logs are available only for Safety &amp; Security wellbeing executives.</p>
        </section>
      </main>
    );
  }

  return <main className="min-h-screen bg-[#F4F4F4] p-2"><VehicleLogDashboard /></main>;
}
