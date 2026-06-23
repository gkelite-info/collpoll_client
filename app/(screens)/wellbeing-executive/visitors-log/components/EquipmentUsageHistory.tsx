"use client";

import { ArrowLeft, Cube, FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { usageRecords } from "../visitor-data";
import type { VisitorEntry } from "../types";
import { DataTable, type DataTableColumn } from "./DataTable";

export function EquipmentUsageHistory({ visitor, onBack }: { visitor: VisitorEntry; onBack: () => void }) {
  const columns: DataTableColumn[] = [
    { key: "date", label: "Date" },
    { key: "equipment", label: "Equipment" },
    { key: "quantity", label: "Qty" },
    { key: "purpose", label: "Purpose" },
    { key: "takenAt", label: "Taken At" },
    { key: "returnedAt", label: "Returned At" },
    { key: "status", label: "Status" },
  ];

  const rows = usageRecords.map((record) => ({
    date: <span className="font-semibold text-[#16284F]">{record.date}</span>,
    equipment: (
      <div className="flex items-center gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${record.equipment === "Basketball" ? "bg-[#FFF0DD] text-[#F97316]" : "bg-[#E8F1FF] text-[#3B82F6]"}`}><Cube size={15} weight="fill" /></span>
        <span className="font-extrabold text-[#16284F]">{record.equipment}</span>
      </div>
    ),
    quantity: <span className="font-semibold text-[#16284F]">{String(record.quantity).padStart(2, "0")}</span>,
    purpose: <span className="text-[#475569]">{record.purpose}</span>,
    takenAt: <span className="font-semibold text-[#16284F]">{record.takenAt}</span>,
    returnedAt: <span className="font-semibold text-[#16284F]">{record.returnedAt}</span>,
    status: <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${record.status === "Returned" ? "bg-[#DDFBE7] text-[#16A85B]" : "bg-[#FFF0DD] text-[#F97316]"}`}>{record.status}</span>,
  }));

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#DCE5EF] bg-white text-[#475569] hover:text-[#149447]" title="Back to visitors log"><ArrowLeft size={18} weight="bold" /></button>
        <div><h1 className="text-2xl font-extrabold text-[#1F2937]">Equipment Usage History</h1><p className="text-sm text-[#64748B]">Track all equipment previously borrowed by the selected student.</p></div>
      </div>

      <div className="grid gap-3 rounded-xl border border-[#E1E8F0] bg-white p-4 shadow-sm lg:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div className="flex items-center gap-3"><span className={`flex h-12 w-12 items-center justify-center rounded-lg text-xs font-bold ${visitor.avatarTone}`}>{visitor.initials}</span><div><p className="text-sm font-extrabold text-[#1F2937]">{visitor.student}</p><p className="text-xs text-[#64748B]">ID: {visitor.rollNo}</p><p className="text-xs text-[#64748B]">{visitor.course}</p></div></div>
        {[{ label: "Total Borrowed", value: "38", color: "text-[#149447]" }, { label: "Returned", value: "37", color: "text-[#16A85B]" }, { label: "Pending Returns", value: "01", color: "text-[#F97316]" }, { label: "Total Visits", value: "24", color: "text-[#1F2937]" }].map((metric) => <div key={metric.label} className="rounded-lg border border-[#E8EEF5] p-3"><p className="text-xs text-[#64748B]">{metric.label}</p><p className={`text-2xl font-extrabold ${metric.color}`}>{metric.value}</p></div>)}
      </div>

      <div className="rounded-xl border border-[#E1E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end"><label className="relative flex-1"><span className="mb-1 block text-xs font-extrabold uppercase text-[#475569]">Search Records</span><MagnifyingGlass size={15} className="absolute bottom-3 left-3 text-[#94A3B8]" /><input placeholder="Search by equipment..." className="h-10 w-full rounded-md border border-[#DCE5EF] pl-9 pr-3 text-sm outline-none focus:border-[#43C17A]" /></label><label className="w-full lg:w-[240px]"><span className="mb-1 block text-xs font-extrabold uppercase text-[#475569]">Status</span><select className="h-10 w-full rounded-md border border-[#DCE5EF] px-3 text-sm"><option>All Status</option><option>Returned</option><option>Pending</option></select></label><button className="flex h-10 w-10 items-center justify-center rounded-md border border-[#DCE5EF] text-[#64748B]"><FunnelSimple size={17} /></button></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E1E8F0] bg-white shadow-sm">
        <DataTable columns={columns} rows={rows} />
        <div className="flex flex-col gap-3 p-5 text-xs text-[#64748B] sm:flex-row sm:items-center sm:justify-between"><span>Showing 3 of 38 records</span><div className="flex gap-2"><button className="rounded border border-[#E2E8F0] px-3 py-2 text-[#94A3B8]">Previous</button><button className="h-8 w-8 rounded bg-[#16B979] font-bold text-white">1</button><button className="h-8 w-8 rounded border border-[#E2E8F0]">2</button><button className="h-8 w-8 rounded border border-[#E2E8F0]">3</button><button className="rounded border border-[#E2E8F0] px-3 py-2">Next</button></div></div>
      </div>
    </section>
  );
}
