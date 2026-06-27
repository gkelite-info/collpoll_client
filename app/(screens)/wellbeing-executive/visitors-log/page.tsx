"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import {
  deleteSportsRoomLog,
  fetchSportsRoomLogsPage,
  fetchSportsRoomLogSummary,
  mapSportsRoomLogToVisitorEntry,
} from "@/lib/helpers/visitors/sportsRoomLogsAPI";
import { CampusVisitorsLogDashboard, EquipmentUsageHistory, SafetyVisitorsLogDashboard, VisitorsLogDashboard } from "./components";
import { NewVisitorEntryModal } from "./modals";
import type { VisitorEntry } from "./types";

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

const SPORTS_LOGS_PAGE_SIZE = 10;

export default function VisitorsLogPage() {
  const { loading, userId, collegeId, wellBeingCategoryId, wellBeingCategoryIds, wellBeingCategoryName, wellBeingCategoryNames } = useUser();
  const [entries, setEntries] = useState<VisitorEntry[]>([]);
  const [sportsSummary, setSportsSummary] = useState({
    visitorsLog: 0,
    equipmentIssued: 0,
    returnedEquipment: 0,
    pendingReturns: 0,
  });
  const [isSportsLoading, setIsSportsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sportsPage, setSportsPage] = useState(1);
  const [sportsTotalCount, setSportsTotalCount] = useState(0);
  const [sportsEntryDate, setSportsEntryDate] = useState("");
  const [sportsReturnStatus, setSportsReturnStatus] = useState<"all" | "pending" | "returned">("all");
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

  const loadSportsEntries = useCallback(async () => {
    if (!collegeId || !isSports) return;

    try {
      setIsSportsLoading(true);
      const [logsResult, summary] = await Promise.all([
        fetchSportsRoomLogsPage({
          collegeId,
          page: sportsPage,
          limit: SPORTS_LOGS_PAGE_SIZE,
          search,
          entryDate: sportsEntryDate || undefined,
          returnStatus: sportsReturnStatus,
        }),
        fetchSportsRoomLogSummary(collegeId),
      ]);
      setSportsTotalCount(logsResult.count);
      setSportsSummary(summary);
      const totalPages = Math.max(1, Math.ceil(logsResult.count / SPORTS_LOGS_PAGE_SIZE));
      if (sportsPage > totalPages) {
        setSportsPage(totalPages);
        return;
      }

      setEntries(logsResult.data.map(mapSportsRoomLogToVisitorEntry));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load sports room visitors log.");
    } finally {
      setIsSportsLoading(false);
    }
  }, [collegeId, isSports, search, sportsEntryDate, sportsPage, sportsReturnStatus]);

  useEffect(() => {
    if (!loading) {
      void loadSportsEntries();
    }
  }, [loading, loadSportsEntries]);

  const handleSportsSearchChange = useCallback((value: string) => {
    setSearch(value);
    setSportsPage(1);
  }, []);

  const handleSportsEntryDateChange = useCallback((value: string) => {
    setSportsEntryDate(value);
    setSportsPage(1);
  }, []);

  const handleSportsReturnStatusChange = useCallback((value: "all" | "pending" | "returned") => {
    setSportsReturnStatus(value);
    setSportsPage(1);
  }, []);

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
          entries={entries}
          search={search}
          entryDate={sportsEntryDate}
          returnStatus={sportsReturnStatus}
          currentPage={sportsPage}
          itemsPerPage={SPORTS_LOGS_PAGE_SIZE}
          isLoading={isSportsLoading}
          totalCount={sportsTotalCount}
          summary={sportsSummary}
          onSearchChange={handleSportsSearchChange}
          onEntryDateChange={handleSportsEntryDateChange}
          onReturnStatusChange={handleSportsReturnStatusChange}
          onPageChange={setSportsPage}
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
          onSave={(savedEntry) => {
            setEntries((current) => [savedEntry, ...current.filter((entry) => entry.id !== savedEntry.id)]);
            setNewEntryOpen(false);
            void loadSportsEntries();
          }}
        />
      ) : null}
      {isSports && editEntry ? (
        <NewVisitorEntryModal
          inventoryContext={sportsInventoryContext}
          initialEntry={editEntry}
          onClose={() => setEditEntry(null)}
          onSave={(savedEntry) => {
            setEntries((current) => current.map((entry) => entry.id === savedEntry.id ? savedEntry : entry));
            setEditEntry(null);
            void loadSportsEntries();
          }}
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
            const activeCollegeId = deleteEntry.collegeId ?? collegeId;
            if (!activeCollegeId) {
              toast.error("College context is missing.");
              return;
            }
            deleteSportsRoomLog({
              sportsRoomLogId: deleteEntry.sportsRoomLogId ?? deleteEntry.id,
              collegeId: activeCollegeId,
            })
              .then(() => {
                setEntries((current) => current.filter((entry) => entry.id !== deleteEntry.id));
                setDeleteEntry(null);
                void loadSportsEntries();
                toast.success("Entry deleted.");
              })
              .catch((error) => {
                toast.error(error instanceof Error ? error.message : "Failed to delete entry.");
              });
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
