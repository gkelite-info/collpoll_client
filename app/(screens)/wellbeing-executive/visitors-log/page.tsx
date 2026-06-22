"use client";

import { useMemo, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { EquipmentUsageHistory, SafetyVisitorsLogDashboard, VisitorsLogDashboard } from "./components";
import { NewVisitorEntryModal } from "./modals";
import type { VisitorEntry } from "./types";
import { visitorEntries } from "./visitor-data";

const isSportsCategory = (categoryName: string | null | undefined) =>
  categoryName?.toLowerCase().replace(/[^a-z]/g, "") === "sports";

const isSafetyCategory = (categoryName: string | null | undefined) => {
  const category = categoryName?.toLowerCase().replace(/[^a-z]/g, "");
  return category === "safetyandsecurity" || category === "safetysecurity";
};

export default function VisitorsLogPage() {
  const { loading, wellBeingCategoryName, wellBeingCategoryNames } = useUser();
  const [search, setSearch] = useState("");
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorEntry | null>(null);
  const categories = [wellBeingCategoryName, ...wellBeingCategoryNames];
  const isSports = categories.some(isSportsCategory);
  const isSafety = categories.some(isSafetyCategory);
  const canViewVisitorsLog = isSports || isSafety;

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return visitorEntries;
    return visitorEntries.filter(
      (entry) =>
        entry.student.toLowerCase().includes(query) ||
        entry.rollNo.toLowerCase().includes(query),
    );
  }, [search]);

  if (loading) {
    return <main className="min-h-screen bg-[#F4F4F4] p-2" />;
  }

  if (!canViewVisitorsLog) {
    return (
      <main className="min-h-screen p-2">
        <section className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-[22px] font-extrabold text-[#16284F]">Visitors Log</h1>
          <p className="mt-2 text-[14px] font-semibold text-[#64748B]">
            Visitors Log is available only for Sports and Safety &amp; Security wellbeing executives.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F4F4] p-2">
      {isSafety ? (
        <SafetyVisitorsLogDashboard />
      ) : selectedVisitor ? (
        <EquipmentUsageHistory visitor={selectedVisitor} onBack={() => setSelectedVisitor(null)} />
      ) : (
        <VisitorsLogDashboard
          entries={filteredEntries}
          search={search}
          onSearchChange={setSearch}
          onNewEntry={() => setNewEntryOpen(true)}
          onView={setSelectedVisitor}
        />
      )}

      {isSports && newEntryOpen ? (
        <NewVisitorEntryModal
          onClose={() => setNewEntryOpen(false)}
          onSave={() => setNewEntryOpen(false)}
        />
      ) : null}
    </main>
  );
}
