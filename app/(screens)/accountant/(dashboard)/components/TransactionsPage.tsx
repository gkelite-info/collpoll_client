"use client";

import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { Article, CalendarBlank, CaretLeft, MagnifyingGlass, SquaresFour, Wallet } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAccountantRevenue } from "@/lib/helpers/accountant/accountantRevenueAPI";
import { ACCOUNTANT_CARD_VISUALS, parseAccountantExpenseDate } from "@/lib/helpers/accountant/accountantDashboardHelpers";
import { useAccountantExpenses } from "./useAccountantExpenses";
import { useUser } from "@/app/utils/context/UserContext";
import { TransactionsShimmer } from "./AccountantDetailShimmers";

const columns = [{ title: "TRANSACTION ID", key: "id" }, { title: "DATE", key: "date" }, { title: "CATEGORY", key: "category" }, { title: "TITLE", key: "title" }, { title: "AMOUNT", key: "amount" }, { title: "ACTIONS", key: "actions" }];

export default function TransactionsPage() {
  const router = useRouter();
  const { userId } = useUser();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [breakdownPage, setBreakdownPage] = useState(1);
  const { expenses, summary, total, loading, error } = useAccountantExpenses({ page, itemsPerPage, search, category, createdBy: userId, serverPaginated: true });
  const categories = summary.categoryBreakdown.map((item) => item.category);
  const currentMonth = new Date().getMonth();
  const stats = [
    { label: "TOTAL TRANSACTIONS", value: summary.transactionCount.toLocaleString("en-IN"), icon: Wallet },
    { label: "THIS MONTH", value: (summary.monthlyTransactionCounts?.[currentMonth] ?? 0).toLocaleString("en-IN"), icon: CalendarBlank },
    { label: "TODAY'S TRANSACTIONS", value: (summary.todayTransactionCount ?? 0).toLocaleString("en-IN"), icon: Article },
    { label: "CATEGORIES", value: categories.length.toLocaleString("en-IN"), icon: SquaresFour },
  ];
  const breakdown = summary.categoryBreakdown.map((item) => ({ label: item.category, count: item.count, percent: summary.transactionCount ? (item.count / summary.transactionCount) * 100 : 0 }));
  const breakdownPageSize = 5;
  const paginatedBreakdown = breakdown.slice((breakdownPage - 1) * breakdownPageSize, breakdownPage * breakdownPageSize);
  const tableData = expenses.map((row) => ({
    id: <span className="text-[12px] font-bold text-[#147A3D]">EXP-{row.accountantExpenseId}</span>,
    date: <span className="text-[12px]">{parseAccountantExpenseDate(row.expenseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>,
    category: <span className="rounded-full bg-[#DFF3E7] px-2 py-1 text-[9px] font-bold text-[#147A3D]">{row.category}</span>,
    title: <span className="text-[12px] font-semibold">{row.expenseName}</span>, amount: <span className="text-[12px] font-bold">{formatAccountantRevenue(row.amount)}</span>,
    actions: <span className="text-[11px] font-medium text-[#525252]">{row.paymentMethod}</span>,
  }));

  if (loading && expenses.length === 0 && !search && category === "all") {
    return <TransactionsShimmer />;
  }

  return <main className="min-h-full w-full bg-[#F4F4F4] px-2 py-4 pb-8 text-[#282828]"><div className="mx-auto flex max-w-[1180px] flex-col gap-4">
    <div className="flex items-start gap-3"><button onClick={() => router.push("/accountant")} aria-label="Back" className="mt-1 flex h-8 w-8 cursor-pointer items-center justify-center text-[#17213D]"><CaretLeft size={24} weight="bold" /></button><div><h1 className="text-2xl font-bold text-[#17213D]">Transactions</h1><p className="mt-1 text-[13px] text-[#525252]">Expenses recorded by this accountant.</p></div></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((item, index) => <CardComponent key={item.label} icon={<item.icon size={18} weight="fill" />} value={<span className="flex flex-col"><span className="text-[10px] font-bold text-[#282828]">{item.label}</span><span className="mt-1 text-[20px] font-bold text-[#17213D]">{item.value}</span></span>} label="" iconBgColor={ACCOUNTANT_CARD_VISUALS[index].iconBgColor} iconColor={ACCOUNTANT_CARD_VISUALS[index].iconColor} style="h-[118px] rounded-lg bg-white px-5 py-4 shadow" textSize="text-[#282828]" />)}</div>
    <section className="rounded-lg bg-white p-4 shadow"><div className="flex flex-wrap gap-3"><label className="flex h-10 min-w-[260px] flex-1 items-center gap-3 rounded-md bg-[#F0F2F4] px-4 text-[#667085]"><MagnifyingGlass size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} type="search" placeholder="Search transaction..." className="w-full bg-transparent text-[12px] text-[#282828] placeholder:text-[#98A2B3] outline-none" /></label><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-10 cursor-pointer rounded-md bg-[#F0F2F4] px-4 text-[12px] font-medium text-[#282828]"><option value="all">Category: All</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></div></section>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <section className="overflow-hidden rounded-lg bg-white shadow"><div className="max-h-[380px] overflow-auto"><TableComponent columns={columns} tableData={tableData} isLoading={loading} height="380px" stickyHeader tableClassName="min-w-[860px]" emptyStateMessage="No recorded transactions found." /></div><Pagination currentPage={page} totalItems={total} itemsPerPage={itemsPerPage} onPageChange={setPage} itemsPerPageOptions={[10, 20, 50]} onItemsPerPageChange={(value) => { setItemsPerPage(value); setPage(1); }} disabled={loading} alwaysShow roundedBottom="rounded-b-lg" /></section>
    <section className="overflow-hidden rounded-lg bg-white text-[#282828] shadow"><div className="p-5 pb-2"><h2 className="text-[15px] font-bold text-[#17213D]">Category Breakdown</h2><p className="mt-1 text-[11px] text-[#525252]">Volume distribution by expense type</p></div><div className="max-h-[250px] space-y-4 overflow-y-auto px-5 py-3">{paginatedBreakdown.map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-[10px] font-bold text-[#525252]"><span>{item.label}</span><span>{item.percent.toFixed(1)}%</span></div><div className="h-2 rounded-full bg-[#EEF1F4]"><div className="h-full rounded-full bg-[#237333]" style={{ width: `${item.percent}%` }} /></div></div>)}</div><Pagination currentPage={breakdownPage} totalItems={breakdown.length} itemsPerPage={breakdownPageSize} onPageChange={setBreakdownPage} alwaysShow roundedBottom="rounded-b-lg" /></section>
  </div></main>;
}
