"use client";

import {
  CalendarBlank,
  Cube,
  Eye,
  FunnelSimple,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
  UsersThree,
} from "@phosphor-icons/react";
import type { VisitorEntry } from "../types";
import { DataTable, type DataTableColumn } from "./DataTable";
import { SummaryCard } from "./SummaryCard";

type VisitorsLogDashboardProps = {
  entries: VisitorEntry[];
  search: string;
  onSearchChange: (value: string) => void;
  onNewEntry: () => void;
  onView: (entry: VisitorEntry) => void;
  onEdit: (entry: VisitorEntry) => void;
  onDelete: (entry: VisitorEntry) => void;
};

const summaryCards = [
  { label: "Visitors log", value: 142, tone: "bg-[#DDFBE7] text-[#22B86B]", icon: UsersThree },
  { label: "Equipment Issued", value: 98, tone: "bg-[#DDEBFF] text-[#3292F4]", icon: Cube },
  { label: "Returned equipment", value: 18, tone: "bg-[#FFEACD] text-[#FF9E3D]", icon: Cube },
  { label: "Pending Returns", value: 26, tone: "bg-[#FFE0E0] text-[#FF2530]", icon: Cube },
];

export function VisitorsLogDashboard({ entries, search, onSearchChange, onNewEntry, onView, onEdit, onDelete }: VisitorsLogDashboardProps) {
  const columns: DataTableColumn[] = [
    { key: "student", label: "Student" },
    { key: "rollNo", label: "Roll No." },
    { key: "takenAt", label: "Taken At" },
    { key: "equipment", label: "Equipment" },
    { key: "returnStatus", label: "Return Status" },
    { key: "returnedAt", label: "Returned At" },
    { key: "actions", label: "Actions", align: "center" },
  ];

  const rows = entries.map((entry) => ({
    student: (
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${entry.avatarTone}`}>{entry.initials}</span>
        <div><p className="font-extrabold text-[#16284F]">{entry.student}</p><p className="text-xs text-[#94A3B8]">{entry.course}</p></div>
      </div>
    ),
    rollNo: <span className="font-semibold">{entry.rollNo}</span>,
    takenAt: <span className="font-semibold">{entry.takenAt}</span>,
    equipment: (
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF3F8] text-[#16284F]"><Cube size={16} weight="fill" /></span>
        <div><p className="font-extrabold text-[#16284F]">{entry.equipment}</p><p className="text-xs text-[#94A3B8]">({entry.quantity})</p></div>
      </div>
    ),
    returnStatus: (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${entry.returnStatus === "Returned" ? "bg-[#E7FAEE] text-[#16A85B]" : "bg-[#FFF1DE] text-[#F97316]"}`}>
        {entry.returnStatus === "Returned" ? "✓" : "◷"}&nbsp; {entry.returnStatus}
      </span>
    ),
    returnedAt: <span className="font-semibold">{entry.returnedAt}</span>,
    actions: (
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => onView(entry)} title="View usage history" className="cursor-pointer text-[#94A3B8] hover:text-[#149447]">
          <Eye size={20} weight="bold" />
        </button>
        <button type="button" onClick={() => onEdit(entry)} title="Edit entry" className="cursor-pointer text-[#94A3B8] hover:text-[#149447]">
          <PencilSimple size={19} weight="bold" />
        </button>
        <button type="button" onClick={() => onDelete(entry)} title="Delete entry" className="cursor-pointer text-[#EF4444] hover:text-[#B91C1C]">
          <Trash size={19} weight="bold" />
        </button>
      </div>
    ),
  }));

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]">Sports Room Visitors Log</h1>
          <p className="mt-1 text-sm font-medium text-[#64748B]">Track all in/out entries and equipment issued from the sports room.</p>
        </div>
        <button type="button" onClick={onNewEntry} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-[#149447] px-6 text-sm font-bold text-white hover:bg-[#107D3C]">
          <Plus size={19} weight="bold" /> New Entry
        </button>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => <SummaryCard key={card.label} {...card} />)}
      </div>

      <div className="mt-7 overflow-hidden rounded-xl border border-[#DFE7F0] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E8EEF5] p-5 lg:flex-row lg:items-center">
          <h2 className="mr-auto text-lg font-extrabold text-[#1F2937]">Register Entries</h2>
          <label className="relative w-full lg:max-w-[320px]">
            <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search student or roll no..." className="h-10 w-full rounded-md border border-[#DCE5EF] pl-4 pr-10 text-sm text-[#334155] outline-none focus:border-[#43C17A]" />
            <MagnifyingGlass size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          </label>
          <button className="inline-flex h-10 min-w-[190px] items-center gap-3 rounded-md border border-[#DCE5EF] px-4 text-sm font-semibold text-[#334155]"><CalendarBlank size={16} />15 May 2025<span className="ml-auto text-[#94A3B8]">⌄</span></button>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#DCE5EF] px-4 text-sm font-semibold text-[#475569]"><FunnelSimple size={16} />Filter</button>
        </div>

        <DataTable columns={columns} rows={rows} minWidth="980px" />

        <div className="flex flex-col gap-3 p-5 text-xs font-medium text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
          <span>Showing 1 to {entries.length} of 18 entries</span>
          <div className="flex items-center gap-2"><button className="flex h-8 w-8 items-center justify-center rounded bg-[#149447] font-bold text-white">1</button>{[2, 3].map((page) => <button key={page} className="flex h-8 w-8 items-center justify-center rounded border border-[#E2E8F0]">{page}</button>)}<span>...</span><button className="flex h-8 w-8 items-center justify-center rounded border border-[#E2E8F0]">4</button><button className="flex h-8 w-8 items-center justify-center rounded border border-[#E2E8F0]">›</button></div>
        </div>
      </div>
    </section>
  );
}
