"use client";

import { useMemo, useState } from "react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import TableShimmer from "@/app/utils/table/tableShimmer";
import {
  ClockCounterClockwise,
  CircleNotch,
  FunnelSimple,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { getStatus, statusClasses } from "../inventory-data";
import type { EquipmentItem, EquipmentStatus } from "../types";
import { EquipmentThumb } from "./EquipmentThumb";
import { StatCard } from "./StatCard";

type InventoryOverviewProps = {
  filteredItems: EquipmentItem[];
  overview: { total: number; inStock: number; lowStock: number; outOfStock: number };
  search: string;
  statusFilter: "all" | EquipmentStatus;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | EquipmentStatus) => void;
  onAdd: () => void;
  onHistory: (item: EquipmentItem) => void;
  onEdit: (item: EquipmentItem) => void;
  onDelete: (item: EquipmentItem) => void;
  title?: string;
  description?: string;
  addButtonLabel?: string;
  itemColumnLabel?: string;
  historyLoadingId?: string | null;
  deletingId?: string | null;
  isLoading?: boolean;
};

export function InventoryOverview({
  filteredItems,
  overview,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onAdd,
  onHistory,
  onEdit,
  onDelete,
  title = "Inventory Overview",
  description = "Track and manage all sports equipment and assets.",
  addButtonLabel = "Add New Equipment",
  itemColumnLabel = "Item Name",
  historyLoadingId = null,
  deletingId = null,
  isLoading = false,
}: InventoryOverviewProps) {
  const itemsPerPage = 10;
  const [availableSort, setAvailableSort] = useState<"none" | "asc" | "desc">("none");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sortedItems = useMemo(() => {
    if (availableSort === "none") return filteredItems;
    return [...filteredItems].sort((first, second) =>
      availableSort === "asc"
        ? first.available - second.available
        : second.available - first.available,
    );
  }, [availableSort, filteredItems]);
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(pageStart, pageStart + itemsPerPage);

  return (
    <section className="mx-auto max-w-[1180px] rounded-xl bg-white p-5 shadow-sm md:p-8">
      <div className="mb-8">
        <h1 className="text-[22px] font-extrabold text-[#16284F]">{title}</h1>
        <p className="mt-1 text-[13px] font-medium text-[#64748B]">{description}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Total Items" value={overview.total} tone="green" />
        <StatCard label="In Stock" value={overview.inStock} tone="blue" />
        <StatCard label="Low Stock" value={overview.lowStock} tone="orange" />
        <StatCard label="Out of Stock" value={overview.outOfStock} tone="red" />
      </div>

      <div className="mt-7 overflow-hidden rounded-xl border border-[#E8EEF5] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#E8EEF5] bg-white p-4 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={search} onChange={(event) => { setCurrentPage(1); onSearchChange(event.target.value); }} placeholder="Search equipment..." className="h-10 w-full rounded border border-[#E2E8F0] pl-10 pr-3 text-[13px] font-medium text-[#16284F] outline-none focus:border-[#43C17A]" />
          </label>
          <select value={statusFilter} onChange={(event) => { setCurrentPage(1); onStatusFilterChange(event.target.value as "all" | EquipmentStatus); }} className="h-10 cursor-pointer rounded border border-[#E2E8F0] bg-white px-4 text-[13px] font-semibold text-[#16284F] outline-none">
            <option value="all">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <div className="relative">
            <button type="button" onClick={() => setFiltersOpen((current) => !current)} aria-expanded={filtersOpen} className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded border border-[#E2E8F0] px-4 text-[13px] font-bold text-[#475569] hover:bg-[#F8FAFC] lg:w-auto">
              <FunnelSimple size={16} weight="bold" />
              {availableSort === "asc" ? "Available: Ascending" : availableSort === "desc" ? "Available: Descending" : "Filters"}
            </button>
            {filtersOpen ? (
              <div className="absolute right-0 top-11 z-20 min-w-[210px] overflow-hidden rounded-md border border-[#E2E8F0] bg-white py-1 shadow-lg">
                <p className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-[#94A3B8]">Available Quantity</p>
                {([
                  { value: "asc" as const, label: "Ascending (Low to High)" },
                  { value: "desc" as const, label: "Descending (High to Low)" },
                ]).map((option) => (
                  <button key={option.value} type="button" onClick={() => { setAvailableSort(option.value); setCurrentPage(1); setFiltersOpen(false); }} className={`block w-full cursor-pointer px-4 py-2.5 text-left text-[12px] font-semibold hover:bg-[#F8FAFC] ${availableSort === option.value ? "bg-[#EAF3FF] text-[#2563EB]" : "text-[#16284F]"}`}>
                    {option.label}
                  </button>
                ))}
                {availableSort !== "none" ? (
                  <button type="button" onClick={() => { setAvailableSort("none"); setCurrentPage(1); setFiltersOpen(false); }} className="block w-full cursor-pointer border-t border-[#E2E8F0] px-4 py-2.5 text-left text-[12px] font-semibold text-[#64748B] hover:bg-[#F8FAFC]">Clear sorting</button>
                ) : null}
              </div>
            ) : null}
          </div>
          <button type="button" onClick={onAdd} className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded bg-[#0F8A4B] px-5 text-[13px] font-bold text-white hover:bg-[#0B743F]">
            <Plus size={16} weight="bold" />
            {addButtonLabel}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#94A3B8]">
              <tr>
                <th className="px-5 py-5">{itemColumnLabel}</th><th className="px-5 py-5">Total Qty</th><th className="px-5 py-5">Available</th><th className="px-5 py-5">Status</th><th className="px-5 py-5">Last Updated</th><th className="px-5 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F7]">
              {isLoading ? <TableShimmer columnCount={6} rowCount={5} /> : paginatedItems.map((item) => {
                const status = getStatus(item);
                return (
                  <tr key={item.id} className="h-[74px] bg-white">
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><EquipmentThumb image={item.image} name={item.name} /><div className="min-w-0"><p className="max-w-[190px] text-[13px] font-extrabold leading-4 text-[#16284F]">{item.name}</p></div></div></td>
                    <td className="px-5 py-3 text-[13px] font-bold text-[#16284F]">{item.totalQty}</td>
                    <td className="px-5 py-3 text-[13px] font-bold text-[#16284F]">{item.available}</td>
                    <td className={`px-5 py-3 text-[12px] font-extrabold leading-4 ${statusClasses[status]}`}><span className="inline-flex items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full bg-current" /><span className="max-w-[72px] whitespace-normal">{status}</span></span></td>
                    <td className="px-5 py-3 text-[13px] font-semibold text-[#64748B]">{item.lastUpdated}</td>
                    <td className="px-5 py-3"><div className="flex items-center justify-center gap-4 text-[#94A3B8]">
                      <button type="button" onClick={() => onHistory(item)} disabled={historyLoadingId === item.id} className="cursor-pointer hover:text-[#16A85B] disabled:cursor-not-allowed disabled:opacity-60" title="Stock history">
                        {historyLoadingId === item.id ? <CircleNotch size={21} className="animate-spin" /> : <ClockCounterClockwise size={21} weight="bold" />}
                      </button>
                      <button type="button" onClick={() => onEdit(item)} className="cursor-pointer hover:text-[#16284F]" title="Edit"><PencilSimple size={20} weight="bold" /></button>
                      <button type="button" onClick={() => onDelete(item)} disabled={deletingId === item.id} className="cursor-pointer hover:text-[#FF2A2A] disabled:cursor-not-allowed disabled:opacity-60" title="Delete">
                        {deletingId === item.id ? <CircleNotch size={20} className="animate-spin" /> : <Trash size={20} weight="bold" />}
                      </button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading ? (
          <Pagination currentPage={visiblePage} totalItems={sortedItems.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        ) : null}
      </div>
    </section>
  );
}
