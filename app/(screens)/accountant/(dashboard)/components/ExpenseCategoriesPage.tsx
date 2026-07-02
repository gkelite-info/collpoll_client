"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import {
  Article,
  Calendar,
  CaretDown,
  CaretLeft,
  ChartBar,
  Crown,
  GridFour,
  Money,
  Wallet,
} from "@phosphor-icons/react";
import AccountantDashboardRight from "./right";
import { expenseCategories, monthlyExpenseData } from "./data";

ModuleRegistry.registerModules([AllCommunityModule]);

const summaryCards = [
  {
    label: "Total Expenses",
    value: "Rs 24,20,000",
    detail: "All Time",
    icon: Wallet,
    iconBg: "#DDF8E9",
    iconColor: "#35C77A",
  },
  {
    label: "This Month Spending",
    value: "Rs 2,45,000",
    detail: "October 2025",
    icon: ChartBar,
    iconBg: "#E1ECFF",
    iconColor: "#4B7DFF",
  },
  {
    label: "Transactions",
    value: "1,248",
    detail: "This Month",
    icon: Article,
    iconBg: "#EEE1FF",
    iconColor: "#9B4DFF",
  },
  {
    label: "Avg. Daily Expense",
    value: "Rs 11,190",
    detail: "This Month",
    icon: Calendar,
    iconBg: "#FFF3D2",
    iconColor: "#FF9238",
  },
];

const categoryCards = [
  ...expenseCategories,
  {
    title: "Maintenance",
    countLabel: "Expense Records",
    count: "8",
    amount: "Rs 1,00,000",
    bg: "bg-[#F4F7FA]",
    icon: Crown,
    color: "#172B58",
  },
];

const topExpenseHeads = [
  {
    label: "Salaries",
    value: "Rs 18,50,000",
    bg: "bg-[#DFFBEA]",
    color: "#16B96F",
    icon: Money,
  },
  {
    label: "Infrastructure",
    value: "Rs 12,80,000",
    bg: "bg-[#E3F0FF]",
    color: "#4A82FF",
    icon: ChartBar,
  },
  {
    label: "Events",
    value: "Rs 4,20,000",
    bg: "bg-[#EFE4FF]",
    color: "#8B4DFF",
    icon: GridFour,
  },
  {
    label: "Subscriptions",
    value: "Rs 3,50,000",
    bg: "bg-[#E2FAF0]",
    color: "#172B58",
    icon: Crown,
  },
  {
    label: "Others",
    value: "Rs 1,20,000",
    bg: "bg-[#FFEBD6]",
    color: "#FF8A2A",
    icon: Article,
  },
];

function SummaryCard({ item }: { item: (typeof summaryCards)[number] }) {
  const Icon = item.icon;

  return (
    <article className="flex h-[118px] min-w-0 flex-col justify-between rounded-lg bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.12)]">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-md"
        style={{ backgroundColor: item.iconBg, color: item.iconColor }}
      >
        <Icon size={18} weight="fill" />
      </span>
      <div>
        <p className="text-[11px] font-semibold text-[#282828]">{item.label}</p>
        <p className="mt-1 text-[18px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
        <p className="mt-1 text-[10px] font-medium text-[#525252]">{item.detail}</p>
      </div>
    </article>
  );
}

function CategoryCard({ item }: { item: (typeof categoryCards)[number] }) {
  const Icon = item.icon;

  return (
    <article className="flex h-[116px] flex-col justify-between rounded-lg bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
        >
          <Icon size={18} weight="fill" color={item.color} />
        </span>
        <h3
          className="min-w-0 text-[11px] font-bold leading-tight"
          style={{ color: item.color }}
        >
          {item.title}
        </h3>
      </div>
      <div>
        <p className="text-[18px] font-bold leading-tight text-[#17213D]">
          {item.amount}
        </p>
        <p className="mt-1 text-[10px] font-medium text-[#525252]">
          {item.count} {item.countLabel}
        </p>
      </div>
    </article>
  );
}

function ExpenseOverview() {
  const chartData = useMemo(
    () =>
      monthlyExpenseData.map((item) => ({
        month: item.month,
        amount: item.value,
        displayAmount: item.month === "Jun" ? "Rs 18,45,000" : `Rs ${item.value}L`,
      })),
    [],
  );

  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
      background: { fill: "transparent" },
      padding: { top: 16, right: 8, bottom: 0, left: 0 },
      series: [
        {
          type: "line",
          xKey: "month",
          yKey: "amount",
          stroke: "#237333",
          marker: {
            enabled: true,
            fill: "#FFFFFF",
            stroke: "#237333",
            size: 5,
          },
          tooltip: {
            renderer: ({ datum }) => ({
              title: `${datum.month} 2025`,
              content: datum.displayAmount,
            }),
          },
        },
      ],
      axes: {
        bottom: {
          type: "category",
          position: "bottom",
          label: { color: "#6B7280", fontSize: 10 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          position: "left",
          min: 0,
          max: 30,
          label: {
            color: "#6B7280",
            fontSize: 10,
            formatter: ({ value }) => (Number(value) === 0 ? "0" : `${value}L`),
          },
          gridLine: { enabled: false },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [chartData],
  );

  return (
    <section className="rounded-lg bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-[#17213D]">Expense Overview</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md bg-[#F0F2F4] p-1 text-[10px] font-medium text-[#525252]">
            <button type="button" className="rounded-md bg-[#237333] px-3 py-1 text-white">
              Monthly
            </button>
            <button type="button" className="px-3 py-1">
              Quarterly
            </button>
            <button type="button" className="px-3 py-1">
              Yearly
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-[#F0F2F4] px-3 py-1.5 text-[10px] font-semibold text-[#17213D]"
          >
            2025
            <CaretDown size={10} weight="bold" />
          </button>
        </div>
      </div>
      <div className="mt-4 h-[260px]">
        <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
}

function TopExpenseHeads() {
  return (
    <section className="rounded-lg bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.12)]">
      <h2 className="text-[15px] font-bold text-[#17213D]">Top Expense Heads</h2>
      <div className="mt-5 space-y-4">
        {topExpenseHeads.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                <Icon size={16} weight="fill" color={item.color} />
              </span>
              <p className="flex-1 text-[12px] font-bold text-[#17213D]">{item.label}</p>
              <p className="text-[12px] font-bold text-[#17213D]">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ExpenseCategoriesContent() {
  const router = useRouter();

  return (
    <div className="w-full px-2 py-3 pb-8 md:w-[68%]">
      <section className="py-1">
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label="Back to accountant dashboard"
            onClick={() => router.push("/accountant")}
            className="mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[#17213D]"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#282828]">
              Expenses Categories
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#282828]">
              View and analyze all recorded institutional expenses.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </section>

      <section className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#282828]">Expense Categories</h2>
          <button type="button" className="text-[12px] font-bold text-[#43C17A]">
            View All Categories
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {categoryCards.map((item) => (
            <CategoryCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <ExpenseOverview />
        <TopExpenseHeads />
      </div>
    </div>
  );
}

export default function ExpenseCategoriesPage() {
  return (
    <main className="flex min-h-full w-full gap-2 overflow-x-hidden bg-[#F4F4F4] pb-5">
      <ExpenseCategoriesContent />
      <AccountantDashboardRight />
    </main>
  );
}
