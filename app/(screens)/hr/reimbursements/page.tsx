"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, CircleX, Clock3, Filter } from "lucide-react";
import { mockReimbursementRequests } from "./data/mockData";

const money = (value: string) => `₹${value.replace(/^[^0-9]*/, "")}`;
const stats = [
  { label: "Pending Approval", value: "18", note: "Requests awaiting your action", icon: Clock3, color: "#0876d8", bg: "#e8f2ff" },
  { label: "Approved Today", value: "7", note: "Requests approved today", icon: CheckCircle2, color: "#0c8a4b", bg: "#e4f6ec" },
  { label: "Rejected", value: "3", note: "Requests rejected today", icon: CircleX, color: "#d32f35", bg: "#fdebec" },
];

export default function ReimbursementDashboard() {
  return <main className="min-h-full w-full p-2 text-[#132238]">
    <header className="mb-5"><h1 className="text-2xl font-bold tracking-tight">Reimbursement Dashboard</h1><p className="mt-1 text-sm text-gray-500">Review and manage employee reimbursement requests</p></header>
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">{stats.map(({ label, value, note, icon: Icon, color, bg }) => <article key={label} className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} /><span className="inline-flex rounded-md p-2" style={{ color, backgroundColor: bg }}><Icon size={19} strokeWidth={3} /></span><p className="mt-3 text-xs font-medium text-gray-600">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="mt-2 text-xs text-gray-500">{note}</p></article>)}</section>
    <section className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 px-5 py-4"><div><h2 className="font-semibold">Approval Queue</h2><p className="mt-1 text-xs text-gray-500">List of reimbursement requests pending your approval</p></div><button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-[#edf4ff] px-4 py-2 text-xs font-medium"><Filter size={13} />Filter</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-[#edf3ff] text-[10px] uppercase tracking-wider text-gray-600"><tr><th className="px-5 py-3">Request ID</th><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Mail ID</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Submitted Date</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
      <tbody className="divide-y divide-gray-100">{mockReimbursementRequests.map((request) => <tr key={request.id} className="transition hover:bg-gray-50/70"><td className="px-5 py-4 text-xs font-semibold text-[#07904b]">{request.id}</td><td className="px-5 py-3"><div className="flex items-center gap-3"><img src={request.employeeAvatar} alt="" className="h-8 w-8 rounded-full object-cover" /><span className="font-medium">{request.employeeName}</span></div></td><td className="px-5 py-3 text-xs text-gray-600">{request.employeeEmail}</td><td className="px-5 py-3 font-medium">{money(request.amount)}</td><td className="px-5 py-3 text-xs text-gray-600">{request.submittedDate}</td><td className="px-5 py-3 text-right"><Link href={`/hr/reimbursements/${request.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#006bd6] hover:underline">View Details <ChevronRight size={14} /></Link></td></tr>)}</tbody></table></div>
      <footer className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-xs text-gray-500 sm:flex-row"><span>Showing 1 to 7 of 18 requests</span><div className="flex items-center gap-2"><button className="rounded border p-1.5"><ChevronLeft size={14} /></button><button className="rounded bg-[#43c17a] px-3 py-1.5 text-white">1</button><button className="rounded border px-3 py-1.5">2</button><button className="rounded border px-3 py-1.5">3</button><button className="rounded border p-1.5"><ChevronRight size={14} /></button></div></footer>
    </section>
  </main>;
}
