"use client";

import { CheckCircle2, ChevronRight, IndianRupee, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { formatExactNumber } from "@/app/utils/numberFormat";
import { staticPayrollEmployees } from "../data";

const money = (value: number) => `₹${formatExactNumber(value)}`;

export default function AccountantPayrollQueue() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? staticPayrollEmployees.filter((row) => [row.name, row.email, row.employeeId, row.role].some((value) => value.toLowerCase().includes(term))) : staticPayrollEmployees;
  }, [search]);
  const rows = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const gross = rows.reduce((sum, row) => sum + row.grossEarnings, 0);
  const net = rows.reduce((sum, row) => sum + row.netPay, 0);
  const cards = [
    { label: "Paid Employees", value: filtered.length, note: "Completed salary payments", Icon: Users, color: "#6751e7", bg: "#eeeaff" },
    { label: "Gross Salary", value: money(gross), note: "Gross salary on this page", Icon: IndianRupee, color: "#f45112", bg: "#fff0e8" },
    { label: "Net Salary Paid", value: money(net), note: "Net payments on this page", Icon: CheckCircle2, color: "#16a34a", bg: "#e8f8ee" },
  ];
  return <div>
    <section className="grid gap-4 md:grid-cols-3">{cards.map(({ label, value, note, Icon, color, bg }) => <article key={label} className="relative overflow-hidden rounded-xl border border-[#e4e7eb] bg-white p-5 shadow-sm"><div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} /><div className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ color, backgroundColor: bg }}><Icon size={22} /></span><div><p className="text-xs text-[#657184]">{label}</p><p className="mt-1 text-xl font-bold">{value}</p><p className="mt-1 text-[10px] text-[#a0a8b5]">{note}</p></div></div></article>)}</section>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#e2e5e9] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold">Paid Salary List</h2><p className="mt-1 text-xs text-[#667386]">Static payroll UI preview</p></div><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, email or employee ID" className="h-10 w-full rounded-lg border border-[#dce3eb] bg-[#f8fafc] px-3 text-sm sm:w-72" /></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left"><thead className="bg-[#edf3ff] text-[10px] uppercase tracking-wider text-[#526071]"><tr>{["Employee", "Employee ID", "Role", "Payroll Month", "Monthly Salary", "Gross Pay", "Net Paid", "Status", "Action"].map((heading) => <th key={heading} className={`px-7 py-4 ${heading === "Action" ? "text-right" : ""}`}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#edf0f3]">{rows.map((row) => <tr key={row.payrollEntryId} className="hover:bg-[#f8fbf9]"><td className="px-7 py-5"><p className="text-sm font-semibold">{row.name}</p><p className="text-[10px] text-[#8492a6]">{row.email}</p></td><td className="px-7 py-5 text-xs text-[#596578]">{row.employeeId}</td><td className="px-7 py-5 text-xs text-[#596578]">{row.role}</td><td className="px-7 py-5 text-xs text-[#596578]">Jul 2026</td><td className="px-7 py-5 text-sm">{money(row.monthlySalary)}</td><td className="px-7 py-5 text-sm">{money(row.grossEarnings)}</td><td className="px-7 py-5 text-sm font-bold text-[#168a49]">{money(row.netPay)}</td><td className="px-7 py-5"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f8ee] px-2.5 py-1 text-xs font-semibold text-[#168a49]"><span className="h-1.5 w-1.5 rounded-full bg-[#20b15a]" />Paid</span></td><td className="px-7 py-5 text-right"><Link href={`/accountant/payroll/${row.payrollEntryId}`} className="inline-flex items-center whitespace-nowrap text-xs font-semibold text-[#0565ce]">View Details <ChevronRight size={14} /></Link></td></tr>)}</tbody></table></div>
      {rows.length === 0 && <div className="p-10 text-center text-sm text-[#667386]">No employees found.</div>}
      {filtered.length > 0 && <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setPage} roundedBottom="rounded-b-xl" alwaysShow />}
    </section>
  </div>;
}
