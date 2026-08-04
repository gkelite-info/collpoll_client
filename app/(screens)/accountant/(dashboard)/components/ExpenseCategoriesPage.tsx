"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AgCharts } from "ag-charts-react";
import { AllCommunityModule, ModuleRegistry, type AgCartesianChartOptions } from "ag-charts-community";
import { Article, Calendar, CaretLeft, ChartBar, Receipt, Wallet } from "@phosphor-icons/react";
import { formatAccountantRevenue } from "@/lib/helpers/accountant/accountantRevenueAPI";
import { ACCOUNTANT_CARD_VISUALS, getAccountantExpenseMetrics, groupAccountantExpensesByCategory, parseAccountantExpenseDate } from "@/lib/helpers/accountant/accountantDashboardHelpers";
import { useAccountantExpenses } from "./useAccountantExpenses";
import { ExpenseCategoriesShimmer } from "./AccountantDetailShimmers";

ModuleRegistry.registerModules([AllCommunityModule]);
const palette = ["#16B96F", "#4A82FF", "#8B4DFF", "#FF8A2A", "#FF477E", "#E0A300"];

export default function ExpenseCategoriesPage() {
  const router = useRouter();
  const { expenses, loading, error } = useAccountantExpenses();
  const now = new Date();
  const currentYear = now.getFullYear();
  const categoryRows = useMemo(() => {
    return groupAccountantExpensesByCategory(expenses);
  }, [expenses]);
  const monthly = Array.from({ length: 12 }, (_, month) => ({ month: new Date(2000, month, 1).toLocaleDateString("en-IN", { month: "short" }), amount: expenses.filter((row) => { const date = parseAccountantExpenseDate(row.expenseDate); return date.getFullYear() === currentYear && date.getMonth() === month; }).reduce((sum, row) => sum + row.amount, 0) }));
  const metrics = getAccountantExpenseMetrics(expenses, now);
  const summary = [
    { label: "Total Expenses", value: formatAccountantRevenue(metrics.totalAmount), detail: "All recorded expenses", icon: Wallet },
    { label: "This Month Spending", value: formatAccountantRevenue(metrics.thisMonthAmount), detail: now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), icon: ChartBar },
    { label: "Transactions", value: metrics.thisMonthCount.toLocaleString("en-IN"), detail: "This month", icon: Article },
    { label: "Avg. Daily Expense", value: formatAccountantRevenue(metrics.thisMonthAmount / Math.max(1, now.getDate())), detail: "This month", icon: Calendar },
  ];
  const options: AgCartesianChartOptions = { data: monthly, background: { fill: "transparent" }, padding: { top: 16, right: 8, bottom: 0, left: 0 }, series: [{ type: "line", xKey: "month", yKey: "amount", stroke: "#237333", marker: { enabled: true, fill: "#fff", stroke: "#237333", size: 5 }, tooltip: { renderer: ({ datum }) => ({ title: `${datum.month} ${currentYear}`, content: formatAccountantRevenue(datum.amount) }) } }], axes: { bottom: { type: "category", position: "bottom" }, left: { type: "number", position: "left", label: { formatter: ({ value }) => formatAccountantRevenue(Number(value)) } } }, legend: { enabled: false } };

  if (loading && expenses.length === 0) return <ExpenseCategoriesShimmer />;

  return <main className="min-h-full w-full bg-[#F4F4F4] px-3 pb-8 text-[#282828]"><div className="mx-auto max-w-[1180px] py-3">
    <section className="flex items-start gap-3"><button onClick={() => router.push("/accountant")} aria-label="Back" className="mt-1 flex h-8 w-8 cursor-pointer items-center justify-center text-[#17213D]"><CaretLeft size={24} weight="bold" /></button><div><h1 className="text-2xl font-bold text-[#17213D]">Expense Categories</h1><p className="mt-1 text-[13px] text-[#525252]">Category analysis of recorded institution expenses.</p></div></section>
    {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{summary.map((item, index) => <article key={item.label} className="flex h-[118px] flex-col justify-between rounded-lg bg-white p-4 shadow"><span className="flex h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: ACCOUNTANT_CARD_VISUALS[index].iconBgColor, color: ACCOUNTANT_CARD_VISUALS[index].iconColor }}><item.icon size={18} weight="fill" /></span><div><p className="text-[11px] font-semibold text-[#282828]">{item.label}</p><p className="mt-1 text-[18px] font-bold text-[#17213D]">{item.value}</p><p className="mt-1 text-[10px] text-[#525252]">{item.detail}</p></div></article>)}</section>
    <section className="mt-4"><h2 className="mb-3 text-[15px] font-bold">Expense Categories</h2><div className="custom-scrollbar flex gap-3 overflow-x-scroll pb-3 [scrollbar-gutter:stable]">{categoryRows.map((item, index) => <article key={item.category} className="flex h-[116px] w-[275px] shrink-0 flex-col justify-between rounded-lg bg-white p-4 shadow"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F7F2]" style={{ color: palette[index % palette.length] }}><Receipt size={18} weight="fill" /></span><h3 className="truncate text-[11px] font-bold" style={{ color: palette[index % palette.length] }}>{item.category}</h3></div><div><p className="text-[18px] font-bold text-[#17213D]">{formatAccountantRevenue(item.amount)}</p><p className="mt-1 text-[10px] text-[#525252]">{item.count} recorded {item.count === 1 ? "expense" : "expenses"}</p></div></article>)}{!loading && !categoryRows.length && <p className="text-sm text-gray-500">No expense categories found.</p>}</div></section>
    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"><section className="rounded-lg bg-white p-4 shadow"><h2 className="text-[15px] font-bold text-[#17213D]">Expense Overview — {now.getFullYear()}</h2><div className="mt-4 h-[260px]"><AgCharts options={options} style={{ height: "100%", width: "100%" }} /></div></section><section className="rounded-lg bg-white p-4 shadow"><h2 className="text-[15px] font-bold text-[#17213D]">Top Expense Heads</h2><div className="custom-scrollbar mt-5 h-[230px] space-y-4 overflow-y-scroll pr-2 [scrollbar-gutter:stable]">{categoryRows.map((item, index) => <div key={item.category} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F7F2]" style={{ color: palette[index % palette.length] }}><Receipt size={16} weight="fill" /></span><p className="min-w-0 flex-1 truncate text-[12px] font-bold text-[#282828]">{item.category}</p><p className="text-[12px] font-bold text-[#17213D]">{formatAccountantRevenue(item.amount)}</p></div>)}</div></section></div>
  </div></main>;
}
