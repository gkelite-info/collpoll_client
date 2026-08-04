"use client";

import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { AgCharts } from "ag-charts-react";
import { AllCommunityModule, ModuleRegistry, type AgCartesianChartOptions } from "ag-charts-community";
import { CaretLeft, DownloadSimple, Receipt } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { formatAccountantRevenue } from "@/lib/helpers/accountant/accountantRevenueAPI";
import { ACCOUNTANT_CARD_VISUALS, getAccountantExpenseMetrics, getMonthlyWeeklySpending, groupAccountantExpensesByCategory, parseAccountantExpenseDate } from "@/lib/helpers/accountant/accountantDashboardHelpers";
import { useAccountantExpenses } from "./useAccountantExpenses";
import { ThisMonthSpendingShimmer } from "./AccountantDetailShimmers";
import { useState } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);
const columns = [{ title: "PAYMENT DATE", key: "date" }, { title: "CATEGORY", key: "category" }, { title: "EXPENSE NAME", key: "expenseName" }, { title: "AMOUNT", key: "amount" }];

export default function ThisMonthSpendingPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { expenses, loading, error } = useAccountantExpenses();
  const now = new Date();
  const monthRows = getAccountantExpenseMetrics(expenses, now).thisMonthExpenses;
  const categories = groupAccountantExpensesByCategory(monthRows);
  const weekly = getMonthlyWeeklySpending(monthRows, now);
  const chartOptions: AgCartesianChartOptions = { data: weekly, background: { fill: "transparent" }, padding: { top: 24, right: 8, bottom: 0, left: 0 }, series: [{ type: "bar", xKey: "week", yKey: "amount", fill: "#3F7DF4", strokeWidth: 0, cornerRadius: 5, tooltip: { renderer: ({ datum }) => ({ title: datum.week, content: formatAccountantRevenue(datum.amount) }) } }], axes: { bottom: { type: "category", position: "bottom" }, left: { type: "number", position: "left", label: { formatter: ({ value }) => formatAccountantRevenue(Number(value)) } } }, legend: { enabled: false } };
  const exportCsv = () => {
    const rows = [["Payment Date", "Category", "Expense Name", "Amount"], ...monthRows.map((row) => [row.expenseDate, row.category, row.expenseName, String(row.amount)])];
    const blob = new Blob([rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `expenses-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  const paginatedRows = monthRows.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const tableData = paginatedRows.map((row) => ({ date: <span className="text-[13px]">{parseAccountantExpenseDate(row.expenseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>, category: <span className="rounded-full bg-[#CFF3D6] px-2 py-1 text-[9px] font-bold text-[#147A3D]">{row.category}</span>, expenseName: <span className="text-[13px] font-semibold">{row.expenseName}</span>, amount: <span className="text-[13px]">{formatAccountantRevenue(row.amount)}</span> }));

  if (loading && expenses.length === 0) return <ThisMonthSpendingShimmer />;

  return <main className="min-h-full w-full bg-[#F4F4F4] px-2 py-4 pb-8 text-[#282828]"><div className="mx-auto flex max-w-[1180px] flex-col gap-4">
    <section className="py-4"><div className="flex items-start gap-3"><button onClick={() => router.push("/accountant")} aria-label="Back" className="mt-1 flex h-8 w-8 cursor-pointer items-center justify-center text-[#17213D]"><CaretLeft size={24} weight="bold" /></button><div><h1 className="text-2xl font-bold text-[#17213D]">This Month Spending</h1><p className="mt-1 text-[13px] text-[#525252]">Paid employee reimbursements during {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}.</p></div></div></section>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <section><h2 className="mb-3 text-[15px] font-bold">Expense Categories</h2><div className="custom-scrollbar flex gap-3 overflow-x-scroll pb-3 [scrollbar-gutter:stable]">{categories.map((item, index) => { const visual = ACCOUNTANT_CARD_VISUALS[index % ACCOUNTANT_CARD_VISUALS.length]; return <article key={item.category} className="flex h-[92px] w-[220px] shrink-0 flex-col justify-between rounded-lg bg-white px-4 py-4 shadow"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: visual.softBg, color: visual.iconBgColor }}><Receipt size={17} weight="fill" /></span><h3 className="truncate text-[13px] font-bold" style={{ color: visual.iconBgColor }}>{item.category}</h3></div><p className="text-[13px] font-bold">{formatAccountantRevenue(item.amount)}</p></article>; })}{!loading && !categories.length && <p className="text-sm text-gray-500">No paid expenses this month.</p>}</div></section>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.95fr)]"><section className="overflow-hidden rounded-lg bg-white shadow"><div className="flex items-center justify-between px-5 py-4"><h2 className="font-bold">This Month Expense Records</h2><button onClick={exportCsv} disabled={!monthRows.length} aria-label="Download records" className="cursor-pointer disabled:opacity-40"><DownloadSimple size={18} weight="bold" /></button></div><div className="max-h-[260px] overflow-auto"><TableComponent columns={columns} tableData={tableData} isLoading={loading} height="260px" stickyHeader tableClassName="min-w-[720px]" emptyStateMessage="No paid expenses this month." /></div><Pagination currentPage={page} totalItems={monthRows.length} itemsPerPage={itemsPerPage} onPageChange={setPage} itemsPerPageOptions={[5, 10, 20]} onItemsPerPageChange={(value) => { setItemsPerPage(value); setPage(1); }} disabled={loading} alwaysShow roundedBottom="rounded-b-lg" /></section><section className="min-h-[300px] rounded-lg bg-white p-4 shadow"><h2 className="text-[15px] font-bold">Weekly Spending Trend</h2><div className="mt-4 h-[235px]"><AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} /></div></section></div>
  </div></main>;
}
