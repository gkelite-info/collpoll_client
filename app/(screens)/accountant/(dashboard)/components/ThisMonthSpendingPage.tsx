"use client";

import TableComponent from "@/app/utils/table/table";
import { AgCharts } from "ag-charts-react";
import { AllCommunityModule, ModuleRegistry, type AgCartesianChartOptions } from "ag-charts-community";
import { CaretLeft, DownloadSimple, Receipt } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { formatReimbursementAmount } from "@/lib/helpers/accountant/accountantReimbursementDashboardAPI";
import { useReimbursementTransactions } from "./useReimbursementTransactions";

ModuleRegistry.registerModules([AllCommunityModule]);
const columns = [{ title: "PAYMENT DATE", key: "date" }, { title: "CATEGORY", key: "category" }, { title: "EXPENSE NAME", key: "expenseName" }, { title: "AMOUNT", key: "amount" }];

export default function ThisMonthSpendingPage() {
  const router = useRouter();
  const { transactions, loading, error } = useReimbursementTransactions();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthRows = transactions.filter((row) => { const date = new Date(`${row.paymentDate}T00:00:00`); return date.getMonth() === currentMonth && date.getFullYear() === currentYear; });
  const categories = (() => {
    const values = new Map<string, number>();
    monthRows.forEach((row) => values.set(row.expenseCategory, (values.get(row.expenseCategory) ?? 0) + row.amountSpent));
    return [...values.entries()].sort((a, b) => b[1] - a[1]);
  })();
  const weekly = [1, 2, 3, 4, 5].map((week) => ({ week: `Week ${week}`, amount: monthRows.filter((row) => Math.ceil(new Date(`${row.paymentDate}T00:00:00`).getDate() / 7) === week).reduce((sum, row) => sum + row.amountSpent, 0) }));
  const chartOptions: AgCartesianChartOptions = { data: weekly, background: { fill: "transparent" }, padding: { top: 24, right: 8, bottom: 0, left: 0 }, series: [{ type: "bar", xKey: "week", yKey: "amount", fill: "#91D58B", strokeWidth: 0, cornerRadius: 5, tooltip: { renderer: ({ datum }) => ({ title: datum.week, content: formatReimbursementAmount(datum.amount) }) } }], axes: { bottom: { type: "category", position: "bottom" }, left: { type: "number", position: "left", label: { formatter: ({ value }) => formatReimbursementAmount(Number(value)) } } }, legend: { enabled: false } };
  const exportCsv = () => {
    const rows = [["Payment Date", "Category", "Expense Name", "Amount"], ...monthRows.map((row) => [row.paymentDate, row.expenseCategory, row.expenseTitle, String(row.amountSpent)])];
    const blob = new Blob([rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `expenses-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  const tableData = monthRows.map((row) => ({ date: <span className="text-[13px]">{new Date(`${row.paymentDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>, category: <span className="rounded-full bg-[#CFF3D6] px-2 py-1 text-[9px] font-bold text-[#147A3D]">{row.expenseCategory}</span>, expenseName: <span className="text-[13px] font-semibold">{row.expenseTitle}</span>, amount: <span className="text-[13px]">{formatReimbursementAmount(row.amountSpent)}</span> }));

  return <main className="min-h-full w-full bg-[#F4F4F4] px-2 py-4 pb-8"><div className="mx-auto flex max-w-[1180px] flex-col gap-4">
    <section className="py-4"><div className="flex items-start gap-3"><button onClick={() => router.push("/accountant")} aria-label="Back" className="mt-1 flex h-8 w-8 items-center justify-center"><CaretLeft size={24} weight="bold" /></button><div><h1 className="text-2xl font-bold">This Month Spending</h1><p className="mt-1 text-[13px]">Paid employee reimbursements during {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}.</p></div></div></section>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <section><h2 className="mb-3 text-[15px] font-bold">Expense Categories</h2><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">{categories.map(([title, amount]) => <article key={title} className="flex h-[92px] flex-col justify-between rounded-lg bg-[#EFEFEF] px-4 py-4 shadow"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#DDF8E9] text-[#086C20]"><Receipt size={17} weight="fill" /></span><h3 className="truncate text-[13px] font-bold text-[#086C20]">{title}</h3></div><p className="text-[13px] font-bold">{formatReimbursementAmount(amount)}</p></article>)}{!loading && !categories.length && <p className="text-sm text-gray-500">No paid expenses this month.</p>}</div></section>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.95fr)]"><section className="rounded-lg bg-white shadow"><div className="flex items-center justify-between px-5 py-4"><h2 className="font-bold">This Month Expense Records</h2><button onClick={exportCsv} disabled={!monthRows.length} aria-label="Download records" className="disabled:opacity-40"><DownloadSimple size={18} weight="bold" /></button></div><TableComponent columns={columns} tableData={tableData} isLoading={loading} height="260px" stickyHeader={false} tableClassName="min-w-[620px]" emptyStateMessage="No paid expenses this month." /></section><section className="min-h-[300px] rounded-lg bg-white p-4 shadow"><h2 className="text-[15px] font-bold">Weekly Spending Trend</h2><div className="mt-4 h-[235px]"><AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} /></div></section></div>
  </div></main>;
}
