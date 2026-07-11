"use client";

/* eslint-disable @next/next/no-img-element -- local role avatars are intentionally rendered at their native size */

import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Filter, IndianRupee } from "lucide-react";
import { reimbursements } from "./data";

const stats = [
  { label: "Pending Payments", count: "18", amount: "₹1,25,430.00", note: "Awaiting payment processing", Icon: Clock3, color: "#6751e7", bg: "#eeeaff" },
  { label: "Paid This Month", count: "32", amount: "₹4,85,760.00", note: "Successfully paid", Icon: CheckCircle2, color: "#16a34a", bg: "#e8f8ee" },
  { label: "Total Amount", count: "₹6,80,940.00", amount: "", note: "Total reimbursed this month", Icon: IndianRupee, color: "#f45112", bg: "#fff0e8" },
];

export default function ReimbursementDashboard() {
  return <main className="min-h-full w-full bg-[#f4f4f4] p-3 text-[#142038] sm:p-5">
    <header className="mb-5"><h1 className="text-2xl font-bold">Finance Dashboard</h1><p className="mt-1 text-sm text-[#7c8798]">Overview of reimbursement payments and status</p></header>
    <section className="grid gap-4 md:grid-cols-3">{stats.map(({ label, count, amount, note, Icon, color, bg }) => <article key={label} className="relative overflow-hidden rounded-xl border border-[#e4e7eb] bg-white p-5 shadow-sm"><div className="absolute inset-x-0 top-0 h-1" style={{backgroundColor: color}}/><div className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{color, backgroundColor:bg}}><Icon size={22}/></span><div><p className="text-xs text-[#657184]">{label}</p><p className="mt-1 text-xl font-bold">{count}</p>{amount && <p className="mt-2 text-sm font-bold">{amount}</p>}<p className="mt-1 text-[10px] text-[#a0a8b5]">{note}</p></div></div></article>)}</section>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#e2e5e9] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 p-5"><div><h2 className="font-semibold">Approval Queue</h2><p className="mt-1 text-xs text-[#667386]">List of reimbursement requests pending your approval</p></div><button type="button" className="flex items-center gap-2 rounded-lg border border-[#cbd4df] bg-[#eef4fd] px-3 py-2 text-xs"><Filter size={13}/>Filter</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="bg-[#edf3ff] text-[10px] uppercase tracking-wider text-[#526071]"><tr><th className="px-5 py-3">Request ID</th><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Mail ID</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Submitted Date</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#edf0f3]">{reimbursements.map(r => <tr key={r.id} className="hover:bg-[#f8fbf9]"><td className="px-5 py-4 text-xs font-semibold text-[#12924f]">{r.id}</td><td className="px-5 py-3"><div className="flex items-center gap-2"><img src={r.avatar} alt="" className="h-8 w-8 rounded-full object-cover"/><span className="text-sm font-medium">{r.name}</span></div></td><td className="px-5 py-3 text-xs text-[#596578]">{r.email}</td><td className="px-5 py-3 text-sm font-medium">₹{r.amount}</td><td className="px-5 py-3 text-xs text-[#596578]">{r.submitted}</td><td className="px-5 py-3 text-right"><Link href={`/accountant/reimbursement/${r.id}`} className="inline-flex items-center text-xs font-semibold text-[#0565ce]">View Details <ChevronRight size={14}/></Link></td></tr>)}</tbody></table></div>
      <footer className="flex flex-col items-center justify-between gap-3 border-t p-4 text-xs text-[#596578] sm:flex-row"><span>Showing 1 to 7 of 18 requests</span><div className="flex items-center gap-2"><button className="rounded border p-1.5"><ChevronLeft size={13}/></button><button className="rounded bg-[#43c17a] px-3 py-1.5 text-white">1</button><button className="rounded border px-3 py-1.5">2</button><button className="rounded border px-3 py-1.5">3</button><button className="rounded border p-1.5"><ChevronRight size={13}/></button></div></footer>
    </section>
  </main>;
}
