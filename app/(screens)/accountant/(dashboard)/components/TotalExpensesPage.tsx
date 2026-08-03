"use client";

import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Article, CaretLeft, CaretRight, ChartBar, GridFour, MagnifyingGlass, Wallet } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatReimbursementAmount } from "@/lib/helpers/accountant/accountantReimbursementDashboardAPI";
import { useReimbursementTransactions } from "./useReimbursementTransactions";

const columns = [
  { title: "EXPENSE ID", key: "expenseId" },
  { title: "CATEGORY", key: "category" },
  { title: "EXPENSE NAME", key: "expenseName" },
  { title: "AMOUNT", key: "amount" },
  { title: "PAYMENT DATE", key: "date" },
  { title: "ACTIONS", key: "actions" },
];
const PAGE_SIZE = 10;
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function TotalExpensesPage() {
  const router = useRouter();
  const { transactions, loading, error } = useReimbursementTransactions();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const now = new Date();
  const filtered = useMemo(() => transactions.filter((row) => {
    const query = search.trim().toLocaleLowerCase("en-IN");
    return (category === "all" || row.expenseCategory === category) && (!query || `${row.expenseTitle} ${row.expenseCategory} ${row.transactionId ?? ""}`.toLocaleLowerCase("en-IN").includes(query));
  }), [category, search, transactions]);
  const categories = useMemo(() => [...new Set(transactions.map((row) => row.expenseCategory))].sort(), [transactions]);
  const total = transactions.reduce((sum, row) => sum + row.amountSpent, 0);
  const thisMonth = transactions.filter((row) => { const date = new Date(`${row.paymentDate}T00:00:00`); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }).reduce((sum, row) => sum + row.amountSpent, 0);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const stats = [
    { label: "Total Expenses", value: formatReimbursementAmount(total), icon: Wallet },
    { label: "This Month", value: formatReimbursementAmount(thisMonth), icon: ChartBar },
    { label: "Total Records", value: transactions.length.toLocaleString("en-IN"), icon: Article },
    { label: "Categories", value: categories.length.toLocaleString("en-IN"), icon: GridFour },
  ];
  const tableData = pageRows.map((row) => ({
    expenseId: <span className="text-[13px] font-medium">EXP{String(row.employeeExpenseReportId).padStart(4, "0")}</span>,
    category: <span className="inline-flex rounded-full bg-[#DFF3E7] px-3 py-1 text-[10px] font-bold text-[#147A3D]">{row.expenseCategory}</span>,
    expenseName: <span className="text-[13px] font-medium text-[#282828]">{row.expenseTitle}</span>,
    amount: <span className="text-[13px] font-bold text-[#17213D]">{formatReimbursementAmount(row.amountSpent)}</span>,
    date: <span className="text-[13px] font-medium">{formatDate(row.paymentDate)}</span>,
    actions: <button type="button" onClick={() => router.push(`/accountant/reimbursement/${row.employeeExpenseReportId}`)} className="h-8 cursor-pointer rounded-full border border-[#BFCDBE] bg-white px-4 text-[12px] font-medium text-[#282828]">View</button>,
  }));

  return <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-2 py-4 pb-8">
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
      <div className="flex items-start gap-3"><button type="button" aria-label="Back to accountant dashboard" onClick={() => router.push("/accountant")} className="mt-1 flex h-8 w-8 items-center justify-center text-[#17213D]"><CaretLeft size={24} weight="bold" /></button><div><h1 className="text-2xl font-bold text-[#282828]">Total Expenses</h1><p className="mt-1 text-[13px] font-medium text-[#525252]">Paid employee reimbursements recorded for this institution.</p></div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((item) => <CardComponent key={item.label} icon={<item.icon size={18} weight="fill" />} value={<span className="flex flex-col"><span className="text-[13px] font-medium text-[#525252]">{item.label}</span><span className="mt-1 text-[20px] font-bold text-[#282828]">{item.value}</span></span>} label="" iconBgColor="#E4F2EA" iconColor="#43C17A" style="h-[118px] rounded-xl bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.10)]" textSize="text-[#282828]" />)}</div>
      <section className="rounded-xl bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center gap-4"><label className="flex h-10 min-w-[280px] flex-1 items-center gap-3 rounded-full bg-[#F0F2F4] px-4 text-[#6B7280]"><MagnifyingGlass size={18} weight="bold" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} type="search" placeholder="Search expense..." className="w-full bg-transparent text-[13px] outline-none" /></label><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-10 rounded-full border border-[#CAD8C9] bg-white px-4 text-[12px]"><option value="all">All Categories</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></div></section>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <section className="rounded-xl bg-white shadow-sm"><h2 className="px-6 py-5 text-lg font-bold">Recent Expense Records</h2><TableComponent columns={columns} tableData={tableData} isLoading={loading} height="420px" stickyHeader={false} tableClassName="min-w-[850px]" emptyStateMessage="No paid employee expenses found." /><div className="flex items-center justify-between gap-3 px-6 pb-5 pt-2"><p className="text-[12px] text-[#525252]">Showing {filtered.length ? (activePage - 1) * PAGE_SIZE + 1 : 0}-{Math.min(activePage * PAGE_SIZE, filtered.length)} of {filtered.length} entries</p><div className="flex gap-2"><button disabled={activePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-40"><CaretLeft size={15} /></button><span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-[#237333] px-2 text-sm text-white">{activePage}</span><button disabled={activePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-40"><CaretRight size={15} /></button></div></div></section>
    </div>
  </main>;
}
