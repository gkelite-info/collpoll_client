"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AgCharts } from "ag-charts-react";
import { AllCommunityModule, ModuleRegistry, type AgCartesianChartOptions } from "ag-charts-community";
import { Article, Calendar, CaretLeft, ChartBar, Receipt, Wallet } from "@phosphor-icons/react";
import { formatReimbursementAmount } from "@/lib/helpers/accountant/accountantReimbursementDashboardAPI";
import { useReimbursementTransactions } from "./useReimbursementTransactions";

ModuleRegistry.registerModules([AllCommunityModule]);
const palette = ["#16B96F", "#4A82FF", "#8B4DFF", "#FF8A2A", "#FF477E", "#E0A300"];

export default function ExpenseCategoriesPage() {
  const router = useRouter();
  const { transactions, loading, error } = useReimbursementTransactions();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const categoryRows = useMemo(() => {
    const values = new Map<string, { amount: number; count: number }>();
    transactions.forEach((row) => { const current = values.get(row.expenseCategory) ?? { amount: 0, count: 0 }; values.set(row.expenseCategory, { amount: current.amount + row.amountSpent, count: current.count + 1 }); });
    return [...values.entries()].map(([category, value]) => ({ category, ...value })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);
  const monthly = Array.from({ length: 12 }, (_, month) => ({ month: new Date(2000, month, 1).toLocaleDateString("en-IN", { month: "short" }), amount: transactions.filter((row) => { const date = new Date(`${row.paymentDate}T00:00:00`); return date.getFullYear() === currentYear && date.getMonth() === month; }).reduce((sum, row) => sum + row.amountSpent, 0) }));
  const total = transactions.reduce((sum, row) => sum + row.amountSpent, 0);
  const monthTransactions = transactions.filter((row) => { const date = new Date(`${row.paymentDate}T00:00:00`); return date.getFullYear() === currentYear && date.getMonth() === currentMonth; });
  const monthTotal = monthTransactions.reduce((sum, row) => sum + row.amountSpent, 0);
  const summary = [
    { label: "Total Expenses", value: formatReimbursementAmount(total), detail: "All paid reimbursements", icon: Wallet },
    { label: "This Month Spending", value: formatReimbursementAmount(monthTotal), detail: now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), icon: ChartBar },
    { label: "Transactions", value: monthTransactions.length.toLocaleString("en-IN"), detail: "This month", icon: Article },
    { label: "Avg. Daily Expense", value: formatReimbursementAmount(monthTotal / Math.max(1, now.getDate())), detail: "This month", icon: Calendar },
  ];
  const options: AgCartesianChartOptions = { data: monthly, background: { fill: "transparent" }, padding: { top: 16, right: 8, bottom: 0, left: 0 }, series: [{ type: "line", xKey: "month", yKey: "amount", stroke: "#237333", marker: { enabled: true, fill: "#fff", stroke: "#237333", size: 5 }, tooltip: { renderer: ({ datum }) => ({ title: `${datum.month} ${currentYear}`, content: formatReimbursementAmount(datum.amount) }) } }], axes: { bottom: { type: "category", position: "bottom" }, left: { type: "number", position: "left", label: { formatter: ({ value }) => formatReimbursementAmount(Number(value)) } } }, legend: { enabled: false } };

  return <main className="min-h-full w-full bg-[#F4F4F4] px-3 pb-8"><div className="mx-auto max-w-[1180px] py-3">
    <section className="flex items-start gap-3"><button onClick={() => router.push("/accountant")} aria-label="Back" className="mt-1 flex h-8 w-8 items-center justify-center"><CaretLeft size={24} weight="bold" /></button><div><h1 className="text-2xl font-bold">Expense Categories</h1><p className="mt-1 text-[13px]">Category analysis of paid employee reimbursements.</p></div></section>
    {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{summary.map((item) => <article key={item.label} className="flex h-[118px] flex-col justify-between rounded-lg bg-white p-4 shadow"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#DDF8E9] text-[#35C77A]"><item.icon size={18} weight="fill" /></span><div><p className="text-[11px] font-semibold">{item.label}</p><p className="mt-1 text-[18px] font-bold text-[#17213D]">{item.value}</p><p className="mt-1 text-[10px] text-[#525252]">{item.detail}</p></div></article>)}</section>
    <section className="mt-4"><h2 className="mb-3 text-[15px] font-bold">Expense Categories</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{categoryRows.map((item, index) => <article key={item.category} className="flex h-[116px] flex-col justify-between rounded-lg bg-white p-4 shadow"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F7F2]" style={{ color: palette[index % palette.length] }}><Receipt size={18} weight="fill" /></span><h3 className="truncate text-[11px] font-bold" style={{ color: palette[index % palette.length] }}>{item.category}</h3></div><div><p className="text-[18px] font-bold text-[#17213D]">{formatReimbursementAmount(item.amount)}</p><p className="mt-1 text-[10px] text-[#525252]">{item.count} paid {item.count === 1 ? "expense" : "expenses"}</p></div></article>)}{!loading && !categoryRows.length && <p className="text-sm text-gray-500">No paid expense categories found.</p>}</div></section>
    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"><section className="rounded-lg bg-white p-4 shadow"><h2 className="text-[15px] font-bold text-[#17213D]">Expense Overview — {now.getFullYear()}</h2><div className="mt-4 h-[260px]"><AgCharts options={options} style={{ height: "100%", width: "100%" }} /></div></section><section className="rounded-lg bg-white p-4 shadow"><h2 className="text-[15px] font-bold text-[#17213D]">Top Expense Heads</h2><div className="mt-5 space-y-4">{categoryRows.slice(0, 5).map((item, index) => <div key={item.category} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F7F2]" style={{ color: palette[index % palette.length] }}><Receipt size={16} weight="fill" /></span><p className="min-w-0 flex-1 truncate text-[12px] font-bold">{item.category}</p><p className="text-[12px] font-bold">{formatReimbursementAmount(item.amount)}</p></div>)}</div></section></div>
  </div></main>;
}
