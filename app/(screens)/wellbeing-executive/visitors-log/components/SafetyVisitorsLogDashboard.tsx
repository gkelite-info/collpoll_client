"use client";

import { CaretDown, CheckCircle, ClipboardText, DownloadSimple, MapPin, MagnifyingGlass, Plus, UsersThree } from "@phosphor-icons/react";
import { useState } from "react";
import { AddCampusVisitorModal, type NewCampusVisitor } from "../modals/AddCampusVisitorModal";
import { DataTable, type DataTableColumn } from "./DataTable";
import { SummaryCard } from "./SummaryCard";

type CampusVisitorStatus = "Completed" | "Inside Campus" | "Pending Exit";
type CampusVisitorVariant = "safety" | "administration";
type CampusVisitor = { id: number; initials: string; tone: string; name: string; mobile: string; purpose: string; watchman: string; entryTime: string; status: CampusVisitorStatus };

const safetyVisitors: CampusVisitor[] = [
  { id: 1, initials: "RK", tone: "bg-[#E8ECF7] text-[#34425E]", name: "Rahul Kumar", mobile: "+91 XXXXX1234", purpose: "Admission Inquiry", watchman: "Ravi Kumar", entryTime: "10:00 AM", status: "Completed" },
  { id: 2, initials: "PS", tone: "bg-[#FFF0DF] text-[#F97316]", name: "Priya Sharma", mobile: "+91 XXXXX5678", purpose: "Parent Meeting", watchman: "Mahesh", entryTime: "11:15 AM", status: "Inside Campus" },
  { id: 3, initials: "KR", tone: "bg-[#FFE5E5] text-[#EF4444]", name: "Kiran Reddy", mobile: "+91 XXXXX7890", purpose: "Fee Enquiry", watchman: "Ravi Kumar", entryTime: "12:30 PM", status: "Pending Exit" },
];

const administrationVisitors: CampusVisitor[] = Array.from({ length: 8 }, (_, index) => ({
  ...safetyVisitors[index % safetyVisitors.length],
  id: index + 1,
}));

const cards = [
  { label: "Visitors Today", value: 128, tone: "bg-[#EEF3FB] text-[#16284F]", icon: UsersThree },
  { label: "Completed Visits", value: 102, tone: "bg-[#E6FAF1] text-[#18B978]", icon: CheckCircle },
  { label: "Currently Inside", value: 18, tone: "bg-[#FFF2E5] text-[#F97316]", icon: MapPin },
  { label: "Pending Exits", value: 8, tone: "bg-[#FFE9E9] text-[#EF4444]", icon: ClipboardText },
];

export function CampusVisitorsLogDashboard({ variant }: { variant: CampusVisitorVariant }) {
  const isAdministration = variant === "administration";
  const [visitors, setVisitors] = useState(() => isAdministration ? administrationVisitors : safetyVisitors);
  const [addVisitorOpen, setAddVisitorOpen] = useState(false);
  const columns: DataTableColumn[] = [
    { key: "visitor", label: "Visitor Name" },
    { key: "mobile", label: "Mobile Number" },
    { key: "purpose", label: "Purpose" },
    ...(!isAdministration ? [{ key: "watchman", label: "Watchman" }] : []),
    { key: "entryTime", label: "Entry Time" },
    { key: "status", label: "Status" },
  ];

  const updateStatus = (id: number, status: CampusVisitorStatus) => {
    setVisitors((current) => current.map((visitor) => visitor.id === id ? { ...visitor, status } : visitor));
  };

  const addVisitor = (visitor: NewCampusVisitor) => {
    const initials = visitor.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    setVisitors((current) => [{ id: Date.now(), initials, tone: "bg-[#E8ECF7] text-[#34425E]", name: visitor.name, mobile: visitor.mobile, purpose: visitor.purpose, watchman: "Unassigned", entryTime: visitor.entryTime, status: "Inside Campus" }, ...current]);
    setAddVisitorOpen(false);
  };

  const exportLogs = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(visitors.map((visitor) => ({ "Visitor Name": visitor.name, "Mobile Number": visitor.mobile, Purpose: visitor.purpose, ...(!isAdministration ? { Watchman: visitor.watchman } : {}), "Entry Time": visitor.entryTime, Status: visitor.status })));
    worksheet["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitor Logs");
    XLSX.writeFile(workbook, `visitor-logs-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const rows = visitors.map((visitor) => ({
    visitor: <div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${visitor.tone}`}>{visitor.initials}</span><span className="font-extrabold text-[#16284F]">{visitor.name}</span></div>,
    mobile: visitor.mobile,
    purpose: <span className="rounded border border-[#D7DFEC] bg-[#F3F6FA] px-2 py-1 text-xs">{visitor.purpose}</span>,
    watchman: visitor.watchman,
    entryTime: <span className="font-bold">{visitor.entryTime}</span>,
    status: <CampusVisitorStatusDropdown status={visitor.status} onChange={(status) => updateStatus(visitor.id, status)} />,
  }));

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#16284F]">Visitor Logs</h1><p className="mt-1 text-sm text-[#64748B]">Monitor and track all visitor entries recorded across the campus.</p></div>
        <div className="flex flex-wrap gap-3">
          {isAdministration ? <button type="button" onClick={() => setAddVisitorOpen(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#43C17A] px-5 text-sm font-bold text-white hover:bg-[#35A968]"><Plus size={16} weight="bold" />Add Visitor</button> : null}
          <button type="button" onClick={exportLogs} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#43C17A] px-5 text-sm font-bold text-white hover:bg-[#35A968]"><DownloadSimple size={16} weight="bold" />Export Logs</button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <SummaryCard key={card.label} {...card} />)}</div>
      <div className="mt-6 overflow-hidden rounded-lg border border-[#D7DFEC] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#D7DFEC] p-4 lg:flex-row lg:items-center"><label className="relative min-w-0 flex-1"><MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" /><input placeholder="Search visitor name" className="h-10 w-full rounded border border-[#D7DFEC] pl-10 pr-3 text-sm outline-none focus:border-[#43C17A]" /></label><span className="text-sm font-semibold text-[#475569]">Filters:</span><button className="h-10 cursor-pointer rounded border border-[#D7DFEC] bg-white px-4 text-sm text-[#34425E]">Today, 15 May</button><select className="h-10 cursor-pointer rounded border border-[#D7DFEC] bg-white px-4 text-sm text-[#34425E]"><option>All Watchmen</option><option>Ravi Kumar</option><option>Mahesh</option></select><select className="h-10 cursor-pointer rounded border border-[#D7DFEC] bg-white px-4 text-sm text-[#34425E]"><option>All Statuses</option><option>Completed</option><option>Inside Campus</option><option>Pending Exit</option></select></div>
        <DataTable columns={columns} rows={rows} minWidth="850px" />
        <div className="flex items-center justify-between border-t border-[#D7DFEC] px-5 py-4 text-xs text-[#64748B]"><span>Showing 1 to {visitors.length} of 128 entries</span><div className="flex items-center gap-2"><button className="h-8 w-8 cursor-pointer rounded bg-[#16284F] font-bold text-white">1</button><button className="h-8 w-8 cursor-pointer rounded">2</button><button className="h-8 w-8 cursor-pointer rounded">3</button><span>...</span><button className="h-8 w-8 cursor-pointer rounded">43</button><button className="h-8 w-8 cursor-pointer rounded">›</button></div></div>
      </div>
      {addVisitorOpen ? <AddCampusVisitorModal onClose={() => setAddVisitorOpen(false)} onSave={addVisitor} /> : null}
    </section>
  );
}

export function SafetyVisitorsLogDashboard() {
  return <CampusVisitorsLogDashboard variant="safety" />;
}

function CampusVisitorStatusDropdown({ status, onChange }: { status: CampusVisitorStatus; onChange: (status: CampusVisitorStatus) => void }) {
  const className = status === "Completed" ? "bg-[#E7FAEE] text-[#10A66A]" : status === "Inside Campus" ? "bg-[#FFF2E5] text-[#F97316]" : "bg-[#FFE9E9] text-[#EF4444]";
  return <div className={`relative inline-flex rounded-full ${className}`}><select value={status} onChange={(event) => onChange(event.target.value as CampusVisitorStatus)} aria-label="Visitor status" className="h-8 cursor-pointer appearance-none rounded-full bg-transparent py-1 pl-3 pr-8 text-xs font-extrabold outline-none"><option value="Completed">Completed</option><option value="Inside Campus">Inside Campus</option><option value="Pending Exit">Pending Exit</option></select><CaretDown size={12} weight="bold" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" /></div>;
}
