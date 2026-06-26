"use client";

import { useMemo, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { CampusVisitorsLogDashboard, EquipmentUsageHistory, SafetyVisitorsLogDashboard, VisitorsLogDashboard } from "./components";
import { NewVisitorEntryModal } from "./modals";
import type { VisitorEntry } from "./types";
import { visitorEntries } from "./visitor-data";

const isSportsCategory = (categoryName: string | null | undefined) =>
  categoryName?.toLowerCase().replace(/[^a-z]/g, "") === "sports";

const isSafetyCategory = (categoryName: string | null | undefined) => {
  const category = categoryName?.toLowerCase().replace(/[^a-z]/g, "");
  return category === "safetyandsecurity" || category === "safetysecurity";
};

const isAdministrationCategory = (categoryName: string | null | undefined) => {
  const category = categoryName?.toLowerCase().replace(/[^a-z]/g, "");
  return category === "administration" || category === "admin";
};

export default function VisitorsLogPage() {
  const { loading, userId, collegeId, wellBeingCategoryId, wellBeingCategoryIds, wellBeingCategoryName, wellBeingCategoryNames } = useUser();
  const [entries, setEntries] = useState(visitorEntries);
  const [search, setSearch] = useState("");
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<VisitorEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<VisitorEntry | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorEntry | null>(null);
  const categories = [wellBeingCategoryName, ...wellBeingCategoryNames];
  const assignedCategories = [
    { id: wellBeingCategoryId, name: wellBeingCategoryName },
    ...wellBeingCategoryNames.map((name, index) => ({ id: wellBeingCategoryIds[index], name })),
  ];
  const sportsCategoryId = assignedCategories.find(({ id, name }) => id && isSportsCategory(name))?.id;
  const sportsInventoryContext = useMemo(
    () => collegeId && sportsCategoryId
      ? { collegeId, categoryId: sportsCategoryId }
      : undefined,
    [collegeId, sportsCategoryId],
  );
  const campusVisitorContext = useMemo(
    () => collegeId && userId
      ? { collegeId, userId }
      : undefined,
    [collegeId, userId],
  );
  const isSports = categories.some(isSportsCategory);
  const isSafety = categories.some(isSafetyCategory);
  const isAdministration = categories.some(isAdministrationCategory);
  const canViewVisitorsLog = isSports || isSafety || isAdministration;

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(
      (entry) =>
        entry.student.toLowerCase().includes(query) ||
        entry.rollNo.toLowerCase().includes(query),
    );
  }, [entries, search]);

  if (loading) {
    return <main className="min-h-screen bg-[#F4F4F4] p-2" />;
  }

  if (!canViewVisitorsLog) {
    return (
      <main className="min-h-screen p-2">
        <section className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-[22px] font-extrabold text-[#16284F]">Visitors Log</h1>
          <p className="mt-2 text-[14px] font-semibold text-[#64748B]">
            Visitors Log is available only for Sports, Safety &amp; Security, and Administration wellbeing executives.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F4F4] p-2">
      {isAdministration ? (
        <CampusVisitorsLogDashboard variant="administration" visitorContext={campusVisitorContext} />
      ) : isSafety ? (
        <SafetyVisitorsLogDashboard visitorContext={campusVisitorContext} />
      ) : selectedVisitor ? (
        <EquipmentUsageHistory visitor={selectedVisitor} onBack={() => setSelectedVisitor(null)} />
      ) : (
        <VisitorsLogDashboard
          entries={filteredEntries}
          search={search}
          onSearchChange={setSearch}
          onNewEntry={() => setNewEntryOpen(true)}
          onView={setSelectedVisitor}
          onEdit={setEditEntry}
          onDelete={setDeleteEntry}
        />
      )}

      {isSports && newEntryOpen ? (
        <NewVisitorEntryModal
          inventoryContext={sportsInventoryContext}
          onClose={() => setNewEntryOpen(false)}
          onSave={() => setNewEntryOpen(false)}
        />
      ) : null}
      {isSports && editEntry ? (
        <NewVisitorEntryModal
          inventoryContext={sportsInventoryContext}
          onClose={() => setEditEntry(null)}
          onSave={() => setEditEntry(null)}
        />
      ) : null}
      {isSports ? (
        <ConfirmDeleteModal
          open={Boolean(deleteEntry)}
          title="Delete"
          name="entry"
          confirmText="Yes, Delete"
          onCancel={() => setDeleteEntry(null)}
          onConfirm={() => {
            if (!deleteEntry) return;
            setEntries((current) => current.filter((entry) => entry.id !== deleteEntry.id));
            setDeleteEntry(null);
          }}
          customDescription={deleteEntry ? (
            <>
              Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteEntry.student}</span>? This action cannot be undone.
            </>
          ) : undefined}
        />
      ) : null}
    </main>
  );
}
