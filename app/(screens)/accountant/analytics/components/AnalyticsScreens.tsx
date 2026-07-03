"use client";

import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  BookOpen,
  CalendarBlank,
  CalendarCheck,
  CaretLeft,
  CaretDown,
  CreditCard,
  ChartBar,
  DownloadSimple,
  FilePdf,
  FileText,
  GraduationCap,
  DotsThreeVertical,
  Eye,
  House,
  Plus,
  MinusCircle,
  Paperclip,
  Receipt,
  UserPlus,
  UploadSimple,
  Wallet,
  X,
  Truck,
  TrendUp,
} from "@phosphor-icons/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const stats = [
  {
    label: "Total Revenue",
    value: "Rs 4.85 Cr",
    icon: CreditCard,
    bg: "#E8F8EF",
    color: "#1EA45B",
  },
  {
    label: "Total Expenses",
    value: "Rs 2.34 Cr",
    icon: Briefcase,
    bg: "#E9F1FF",
    color: "#3F7DF4",
  },
  {
    label: "Transactions",
    value: "2,846",
    icon: TrendUp,
    bg: "#F6E9FF",
    color: "#A64FF2",
  },
  {
    label: "Top Expense Category",
    value: "Salaries & Wages",
    icon: MinusCircle,
    bg: "#FFF1E5",
    color: "#F26A2E",
  },
];

const trendData = [
  { month: "JAN", revenue: 55, expenses: 35 },
  { month: "FEB", revenue: 48, expenses: 40 },
  { month: "MAR", revenue: 78, expenses: 35 },
  { month: "APR", revenue: 55, expenses: 45 },
  { month: "MAY", revenue: 50, expenses: 35 },
  { month: "JUN", revenue: 70, expenses: 45 },
  { month: "JUL", revenue: 48, expenses: 38 },
  { month: "AUG", revenue: 74, expenses: 50 },
  { month: "SEP", revenue: 55, expenses: 42 },
  { month: "OCT", revenue: 40, expenses: 35 },
  { month: "NOV", revenue: 48, expenses: 42 },
  { month: "DEC", revenue: 45, expenses: 38 },
];

const categoryBreakdown = [
  { label: "Salaries & Wages", value: "Rs 1.07 Cr", color: "#438AF6" },
  { label: "Utilities", value: "Rs 46.8 L", color: "#43C17A" },
  { label: "Maintenance", value: "Rs 35.1 L", color: "#FFB020" },
  { label: "Administrative", value: "Rs 35.1 L", color: "#6B7DF6" },
];

const revenueSources = [
  {
    label: "Student Fees",
    value: "Rs 2.85 Cr",
    color: "#23B66F",
    bg: "#E8F8EF",
    icon: Receipt,
  },
  {
    label: "Hostel Fees",
    value: "Rs 1.15 Cr",
    color: "#3F7DF4",
    bg: "#E9F1FF",
    icon: House,
  },
  {
    label: "Transport Fees",
    value: "Rs 42.5 L",
    color: "#F26A2E",
    bg: "#FFF1E5",
    icon: Truck,
  },
  {
    label: "Examination Fees",
    value: "Rs 28.2 L",
    color: "#FF5757",
    bg: "#FFECEC",
    icon: CalendarCheck,
  },
  {
    label: "Other Revenue",
    value: "Rs 14.3 L",
    color: "#9B4DFF",
    bg: "#F6E9FF",
    icon: MinusCircle,
  },
];

const monthlyExpenses = [
  { month: "May 2025", value: "Rs 2.34 Cr" },
  { month: "Apr 2025", value: "Rs 2.18 Cr" },
  { month: "Mar 2025", value: "Rs 2.45 Cr" },
  { month: "Feb 2025", value: "Rs 1.95 Cr" },
  { month: "Jan 2025", value: "Rs 2.10 Cr" },
];

const recentTransactions = [
  {
    title: "Student Fees Collection",
    date: "28 May 2025",
    amount: "+ Rs 45,000",
    type: "REVENUE",
    direction: "down",
  },
  {
    title: "Electricity Bill Payment",
    date: "27 May 2025",
    amount: "- Rs 12,400",
    type: "EXPENSE",
    direction: "up",
  },
  {
    title: "Hostel Fees Collection",
    date: "27 May 2025",
    amount: "+ Rs 1,25,000",
    type: "REVENUE",
    direction: "down",
  },
  {
    title: "Office Supplies",
    date: "26 May 2025",
    amount: "- Rs 4,850",
    type: "EXPENSE",
    direction: "up",
  },
];

const revenueStats = [
  {
    label: "Total Revenue",
    value: "Rs 4.85 Cr",
    detail: "All Time",
    icon: CreditCard,
    bg: "#DDF8E9",
    color: "#23B66F",
  },
  {
    label: "This Month Revenue",
    value: "Rs 28.4 L",
    detail: "May 2025",
    icon: CalendarBlank,
    bg: "#E9F1FF",
    color: "#3F7DF4",
  },
  {
    label: "Revenue Sources",
    value: "8",
    detail: "Active Sources",
    icon: Receipt,
    bg: "#F6E9FF",
    color: "#A64FF2",
  },
  {
    label: "Transactions Recorded",
    value: "2,846",
    detail: "All Time",
    icon: TrendUp,
    bg: "#FFF1E5",
    color: "#F26A2E",
  },
];

const revenueAnalyticsData = [
  { month: "Jan", amount: 13 },
  { month: "Feb", amount: 20 },
  { month: "Mar", amount: 17 },
  { month: "Apr", amount: 23 },
  { month: "May", amount: 31 },
  { month: "Jun", amount: 26 },
  { month: "Jul", amount: 13 },
  { month: "Aug", amount: 20 },
  { month: "Sep", amount: 23 },
  { month: "Oct", amount: 17 },
  { month: "Nov", amount: 13 },
  { month: "Dec", amount: 20 },
];

const revenueSourceOverview = [
  {
    label: "Student Fees",
    totalRevenue: "Rs 3.2 Cr",
    transactions: "1,850",
    icon: Receipt,
    bg: "#DDF8E9",
    color: "#23B66F",
    border: "#BDEFD5",
  },
  {
    label: "Hostel Fees",
    totalRevenue: "Rs 58 L",
    transactions: "420",
    icon: House,
    bg: "#FFF1E5",
    color: "#F26A2E",
    border: "#F6D8BC",
  },
  {
    label: "Transport Fees",
    totalRevenue: "Rs 42 L",
    transactions: "610",
    icon: Truck,
    bg: "#E9F1FF",
    color: "#3F7DF4",
    border: "#CFE0FF",
  },
  {
    label: "Examination Fees",
    totalRevenue: "Rs 25 L",
    transactions: "780",
    icon: CalendarCheck,
    bg: "#E9F1FF",
    color: "#3F7DF4",
    border: "#CFE0FF",
  },
  {
    label: "Event Registrations",
    totalRevenue: "Rs 12 L",
    transactions: "320",
    icon: MinusCircle,
    bg: "#F6E9FF",
    color: "#A64FF2",
    border: "#E7D2FF",
  },
  {
    label: "Library & Fines",
    totalRevenue: "Rs 4.5 L",
    transactions: "140",
    icon: Receipt,
    bg: "#DDF8E9",
    color: "#20BFA1",
    border: "#BCEFE4",
  },
  {
    label: "Other Revenue",
    totalRevenue: "Rs 3.5 L",
    transactions: "96",
    icon: MinusCircle,
    bg: "#FFEAF3",
    color: "#E34D85",
    border: "#F6D2E1",
  },
  {
    label: "Miscellaneous",
    totalRevenue: "Rs 2.6 L",
    transactions: "75",
    icon: Receipt,
    bg: "#FFF4CE",
    color: "#D59B00",
    border: "#F2DFA1",
  },
];

const studentFeeStats = [
  {
    label: "Total Revenue",
    value: "Rs 3.20 Cr",
    icon: Wallet,
    bg: "#24C96F",
    color: "#FFFFFF",
  },
  {
    label: "This Month Revenue",
    value: "Rs 15.6 L",
    icon: ChartBar,
    bg: "#3F7DF4",
    color: "#FFFFFF",
  },
  {
    label: "Transactions",
    value: "1,850",
    icon: FileText,
    bg: "#A64FF2",
    color: "#FFFFFF",
  },
];

const feeTypeSummary = [
  {
    label: "Semester Fees",
    value: "Rs 1.45 Cr",
    detail: "820 Transactions",
    icon: BookOpen,
    bg: "#E8F8EF",
    color: "#23B66F",
    border: "#BDEFD5",
  },
  {
    label: "Tuition Fees",
    value: "Rs 91.5 L",
    detail: "640 Transactions",
    icon: FileText,
    bg: "#E9F1FF",
    color: "#3F7DF4",
    border: "#CFE0FF",
  },
  {
    label: "Admission Fees",
    value: "Rs 40.9 L",
    detail: "230 Transactions",
    icon: UserPlus,
    bg: "#FFF1E5",
    color: "#F26A2E",
    border: "#F6D8BC",
  },
  {
    label: "Exam Fees",
    value: "Rs 28.5 L",
    detail: "160 Transactions",
    icon: Briefcase,
    bg: "#F6E9FF",
    color: "#A64FF2",
    border: "#E7D2FF",
  },
  {
    label: "Others",
    value: "Rs 14.6 L",
    detail: "70 Transactions",
    icon: MinusCircle,
    bg: "#FFEAF3",
    color: "#E34D85",
    border: "#F6D2E1",
  },
];

const recentFeeCollections = [
  {
    student: "Sneha R. Naik",
    feeType: "Tuition Fees",
    amount: "Rs 45,000",
    date: "22 Oct 2025",
    paymentMode: "UPI",
  },
  {
    student: "Rohit S. Shetty",
    feeType: "Semester Fees",
    amount: "Rs 25,000",
    date: "23 Oct 2025",
    paymentMode: "Online",
  },
  {
    student: "Aditya K. Bhat",
    feeType: "Semester Fees",
    amount: "Rs 25,000",
    date: "22 Oct 2025",
    paymentMode: "Card",
  },
  {
    student: "Pooja M. Rao",
    feeType: "Admission Fees",
    amount: "Rs 10,000",
    date: "21 Oct 2025",
    paymentMode: "Online",
  },
  {
    student: "Karthik J. Nayak",
    feeType: "Exam Fees",
    amount: "Rs 5,000",
    date: "21 Oct 2025",
    paymentMode: "Cash",
  },
];

const recentRevenueRecords = [
  {
    id: "REV-2025-1241",
    source: "Student Fees",
    description: "B.Tech Semester Collection",
    amount: "Rs 15,00,000",
    date: "23 Oct 2025",
  },
  {
    id: "REV-2025-1240",
    source: "Hostel Fees",
    description: "October Hostel Collection",
    amount: "Rs 2,50,000",
    date: "22 Oct 2025",
  },
  {
    id: "REV-2025-1239",
    source: "Transport Fees",
    description: "Bus Fee Collection",
    amount: "Rs 1,20,000",
    date: "21 Oct 2025",
  },
  {
    id: "REV-2025-1238",
    source: "Examination Fees",
    description: "End Semester Exam Fees",
    amount: "Rs 85,000",
    date: "21 Oct 2025",
  },
  {
    id: "REV-2025-1237",
    source: "Event Registrations",
    description: "Workshop Registration Fees",
    amount: "Rs 45,000",
    date: "20 Oct 2025",
  },
];

function StatCard({
  item,
  onClick,
}: {
  item: (typeof stats)[number];
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`flex h-[82px] min-w-0 items-center gap-4 rounded-lg bg-white px-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)] ${
        onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]" : ""
      }`}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={20} weight="fill" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-[#7B8190]">
          {item.label}
        </p>
        <p className="mt-1 truncate text-[18px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
      </div>
    </article>
  );
}

function RevenueStatCard({ item }: { item: (typeof revenueStats)[number] }) {
  const Icon = item.icon;

  return (
    <article className="flex h-[88px] min-w-0 items-center gap-4 rounded-lg bg-white px-5 shadow-[0_3px_12px_rgba(15,23,42,0.14)]">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={20} weight="fill" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-[#6B7280]">
          {item.label}
        </p>
        <p className="mt-1 truncate text-[18px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
        <p className="mt-0.5 truncate text-[10px] font-medium text-[#8A9099]">
          {item.detail}
        </p>
      </div>
    </article>
  );
}

function RevenueExpenseChart() {
  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: trendData,
      background: { fill: "transparent" },
      padding: { top: 18, right: 10, bottom: 4, left: 0 },
      series: [
        {
          type: "line",
          xKey: "month",
          yKey: "revenue",
          yName: "Revenue",
          stroke: "#25C66A",
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: "#FFFFFF",
            stroke: "#25C66A",
            strokeWidth: 2,
            size: 7,
          },
        },
        {
          type: "line",
          xKey: "month",
          yKey: "expenses",
          yName: "Expenses",
          stroke: "#FF6B6B",
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: "#FFFFFF",
            stroke: "#FF6B6B",
            strokeWidth: 2,
            size: 7,
          },
        },
      ],
      axes: {
        bottom: {
          type: "category",
          position: "bottom",
          label: { color: "#17213D", fontSize: 10, fontWeight: 700 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          position: "left",
          min: 20,
          max: 90,
          label: { enabled: false },
          gridLine: { enabled: true, style: [{ stroke: "#EEF1F4" }] },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [],
  );

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-[#17213D]">
          Revenue vs Expenses Trend
        </h2>
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-5 text-[12px] font-semibold text-[#525252]">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-4 rounded-full bg-[#25C66A]" />
              Revenue
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-4 rounded-full bg-[#FF6B6B]" />
              Expenses
            </span>
          </div>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-[#E3E8EF] bg-white px-4 text-[12px] font-semibold text-[#17213D]"
          >
            Monthly
            <CaretDown size={12} weight="bold" />
          </button>
        </div>
      </div>
      <div className="mt-5 h-[300px]">
        <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
}

function ExpensesByCategory() {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <h2 className="text-[15px] font-bold text-[#17213D]">Expenses by Category</h2>
      <div className="mt-7 flex justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[conic-gradient(#43C17A_0_72%,#EAF8F0_72%_100%)]">
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
            <span className="text-[9px] font-bold tracking-wide text-[#8A9099]">
              TOTAL
            </span>
            <span className="mt-1 text-[18px] font-bold text-[#17213D]">
              Rs 2.34 Cr
            </span>
          </div>
        </div>
      </div>

      <div className="mt-7 space-y-3">
        {categoryBreakdown.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-[11px] font-medium text-[#525252]">
              {item.label}
            </span>
            <span className="text-[11px] font-bold text-[#17213D]">{item.value}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 h-10 w-full rounded-lg bg-[#F4F6F8] text-[12px] font-semibold text-[#17213D]"
      >
        View All Categories
      </button>
    </section>
  );
}

function PanelHeader({
  title,
  action,
}: {
  title: string;
  action: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-[#17213D]">{title}</h2>
      <button type="button" className="text-[11px] font-bold text-[#3F7DF4]">
        {action}
      </button>
    </div>
  );
}

function RevenueSourcesPanel() {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Top Revenue Sources" action="View All" />
      <div className="mb-3 flex text-[9px] font-bold uppercase tracking-wide text-[#A0A7B2]">
        <span className="flex-1">Source</span>
        <span>Amount</span>
      </div>
      <div className="space-y-4">
        {revenueSources.map((item) => (
          <RevenueSourceRow key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

function RevenueSourceRow({ item }: { item: (typeof revenueSources)[number] }) {
  const Icon = item.icon;

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={13} weight="fill" />
      </span>
      <span className="flex-1 text-[12px] font-semibold text-[#17213D]">
        {item.label}
      </span>
      <span className="text-[12px] font-bold text-[#17213D]">{item.value}</span>
    </div>
  );
}

function MonthlyExpensePanel() {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Monthly Expense Breakdown" action="View Report" />
      <div className="mb-4 flex text-[9px] font-bold uppercase tracking-wide text-[#A0A7B2]">
        <span className="flex-1">Month</span>
        <span>Amount</span>
      </div>
      <div className="space-y-5">
        {monthlyExpenses.map((item) => (
          <div key={item.month} className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#525252]">
              {item.month}
            </span>
            <span className="text-[12px] font-bold text-[#17213D]">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentTransactionsPanel() {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Recent Transactions" action="View All" />
      <div className="space-y-4">
        {recentTransactions.map((item) => {
          const isRevenue = item.type === "REVENUE";
          const Icon = item.direction === "down" ? ArrowDown : ArrowUp;

          return (
            <div key={`${item.title}-${item.date}`} className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isRevenue
                    ? "bg-[#E8F8EF] text-[#28B66F]"
                    : "bg-[#FFECEC] text-[#FF5757]"
                }`}
              >
                <Icon size={17} weight="bold" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-[#17213D]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[9px] font-semibold text-[#A0A7B2]">
                  {item.date}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-[11px] font-bold ${
                    isRevenue ? "text-[#28B66F]" : "text-[#FF5757]"
                  }`}
                >
                  {item.amount}
                </p>
                <p className="mt-0.5 text-[8px] font-bold text-[#A0A7B2]">
                  {item.type}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="mt-6 h-10 w-full rounded-lg bg-[#F4F6F8] text-[12px] font-semibold text-[#17213D]"
      >
        View All Transactions
      </button>
    </section>
  );
}

function RevenueAnalyticsChart() {
  const chartData = useMemo(
    () =>
      revenueAnalyticsData.map((item) => ({
        ...item,
        fill: item.month === "May" ? "#1EC95F" : "#52CD82",
        displayAmount: item.month === "May" ? "Rs 28.4 L" : `Rs ${item.amount} L`,
      })),
    [],
  );

  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
      background: { fill: "transparent" },
      padding: { top: 14, right: 8, bottom: 0, left: 4 },
      series: [
        {
          type: "bar",
          direction: "vertical",
          xKey: "month",
          yKey: "amount",
          fill: "#52CD82",
          strokeWidth: 0,
          cornerRadius: 5,
          width: 24,
          itemStyler: ({ datum }) => ({
            fill: datum.fill,
          }),
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
          label: { color: "#17213D", fontSize: 11, fontWeight: 700 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          position: "left",
          min: 0,
          max: 35,
          interval: { step: 10 },
          label: {
            color: "#17213D",
            fontSize: 11,
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
    <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.16)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-[#17213D]">Revenue Analytics</h2>
        <div className="flex items-center gap-4">
          <div className="flex rounded-full bg-[#F0F2F4] p-1 text-[10px] font-semibold text-[#6B7280]">
            <button
              type="button"
              className="rounded-full bg-[#24C96F] px-5 py-2 text-white"
            >
              Monthly
            </button>
            <button type="button" className="px-5 py-2">
              Quarterly
            </button>
            <button type="button" className="px-5 py-2">
              Half-Yearly
            </button>
            <button type="button" className="px-5 py-2">
              Yearly
            </button>
          </div>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-full bg-[#F0F2F4] px-4 text-[12px] font-semibold text-[#17213D]"
          >
            2025
            <CaretDown size={12} weight="bold" />
          </button>
        </div>
      </div>
      <div className="mt-5 h-[260px]">
        <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
}

function RevenueSourceCard({
  item,
  onClick,
}: {
  item: (typeof revenueSourceOverview)[number];
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`rounded-lg border bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.10)] ${
        onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)]" : ""
      }`}
      style={{ borderColor: item.border }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: item.bg, color: item.color }}
        >
          <Icon size={18} weight="fill" />
        </span>
        <h3 className="truncate text-[12px] font-bold" style={{ color: item.color }}>
          {item.label}
        </h3>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase text-[#8A9099]">
            Total Revenue
          </p>
          <p className="mt-1 text-[13px] font-bold text-[#17213D]">
            {item.totalRevenue}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-[#8A9099]">
            Transactions
          </p>
          <p className="mt-1 text-[13px] font-bold text-[#17213D]">
            {item.transactions}
          </p>
        </div>
      </div>
    </article>
  );
}

function StudentFeesStatCard({
  item,
}: {
  item: (typeof studentFeeStats)[number];
}) {
  const Icon = item.icon;

  return (
    <article className="flex h-[82px] min-w-0 items-center gap-4 rounded-lg bg-white px-5 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={18} weight="fill" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-[#6B7280]">
          {item.label}
        </p>
        <p className="mt-1 truncate text-[17px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
      </div>
    </article>
  );
}

function StudentRevenueTrendChart() {
  const chartData = useMemo(
    () => [
      { month: "Jan", amount: 26 },
      { month: "Feb", amount: 29 },
      { month: "Mar", amount: 30 },
      { month: "Apr", amount: 28 },
      { month: "May", amount: 29 },
      { month: "Jun", amount: 40 },
      { month: "Jul", amount: 35 },
      { month: "Aug", amount: 32 },
      { month: "Sep", amount: 35 },
      { month: "Oct", amount: 35 },
      { month: "Nov", amount: 32 },
      { month: "Dec", amount: 34 },
    ],
    [],
  );

  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
      background: { fill: "transparent" },
      padding: { top: 18, right: 8, bottom: 0, left: 4 },
      series: [
        {
          type: "line",
          xKey: "month",
          yKey: "amount",
          stroke: "#24C96F",
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: "#FFFFFF",
            stroke: "#24C96F",
            strokeWidth: 2,
            size: 6,
          },
          tooltip: {
            renderer: ({ datum }) => ({
              title: `${datum.month} 2025`,
              content: `Rs ${datum.amount} L`,
            }),
          },
        },
      ],
      axes: {
        bottom: {
          type: "category",
          position: "bottom",
          label: { color: "#17213D", fontSize: 11, fontWeight: 700 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          position: "left",
          min: 10,
          max: 50,
          interval: { step: 10 },
          label: {
            color: "#17213D",
            fontSize: 11,
            formatter: ({ value }) => `${value}L`,
          },
          gridLine: { enabled: true, style: [{ stroke: "#EEF1F4" }] },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [chartData],
  );

  return (
    <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-[#17213D]">Revenue Trend</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full bg-[#F0F2F4] p-1 text-[10px] font-semibold text-[#6B7280]">
            <button type="button" className="rounded-full bg-[#24C96F] px-5 py-2 text-white">
              Monthly
            </button>
            <button type="button" className="px-5 py-2">
              Quarterly
            </button>
            <button type="button" className="px-5 py-2">
              Half-Yearly
            </button>
            <button type="button" className="px-5 py-2">
              Yearly
            </button>
          </div>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-full bg-[#F0F2F4] px-4 text-[12px] font-semibold text-[#17213D]"
          >
            2025
            <CaretDown size={12} weight="bold" />
          </button>
        </div>
      </div>
      <div className="mt-5 h-[270px]">
        <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
}

function FeeTypeCard({ item }: { item: (typeof feeTypeSummary)[number] }) {
  const Icon = item.icon;

  return (
    <article
      className="rounded-lg border bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.10)]"
      style={{ borderColor: item.border }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-md"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={15} weight="fill" />
      </span>
      <h3 className="mt-3 text-[11px] font-bold" style={{ color: item.color }}>
        {item.label}
      </h3>
      <p className="mt-1 text-[14px] font-bold text-[#17213D]">{item.value}</p>
      <p className="mt-1 text-[10px] font-medium text-[#6B7280]">{item.detail}</p>
    </article>
  );
}

function RevenueDetailsModal({
  record,
  onClose,
}: {
  record: (typeof recentFeeCollections)[number] | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!record) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [record, onClose]);

  if (!record) return null;

  const detailItems = [
    { label: "Revenue Source", value: "Student Fees" },
    { label: "Date", value: "23 Oct 2025" },
    { label: "Revenue Title", value: "B.Tech Semester Collection" },
    { label: "Payment Method", value: record.paymentMode },
    { label: "Amount", value: "Rs15,00,000.00", highlight: true },
    { label: "Recorded By", value: "Anuv Shetty" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-8">
      <section className="mx-auto flex max-h-[78vh] w-full max-w-[780px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E6E8EB] px-5 py-4">
          <div>
            <h2 className="text-[18px] font-bold leading-tight text-[#17213D]">
              Revenue Details
            </h2>
            <p className="mt-1 text-[11px] font-semibold text-[#525252]">
              Transaction ID: #REV-2025-1023
            </p>
          </div>
          <button
            type="button"
            aria-label="Close revenue details"
            onClick={onClose}
            className="cursor-pointer text-[#525252] hover:text-[#17213D]"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A9099]">
                Revenue Amount
              </p>
              <p className="mt-3 text-[19px] font-bold leading-tight text-[#08743B]">
                Rs15,00,000
              </p>
            </section>
            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A9099]">
                Revenue Source
              </p>
              <p className="mt-3 text-[17px] font-bold leading-tight text-[#17213D]">
                Student Fees
              </p>
            </section>
            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A9099]">
                Transaction Date
              </p>
              <p className="mt-3 text-[17px] font-bold leading-tight text-[#17213D]">
                23 Oct 2025
              </p>
            </section>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {detailItems.map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-bold text-[#8A9099]">
                      {item.label}
                    </p>
                    <p
                      className={`mt-1 text-[13px] font-bold ${
                        item.highlight ? "text-[#08743B]" : "text-[#17213D]"
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-[#EEF1F4] pt-4">
                <h3 className="text-[14px] font-bold text-[#17213D]">
                  Description
                </h3>
                <div className="mt-3 rounded-md bg-[#F4F5F7] px-4 py-3">
                  <p className="text-[13px] font-medium italic leading-relaxed text-[#525252]">
                    &quot;Semester fee collection received from B.Tech students for
                    the academic year 2025-26.&quot;
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.12)]">
              <div className="mb-4 flex items-center gap-2">
                <Paperclip size={16} weight="bold" className="text-[#08743B]" />
                <h3 className="text-[16px] font-bold text-[#17213D]">
                  Attachments
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Fee Collection Report.pdf", meta: "2.4 MB - PDF Document" },
                  { title: "Transaction Receipt.pdf", meta: "840 KB - PDF Document" },
                ].map((file) => (
                  <article
                    key={file.title}
                    className="rounded-md border border-[#DDE3EA] bg-[#FAFBFC] p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#FFECEC] text-[#FF5757]">
                        <FilePdf size={18} weight="fill" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold leading-tight text-[#17213D]">
                          {file.title}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-[#8A9099]">
                          {file.meta}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="flex h-8 cursor-pointer items-center justify-center gap-1 rounded-md bg-[#F0F2F4] text-[11px] font-bold text-[#525252]"
                      >
                        <Eye size={13} weight="bold" />
                        View
                      </button>
                      <button
                        type="button"
                        className="flex h-8 cursor-pointer items-center justify-center gap-1 rounded-md border border-[#08743B] bg-white text-[11px] font-bold text-[#08743B]"
                      >
                        <DownloadSimple size={13} weight="bold" />
                        Download
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#BFC9D5] text-[12px] font-bold text-[#6B7280]"
              >
                <Plus size={14} weight="bold" />
                Add Attachment
              </button>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

function RecentFeeCollectionsTable() {
  const [selectedRecord, setSelectedRecord] =
    useState<(typeof recentFeeCollections)[number] | null>(null);

  return (
    <>
      <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#17213D]">
            Recent Fee Collections
          </h2>
          <button type="button" className="text-[12px] font-bold text-[#24C96F]">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-left text-[10px] font-bold uppercase tracking-wide text-[#9AA4B2]">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Fee Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentFeeCollections.map((record) => (
                <tr
                  key={`${record.student}-${record.date}`}
                  className="border-b border-[#EEF1F4] text-[12px] font-medium text-[#17213D]"
                >
                  <td className="px-4 py-4 font-bold">{record.student}</td>
                  <td className="px-4 py-4 text-[#6B7280]">{record.feeType}</td>
                  <td className="px-4 py-4 font-bold">{record.amount}</td>
                  <td className="px-4 py-4 text-[#6B7280]">{record.date}</td>
                  <td className="px-4 py-4 text-[#6B7280]">
                    {record.paymentMode}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        aria-label={`View ${record.student}`}
                        onClick={() => setSelectedRecord(record)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-[#E8F8EF] text-[#24C96F]"
                      >
                        <Eye size={14} weight="bold" />
                      </button>
                      <button
                        type="button"
                        aria-label={`More actions for ${record.student}`}
                        className="cursor-pointer text-[#8A9099]"
                      >
                        <DotsThreeVertical size={18} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-medium text-[#8A9099]">
            Showing 1 to 5 of 20 entries
          </p>
          <div className="flex items-center gap-2">
            {["<", "1", "2", "3", "4", ">"].map((page) => (
              <button
                key={page}
                type="button"
                className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[11px] font-bold ${
                  page === "1"
                    ? "bg-[#24C96F] text-white"
                    : "border border-[#E3E8EF] bg-white text-[#6B7280]"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>
      <RevenueDetailsModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </>
  );
}

export function StudentFeesScreen({ onBack }: { onBack: () => void }) {
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <section className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Back to revenue management"
              onClick={onBack}
              className="mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-[#17213D]"
            >
              <CaretLeft size={26} weight="bold" />
            </button>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DDF8E9] text-[#23B66F]">
              <GraduationCap size={22} weight="fill" />
            </span>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#17213D]">
                Student Fees
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#6B7280]">
                Detailed overview of revenue collected from student fee payments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddRevenueOpen(true)}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#24C96F] px-5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(36,201,111,0.25)]"
          >
            <Plus size={14} weight="bold" />
            Add Revenue Record
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {studentFeeStats.map((item) => (
            <StudentFeesStatCard key={item.label} item={item} />
          ))}
        </section>

        <StudentRevenueTrendChart />

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-[#17213D]">
            Fee Type Summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {feeTypeSummary.map((item) => (
              <FeeTypeCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <RecentFeeCollectionsTable />
      </div>
      <AddRevenueRecordModal
        isOpen={isAddRevenueOpen}
        onClose={() => setIsAddRevenueOpen(false)}
      />
    </main>
  );
}

function RecentRevenueRecordsTable() {
  return (
    <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#17213D]">
          Recent Revenue Records
        </h2>
        <button type="button" className="text-[12px] font-bold text-[#24C96F]">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] text-left text-[10px] font-bold uppercase tracking-wide text-[#9AA4B2]">
              <th className="px-4 py-3">Revenue ID</th>
              <th className="px-4 py-3">Revenue Source</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentRevenueRecords.map((record) => (
              <tr
                key={record.id}
                className="border-b border-[#EEF1F4] text-[12px] font-medium text-[#17213D]"
              >
                <td className="px-4 py-4">{record.id}</td>
                <td className="px-4 py-4">{record.source}</td>
                <td className="px-4 py-4 text-[#6B7280]">{record.description}</td>
                <td className="px-4 py-4 font-bold">{record.amount}</td>
                <td className="px-4 py-4 text-[#6B7280]">{record.date}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      aria-label={`View ${record.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E8F8EF] text-[#24C96F]"
                    >
                      <Eye size={14} weight="bold" />
                    </button>
                    <button
                      type="button"
                      aria-label={`More actions for ${record.id}`}
                      className="text-[#8A9099]"
                    >
                      <DotsThreeVertical size={18} weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-medium text-[#8A9099]">
          Showing 1 to 5 of 20 entries
        </p>
        <div className="flex items-center gap-2">
          {["<", "1", "2", "3", "4", ">"].map((page) => (
            <button
              key={page}
              type="button"
              className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[11px] font-bold ${
                page === "1"
                  ? "bg-[#24C96F] text-white"
                  : "border border-[#E3E8EF] bg-white text-[#6B7280]"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function AddRevenueRecordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const inputClass =
    "h-10 rounded-md border border-[#DDE3EA] bg-white px-3 text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#9AA4B2] focus:border-[#24C96F]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-6">
      <section className="mx-auto flex max-h-[calc(100vh-48px)] w-full max-w-[660px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 px-8 py-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#23B66F]">
              <CreditCard size={18} weight="fill" />
            </span>
            <div>
              <h2 className="text-[20px] font-bold leading-tight text-[#17213D]">
                Add Revenue Record
              </h2>
              <p className="mt-1 text-[12px] font-medium text-[#6B7280]">
                Record a new revenue transaction received by the institution.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close add revenue record modal"
            onClick={onClose}
            className="cursor-pointer text-[#8A9099] hover:text-[#17213D]"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <form className="flex-1 overflow-y-auto px-8 pb-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Revenue Source <span className="text-[#E5484D]">*</span>
              </span>
              <select className={`${inputClass} cursor-pointer`}>
                <option value="">Select Revenue Source</option>
                <option value="student-fees">Student Fees</option>
                <option value="hostel-fees">Hostel Fees</option>
                <option value="transport-fees">Transport Fees</option>
                <option value="examination-fees">Examination Fees</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Revenue Title <span className="text-[#E5484D]">*</span>
              </span>
              <input
                type="text"
                placeholder="Enter revenue title"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Amount <span className="text-[#E5484D]">*</span>
              </span>
              <div className="flex h-10 items-center rounded-md border border-[#DDE3EA] bg-white px-3 focus-within:border-[#24C96F]">
                <span className="mr-2 text-[12px] font-semibold text-[#8A9099]">
                  Rs
                </span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#9AA4B2]"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Date Received <span className="text-[#E5484D]">*</span>
              </span>
              <input
                type="date"
                className={inputClass}
                style={{ colorScheme: "light" }}
              />
            </label>
          </div>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Payment Method <span className="text-[#E5484D]">*</span>
            </span>
            <select className={`${inputClass} cursor-pointer`}>
              <option value="">Select payment method</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
          </label>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Description
            </span>
            <div className="rounded-md border border-[#DDE3EA] bg-white px-3 py-3 focus-within:border-[#24C96F]">
              <textarea
                maxLength={500}
                placeholder="Enter details about this revenue transaction..."
                className="min-h-[82px] w-full resize-none bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#9AA4B2]"
              />
              <p className="text-right text-[10px] font-medium text-[#9AA4B2]">
                0 / 500
              </p>
            </div>
          </label>

          <div className="mt-5">
            <p className="text-[12px] font-bold text-[#17213D]">
              Attachment <span className="font-medium text-[#9AA4B2]">(Optional)</span>
            </p>
            <label className="mt-2 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#BFC9D5] bg-white px-4 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                multiple
                className="hidden"
              />
              <UploadSimple size={24} weight="bold" className="text-[#16A765]" />
              <span className="mt-4 text-[12px] font-bold text-[#17213D]">
                Drag and drop files here or{" "}
                <span className="text-[#08743B] underline">click to browse</span>
              </span>
              <span className="mt-1 text-[10px] font-medium text-[#9AA4B2]">
                Supports PDF, JPG, PNG, XLS, XLSX (Max. 10MB each)
              </span>
            </label>
            <p className="mt-2 text-[10px] font-medium text-[#6B7280]">
              You can upload multiple files
            </p>
          </div>
        </form>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-[#EEF1F4] bg-white px-8 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[#E3E8EF] bg-white px-5 text-[12px] font-bold text-[#17213D]"
          >
            <X size={13} weight="bold" />
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 min-w-[230px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#08743B] px-5 text-[12px] font-bold text-white shadow-[0_6px_12px_rgba(8,116,59,0.25)]"
          >
            <Receipt size={13} weight="bold" />
            Save Revenue Record
          </button>
        </footer>
      </section>
    </div>
  );
}

export function RevenueManagementScreen({
  onOpenStudentFees,
  onBack,
}: {
  onOpenStudentFees: () => void;
  onBack: () => void;
}) {
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <section className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Back to analytics overview"
              onClick={onBack}
              className="mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-[#17213D]"
            >
              <CaretLeft size={26} weight="bold" />
            </button>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#17213D]">
                Revenue Management
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#6B7280]">
                Track and monitor all revenue sources and institutional income.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddRevenueOpen(true)}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#24C96F] px-5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(36,201,111,0.25)]"
          >
            <Plus size={14} weight="bold" />
            Add Revenue Record
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {revenueStats.map((item) => (
            <RevenueStatCard key={item.label} item={item} />
          ))}
        </section>

        <RevenueAnalyticsChart />

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-[#17213D]">
            Revenue Sources Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {revenueSourceOverview.map((item, index) => (
              <RevenueSourceCard
                key={item.label}
                item={item}
                onClick={index === 0 ? onOpenStudentFees : undefined}
              />
            ))}
          </div>
        </section>

        <RecentRevenueRecordsTable />
      </div>
      <AddRevenueRecordModal
        isOpen={isAddRevenueOpen}
        onClose={() => setIsAddRevenueOpen(false)}
      />
    </main>
  );
}

export function AnalyticsOverviewScreen({
  onOpenRevenue,
}: {
  onOpenRevenue: () => void;
}) {
  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#17213D]">
              Analytics Overview
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#6B7280]">
              Insights and trends of revenue and expenses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-md border border-[#E3E8EF] bg-white px-4 text-[12px] font-semibold text-[#6B7280]"
            >
              May
              <CaretDown size={12} weight="bold" />
            </button>
            <button
              type="button"
              aria-label="Select date"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E3E8EF] bg-white text-[#17213D]"
            >
              <CalendarBlank size={15} weight="bold" />
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => (
            <StatCard
              key={item.label}
              item={item}
              onClick={index === 0 ? onOpenRevenue : undefined}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <RevenueExpenseChart />
          <ExpensesByCategory />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <RevenueSourcesPanel />
          <MonthlyExpensePanel />
          <RecentTransactionsPanel />
        </section>
      </div>
    </main>
  );
}
