"use client";

import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { Article, CaretLeft, ChartBar, GridFour, MagnifyingGlass, Wallet } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAccountantRevenue } from "@/lib/helpers/accountant/accountantRevenueAPI";
import { ACCOUNTANT_CARD_VISUALS } from "@/lib/helpers/accountant/accountantDashboardHelpers";
import { useAccountantExpenses } from "./useAccountantExpenses";
import { TotalExpensesShimmer } from "./AccountantDetailShimmers";

const columns = [
  { title: "EXPENSE ID", key: "expenseId" },
  { title: "CATEGORY", key: "category" },
  { title: "EXPENSE NAME", key: "expenseName" },
  { title: "AMOUNT", key: "amount" },
  { title: "PAYMENT DATE", key: "date" },
  { title: "ACTIONS", key: "actions" },
];
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function TotalExpensesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { expenses, summary, total, loading, error } = useAccountantExpenses({ page, itemsPerPage, search, category, serverPaginated: true });
  const categories = summary.categoryBreakdown.map((item) => item.category);
  const thisMonth = summary.monthlyExpenses[new Date().getMonth()] ?? 0;
  const stats = [
    { label: "Total Expenses", value: formatAccountantRevenue(summary.totalExpenses), icon: Wallet },
    { label: "This Month", value: formatAccountantRevenue(thisMonth), icon: ChartBar },
    { label: "Total Records", value: summary.transactionCount.toLocaleString("en-IN"), icon: Article },
    { label: "Categories", value: categories.length.toLocaleString("en-IN"), icon: GridFour },
  ];
  const tableData = expenses.map((row) => ({
    expenseId: <span className="text-[13px] font-medium">EXP{String(row.accountantExpenseId).padStart(4, "0")}</span>,
    category: <span className="inline-flex rounded-full bg-[#DFF3E7] px-3 py-1 text-[10px] font-bold text-[#147A3D]">{row.category}</span>,
    expenseName: <span className="text-[13px] font-medium text-[#282828]">{row.expenseName}</span>,
    amount: <span className="text-[13px] font-bold text-[#17213D]">{formatAccountantRevenue(row.amount)}</span>,
    date: <span className="text-[13px] font-medium">{formatDate(row.expenseDate)}</span>,
    actions: <span className="text-[12px] font-medium text-[#525252]">{row.paymentMethod}</span>,
  }));

  if (loading && expenses.length === 0 && !search && category === "all") {
    return <TotalExpensesShimmer />;
  }

  return <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-2 py-4 pb-8 text-[#282828]">
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
      <div className="flex items-start gap-3"><button type="button" aria-label="Back to accountant dashboard" onClick={() => router.push("/accountant")} className="mt-1 flex h-8 w-8 cursor-pointer items-center justify-center text-[#17213D]"><CaretLeft size={24} weight="bold" /></button><div><h1 className="text-2xl font-bold text-[#17213D]">Total Expenses</h1><p className="mt-1 text-[13px] font-medium text-[#525252]">Paid employee reimbursements recorded for this institution.</p></div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((item, index) => <CardComponent key={item.label} icon={<item.icon size={18} weight="fill" />} value={<span className="flex flex-col"><span className="text-[13px] font-medium text-[#525252]">{item.label}</span><span className="mt-1 text-[20px] font-bold text-[#282828]">{item.value}</span></span>} label="" iconBgColor={ACCOUNTANT_CARD_VISUALS[index].iconBgColor} iconColor={ACCOUNTANT_CARD_VISUALS[index].iconColor} style="h-[118px] rounded-xl bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.10)]" textSize="text-[#282828]" />)}</div>
      <section className="rounded-xl bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center gap-4"><label className="flex h-10 min-w-[280px] flex-1 items-center gap-3 rounded-full bg-[#F0F2F4] px-4 text-[#667085]"><MagnifyingGlass size={18} weight="bold" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} type="search" placeholder="Search expense..." className="w-full bg-transparent text-[13px] text-[#282828] placeholder:text-[#98A2B3] outline-none" /></label><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-10 cursor-pointer rounded-full border border-[#CAD8C9] bg-white px-4 text-[12px] font-medium text-[#282828]"><option value="all">All Categories</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></div></section>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm"><h2 className="px-6 py-5 text-lg font-bold">Recent Expense Records</h2><div className="max-h-[420px] overflow-auto"><TableComponent columns={columns} tableData={tableData} isLoading={loading} height="420px" stickyHeader tableClassName="min-w-[850px]" emptyStateMessage="No paid employee expenses found." /></div><Pagination currentPage={page} totalItems={total} itemsPerPage={itemsPerPage} onPageChange={setPage} itemsPerPageOptions={[10, 20, 50]} onItemsPerPageChange={(value) => { setItemsPerPage(value); setPage(1); }} disabled={loading} alwaysShow roundedBottom="rounded-b-xl" /></section>
    </div>
  </main>;
}
