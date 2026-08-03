"use client";

import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Article, CalendarBlank, CaretLeft, CaretRight, Eye, MagnifyingGlass, SquaresFour, Wallet } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatReimbursementAmount } from "@/lib/helpers/accountant/accountantReimbursementDashboardAPI";
import { useReimbursementTransactions } from "./useReimbursementTransactions";

const columns = [{ title: "TRANSACTION ID", key: "id" }, { title: "DATE", key: "date" }, { title: "CATEGORY", key: "category" }, { title: "TITLE", key: "title" }, { title: "AMOUNT", key: "amount" }, { title: "ACTIONS", key: "actions" }];
const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, loading, error } = useReimbursementTransactions();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const now = new Date();
  const categories = useMemo(() => [...new Set(transactions.map((row) => row.expenseCategory))].sort(), [transactions]);
  const filtered = useMemo(() => transactions.filter((row) => { const query = search.trim().toLocaleLowerCase("en-IN"); return (category === "all" || category === row.expenseCategory) && (!query || `${row.transactionId ?? ""} ${row.expenseTitle} ${row.expenseCategory} ${row.employeeName}`.toLocaleLowerCase("en-IN").includes(query)); }), [category, search, transactions]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)); const activePage = Math.min(page, pageCount); const pageRows = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const thisMonth = transactions.filter((row) => { const date = new Date(`${row.paymentDate}T00:00:00`); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); });
  const today = now.toLocaleDateString("en-CA");
  const stats = [
    { label: "TOTAL TRANSACTIONS", value: transactions.length.toLocaleString("en-IN"), icon: Wallet },
    { label: "THIS MONTH", value: thisMonth.length.toLocaleString("en-IN"), icon: CalendarBlank },
    { label: "TODAY'S TRANSACTIONS", value: transactions.filter((row) => row.paymentDate === today).length.toLocaleString("en-IN"), icon: Article },
    { label: "CATEGORIES", value: categories.length.toLocaleString("en-IN"), icon: SquaresFour },
  ];
  const breakdown = useMemo(() => { const counts = new Map<string, number>(); transactions.forEach((row) => counts.set(row.expenseCategory, (counts.get(row.expenseCategory) ?? 0) + 1)); return [...counts.entries()].map(([label, count]) => ({ label, count, percent: transactions.length ? (count / transactions.length) * 100 : 0 })).sort((a, b) => b.count - a.count); }, [transactions]);
  const tableData = pageRows.map((row) => ({
    id: <span className="text-[12px] font-bold text-[#147A3D]">{row.transactionId || `PAY-${row.employeeExpensePaymentId}`}</span>,
    date: <span className="text-[12px]">{new Date(`${row.paymentDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>,
    category: <span className="rounded-full bg-[#DFF3E7] px-2 py-1 text-[9px] font-bold text-[#147A3D]">{row.expenseCategory}</span>,
    title: <span className="text-[12px] font-semibold">{row.expenseTitle}</span>, amount: <span className="text-[12px] font-bold">{formatReimbursementAmount(row.amountSpent)}</span>,
    actions: <button onClick={() => router.push(`/accountant/reimbursement/${row.employeeExpenseReportId}`)} aria-label="View transaction"><Eye size={14} weight="bold" /></button>,
  }));

  return <main className="min-h-full w-full bg-[#F4F4F4] px-2 py-4 pb-8"><div className="mx-auto flex max-w-[1180px] flex-col gap-4">
    <div className="flex items-start gap-3"><button onClick={() => router.push("/accountant")} aria-label="Back" className="mt-1 flex h-8 w-8 items-center justify-center"><CaretLeft size={24} weight="bold" /></button><div><h1 className="text-2xl font-bold">Transactions</h1><p className="mt-1 text-[13px]">Completed employee reimbursement payments.</p></div></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((item) => <CardComponent key={item.label} icon={<item.icon size={18} weight="fill" />} value={<span className="flex flex-col"><span className="text-[10px] font-bold">{item.label}</span><span className="mt-1 text-[20px] font-bold text-[#17213D]">{item.value}</span></span>} label="" iconBgColor="#E4F2EA" iconColor="#237333" style="h-[118px] rounded-lg bg-white px-5 py-4 shadow" textSize="text-[#282828]" />)}</div>
    <section className="rounded-lg bg-white p-4 shadow"><div className="flex flex-wrap gap-3"><label className="flex h-10 min-w-[260px] flex-1 items-center gap-3 rounded-md bg-[#F0F2F4] px-4"><MagnifyingGlass size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} type="search" placeholder="Search transaction..." className="w-full bg-transparent text-[12px] outline-none" /></label><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-10 rounded-md bg-[#F0F2F4] px-4 text-[12px]"><option value="all">Category: All</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></div></section>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <section className="rounded-lg bg-white shadow"><TableComponent columns={columns} tableData={tableData} isLoading={loading} height="380px" stickyHeader={false} tableClassName="min-w-[860px]" emptyStateMessage="No completed reimbursement transactions found." /><div className="flex items-center justify-between px-5 pb-5 pt-3"><p className="text-[11px]">Showing {pageRows.length} of {filtered.length} transactions</p><div className="flex gap-2"><button disabled={activePage === 1} onClick={() => setPage((value) => value - 1)} className="flex h-8 w-8 items-center justify-center disabled:opacity-40"><CaretLeft size={14} /></button><span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-[#237333] px-2 text-white">{activePage}</span><button disabled={activePage === pageCount} onClick={() => setPage((value) => value + 1)} className="flex h-8 w-8 items-center justify-center disabled:opacity-40"><CaretRight size={14} /></button></div></div></section>
    <section className="rounded-lg bg-white p-5 shadow"><h2 className="text-[15px] font-bold">Category Breakdown</h2><p className="mt-1 text-[11px] text-[#525252]">Volume distribution by expense type</p><div className="mt-5 space-y-4">{breakdown.slice(0, 8).map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-[10px] font-bold"><span>{item.label}</span><span>{item.percent.toFixed(1)}%</span></div><div className="h-2 rounded-full bg-[#EEF1F4]"><div className="h-full rounded-full bg-[#237333]" style={{ width: `${item.percent}%` }} /></div></div>)}</div></section>
  </div></main>;
}
