"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Cube, MagnifyingGlass } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import {
  fetchSportsRoomUsageHistory,
  type SportsRoomLogRow,
} from "@/lib/helpers/visitors/sportsRoomLogsAPI";
import { getInventoryImageUrl } from "@/lib/helpers/inventory/inventoryAssetAPI";
import type { ReturnStatus, UsageRecord, VisitorEntry } from "../types";
import { DataTable, type DataTableColumn } from "./DataTable";

type UsageMetric = {
  label: string;
  value: string;
  color: string;
};

const USAGE_HISTORY_PAGE_SIZE = 10;

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getEquipmentRows(log: SportsRoomLogRow) {
  const rows = log.sports_room_log_equipments;
  return Array.isArray(rows) ? rows : rows ? [rows] : [];
}

function getFirstRelated<T>(value: T[] | T | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function formatTimeWithoutSeconds(value: string | null) {
  return value ? value.slice(0, 5) : "-";
}

function buildUsageRecords(logs: SportsRoomLogRow[]): UsageRecord[] {
  return logs.flatMap((log) => {
    const equipmentRows = getEquipmentRows(log);
    if (!equipmentRows.length) {
      return [{
        date: formatDateLabel(log.entryDate),
        equipment: "No equipment",
        equipmentImageUrl: null,
        quantity: 0,
        purpose: log.purposeOfVisit,
        takenAt: formatTimeWithoutSeconds(log.entryTime),
        returnedAt: formatTimeWithoutSeconds(log.exitTime),
        status: log.exitTime ? "Returned" : "Pending",
      } satisfies UsageRecord];
    }

    return equipmentRows.map((equipment) => ({
      date: formatDateLabel(log.entryDate),
      equipment: getFirstRelated(equipment.inventory_assets)?.assetName ?? "Equipment",
      equipmentImageUrl: getInventoryImageUrl(getFirstRelated(equipment.inventory_assets)?.referenceImage ?? null),
      quantity: equipment.quantity,
      purpose: log.purposeOfVisit,
      takenAt: formatTimeWithoutSeconds(log.entryTime),
      returnedAt: formatTimeWithoutSeconds(log.exitTime),
      status: log.exitTime ? "Returned" : "Pending",
    } satisfies UsageRecord));
  });
}

export function EquipmentUsageHistory({ visitor, onBack }: { visitor: VisitorEntry; onBack: () => void }) {
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(visitor.collegeId && visitor.studentId));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);

  const loadUsageHistory = useCallback(() => {
    if (!visitor.collegeId || !visitor.studentId) return;

    let active = true;
    fetchSportsRoomUsageHistory({
      collegeId: visitor.collegeId,
      studentId: visitor.studentId,
      search,
      returnStatus: statusFilter === "All" ? "all" : statusFilter === "Returned" ? "returned" : "pending",
    })
      .then((logs) => {
        if (active) setRecords(buildUsageRecords(logs));
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Failed to load usage history.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [search, statusFilter, visitor.collegeId, visitor.studentId]);

  useEffect(() => {
    return loadUsageHistory();
  }, [loadUsageHistory]);

  const totalPages = Math.max(1, Math.ceil(records.length / USAGE_HISTORY_PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const startIndex = (visiblePage - 1) * USAGE_HISTORY_PAGE_SIZE;
    return records.slice(startIndex, startIndex + USAGE_HISTORY_PAGE_SIZE);
  }, [records, visiblePage]);

  const handleSearchChange = useCallback((value: string) => {
    setIsLoading(true);
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: ReturnStatus | "All") => {
    setIsLoading(true);
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const metrics: UsageMetric[] = useMemo(() => {
    const totalBorrowed = records.reduce((sum, record) => sum + record.quantity, 0);
    const returned = records.filter((record) => record.status === "Returned").reduce((sum, record) => sum + record.quantity, 0);
    const pending = records.filter((record) => record.status === "Pending").reduce((sum, record) => sum + record.quantity, 0);
    const totalVisits = new Set(records.map((record) => `${record.date}:${record.takenAt}`)).size;

    return [
      { label: "Total Borrowed", value: String(totalBorrowed).padStart(2, "0"), color: "text-[#149447]" },
      { label: "Returned", value: String(returned).padStart(2, "0"), color: "text-[#16A85B]" },
      { label: "Pending Returns", value: String(pending).padStart(2, "0"), color: "text-[#F97316]" },
      { label: "Total Visits", value: String(totalVisits).padStart(2, "0"), color: "text-[#1F2937]" },
    ];
  }, [records]);

  const columns: DataTableColumn[] = [
    { key: "date", label: "Date" },
    { key: "equipment", label: "Equipment" },
    { key: "quantity", label: "Qty" },
    { key: "purpose", label: "Purpose" },
    { key: "takenAt", label: "Taken At" },
    { key: "returnedAt", label: "Returned At" },
    { key: "status", label: "Status" },
  ];

  const rows = paginatedRecords.map((record) => ({
    date: <span className="font-semibold text-[#16284F]">{record.date}</span>,
    equipment: (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8F1FF] text-[#3B82F6]">
          {record.equipmentImageUrl ? (
            <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${record.equipmentImageUrl}")` }} />
          ) : (
            <Cube size={15} weight="fill" />
          )}
        </span>
        <span className="font-extrabold text-[#16284F]">{record.equipment}</span>
      </div>
    ),
    quantity: <span className="font-semibold text-[#16284F]">{String(record.quantity).padStart(2, "0")}</span>,
    purpose: <span className="text-[#475569]">{record.purpose}</span>,
    takenAt: <span className="font-semibold text-[#16284F]">{record.takenAt}</span>,
    returnedAt: <span className="font-semibold text-[#16284F]">{record.returnedAt}</span>,
    status: (
      <span className={`inline-flex h-8 min-w-[96px] items-center justify-center rounded-full px-4 text-center text-xs font-extrabold uppercase leading-none ${record.status === "Returned" ? "bg-[#DDFBE7] text-[#16A85B]" : "bg-[#FFF0DD] text-[#F97316]"}`}>
        {record.status}
      </span>
    ),
  }));

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#DCE5EF] bg-white text-[#475569] hover:text-[#149447]" title="Back to visitors log"><ArrowLeft size={18} weight="bold" /></button>
        <div><h1 className="text-2xl font-extrabold text-[#1F2937]">Equipment Usage History</h1><p className="text-sm text-[#64748B]">Track all equipment previously borrowed by the selected student.</p></div>
      </div>

      <div className="grid gap-3 rounded-xl border border-[#E1E8F0] bg-white p-4 shadow-sm lg:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div className="flex items-center gap-3"><span className={`flex h-12 w-12 items-center justify-center rounded-lg text-xs font-bold ${visitor.avatarTone}`}>{visitor.initials}</span><div><p className="text-sm font-extrabold text-[#1F2937]">{visitor.student}</p><p className="text-xs text-[#64748B]">ID: {visitor.rollNo}</p><p className="text-xs text-[#64748B]">{visitor.course}</p></div></div>
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-[#E8EEF5] p-3">
            <p className="text-xs text-[#64748B]">{metric.label}</p>
            {isLoading ? (
              <span className="mt-2 block h-8 w-14 animate-pulse rounded bg-[#E8EEF5]" />
            ) : (
              <p className={`text-2xl font-extrabold ${metric.color}`}>{metric.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E1E8F0] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#E8EEF5] p-4 lg:grid-cols-[1fr_260px] lg:items-end">
          <label className="relative">
            <span className="mb-1 block text-xs font-extrabold uppercase text-[#475569]">Search Records</span>
            <MagnifyingGlass size={15} className="absolute bottom-3 left-3 text-[#64748B]" />
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by equipment..."
              className="h-10 w-full rounded-md border border-[#DCE5EF] pl-9 pr-3 text-sm text-[#334155] outline-none placeholder:text-[#64748B] placeholder:opacity-100 focus:border-[#43C17A]"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-extrabold uppercase text-[#475569]">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => handleStatusFilterChange(event.target.value as ReturnStatus | "All")}
              className="h-10 w-full rounded-md border border-[#DCE5EF] px-3 text-sm font-semibold leading-10 text-[#334155] outline-none focus:border-[#43C17A]"
            >
              <option>All</option>
              <option>Pending</option>
              <option value="Returned">Received</option>
            </select>
          </label>
        </div>

        <DataTable columns={columns} rows={rows} isLoading={isLoading} emptyMessage="No Usage History" emptyDescription="Equipment usage records for this student will appear here." />
        <Pagination
          currentPage={visiblePage}
          totalItems={records.length}
          itemsPerPage={USAGE_HISTORY_PAGE_SIZE}
          onPageChange={setCurrentPage}
          roundedBottom="rounded-b-xl"
        />
      </div>
    </section>
  );
}
