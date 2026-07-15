"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { useUser } from "@/app/utils/context/UserContext";
import {
  type AccountantEducationOption,
  type AccountantRevenueTransaction,
  fetchAccountantEducationOptions,
  fetchAccountantStudentFeeMetrics,
  formatAccountantRevenue,
} from "@/lib/helpers/accountant/accountantRevenueAPI";
import {
  type AccountantExpense,
  type AccountantExpenseSummary,
  fetchAccountantExpenses,
  fetchAccountantExpenseSummary,
} from "@/lib/helpers/accountant/accountantExpensesAPI";
import {
  type CollegeRevenueRecord,
  createCollegeRevenueRecord,
  fetchCollegeRevenueEducationOptions,
  fetchCollegeRevenueMetrics,
} from "@/lib/helpers/accountant/collegeRevenueRecordsAPI";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

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

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const CATEGORY_COLORS = [
  "#438AF6",
  "#43C17A",
  "#FFB020",
  "#6B7DF6",
  "#A64FF2",
  "#F26A2E",
  "#20BFA1",
  "#E34D85",
];

const studentFeeRevenueSource = {
  label: "Student Fees",
  value: "Rs 0",
  color: "#23B66F",
  bg: "#E8F8EF",
  icon: Receipt,
};

type AnalyticsShimmerVariant = "overview" | "revenue" | "studentFees";

function ShimmerLineChart() {
  return (
    <div className="flex h-full w-full flex-col">
      <svg className="flex-1 w-full" viewBox="0 0 800 260" preserveAspectRatio="none">
        {/* Grid lines */}
        {[40, 100, 160, 220].map((y) => (
          <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#F0F2F5" strokeWidth="1" />
        ))}
        
        {/* Line 1 (Green-ish shimmer) */}
        <path
          d="M 20,220 L 120,220 L 220,205 L 320,205 L 420,185 L 520,190 L 620,220 L 720,220"
          fill="none"
          stroke="#DDE5E1"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {[
          { x: 20, y: 220 }, { x: 120, y: 220 }, { x: 220, y: 205 },
          { x: 320, y: 205 }, { x: 420, y: 185 }, { x: 520, y: 190 },
          { x: 620, y: 220 }, { x: 720, y: 220 },
        ].map((pt, i) => (
          <circle key={`p1-${i}`} cx={pt.x} cy={pt.y} r="4" fill="white" stroke="#DDE5E1" strokeWidth="2" />
        ))}

        {/* Line 2 (Red-ish shimmer) */}
        <path
          d="M 20,220 L 120,220 L 220,220 L 320,220 L 420,220 L 520,40 L 620,220 L 720,220"
          fill="none"
          stroke="#E8EBED"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {[
          { x: 20, y: 220 }, { x: 120, y: 220 }, { x: 220, y: 220 },
          { x: 320, y: 220 }, { x: 420, y: 220 }, { x: 520, y: 40 },
          { x: 620, y: 220 }, { x: 720, y: 220 },
        ].map((pt, i) => (
          <circle key={`p2-${i}`} cx={pt.x} cy={pt.y} r="4" fill="white" stroke="#E8EBED" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-4 flex w-full justify-between pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-3 w-8 rounded bg-[#E5E8EB]" />
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPageShimmer({
  variant = "overview",
}: {
  variant?: AnalyticsShimmerVariant;
}) {
  const statCards = variant === "studentFees" ? 3 : 4;

  return (
    <main
      className="min-h-full w-full bg-[#F4F4F4] px-3 py-4 pb-8"
      aria-label="Loading analytics"
      aria-busy="true"
    >
      <div className="mx-auto flex w-full max-w-[1180px] animate-pulse flex-col gap-4">
        <section className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-64 rounded-lg bg-[#E2E6EA]" />
            <div className="h-4 w-80 max-w-[70vw] rounded bg-[#E7EAED]" />
          </div>
          <div className="h-11 w-36 rounded-xl bg-[#E2E6EA]" />
        </section>

        <section
          className={`grid gap-4 md:grid-cols-2 ${
            statCards === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"
          }`}
        >
          {Array.from({ length: statCards }, (_, index) => (
            <div
              key={index}
              className="flex h-[88px] items-center gap-4 rounded-lg bg-white px-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]"
            >
              <div className="h-11 w-11 shrink-0 rounded-lg bg-[#E3E8EC]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-[#E3E8EC]" />
                <div className="h-5 w-32 rounded bg-[#DCE1E5]" />
              </div>
            </div>
          ))}
        </section>

        {variant === "overview" ? (
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div className="h-6 w-56 rounded bg-[#DCE1E5]" />
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-4 rounded-full bg-[#E5E8EB]" />
                    <div className="h-4 w-16 rounded bg-[#E5E8EB]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-4 rounded-full bg-[#E5E8EB]" />
                    <div className="h-4 w-16 rounded bg-[#E5E8EB]" />
                  </div>
                  <div className="h-10 w-32 rounded-xl bg-[#E5E8EB]" />
                </div>
              </div>
              <div className="mt-7 h-[300px] w-full px-5">
                <ShimmerLineChart />
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
              <div className="h-5 w-44 rounded bg-[#DCE1E5]" />
              <div className="mx-auto mt-8 h-40 w-40 rounded-full border-[28px] border-[#E1E6E9]" />
              <div className="mt-7 space-y-4">
                {Array.from({ length: 4 }, (_, row) => (
                  <div key={row} className="h-5 rounded bg-[#EEF0F2]" />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div className="h-6 w-56 rounded bg-[#DCE1E5]" />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-4 rounded-full bg-[#E5E8EB]" />
                  <div className="h-4 w-16 rounded bg-[#E5E8EB]" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-4 rounded-full bg-[#E5E8EB]" />
                  <div className="h-4 w-16 rounded bg-[#E5E8EB]" />
                </div>
                <div className="h-10 w-32 rounded-xl bg-[#E5E8EB]" />
              </div>
            </div>
            <div className="mt-7 h-[260px] w-full px-5">
              <ShimmerLineChart />
            </div>
          </section>
        )}

        {variant === "overview" && (
          <section className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-64 rounded-xl bg-white p-5 shadow-sm">
                <div className="h-5 w-44 rounded bg-[#DCE1E5]" />
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 4 }, (_, row) => (
                    <div key={row} className="h-10 rounded bg-[#EEF0F2]" />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {variant !== "overview" && (
          <>
            <section
              className={`grid gap-4 ${
                variant === "revenue"
                  ? "md:grid-cols-2 xl:grid-cols-4"
                  : "sm:grid-cols-2 xl:grid-cols-5"
              }`}
            >
              {Array.from(
                { length: variant === "revenue" ? 4 : 5 },
                (_, index) => (
                  <div key={index} className="h-28 rounded-xl bg-white p-4 shadow-sm">
                    <div className="h-4 w-28 rounded bg-[#DCE1E5]" />
                    <div className="mt-5 h-5 w-20 rounded bg-[#E7EAED]" />
                  </div>
                ),
              )}
            </section>
            <section className="rounded-xl bg-white p-5 shadow-sm">
              <div className="h-5 w-52 rounded bg-[#DCE1E5]" />
              <div className="mt-6 h-12 rounded bg-[#EEF1F4]" />
              <div className="mt-2 space-y-2">
                {Array.from({ length: 6 }, (_, row) => (
                  <div key={row} className="h-14 rounded bg-[#F2F4F5]" />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

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

function RevenueExpenseChart({
  data,
}: {
  data: Array<{ month: string; revenue: number; expenses: number }>;
}) {
  const [trendPeriod, setTrendPeriod] = useState<
    "monthly" | "quarterly" | "half-yearly" | "yearly"
  >("monthly");
  const displayData = useMemo(() => {
    const sumRange = (start: number, end: number, label: string) =>
      data.slice(start, end).reduce(
        (total, item) => ({
          month: label,
          revenue: total.revenue + item.revenue,
          expenses: total.expenses + item.expenses,
        }),
        { month: label, revenue: 0, expenses: 0 },
      );

    if (trendPeriod === "quarterly") {
      return [
        sumRange(0, 3, "Q1"),
        sumRange(3, 6, "Q2"),
        sumRange(6, 9, "Q3"),
        sumRange(9, 12, "Q4"),
      ];
    }

    if (trendPeriod === "half-yearly") {
      return [sumRange(0, 6, "H1"), sumRange(6, 12, "H2")];
    }

    if (trendPeriod === "yearly") {
      return [sumRange(0, 12, String(new Date().getFullYear()))];
    }

    return data;
  }, [data, trendPeriod]);
  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: displayData,
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
          label: { enabled: false },
          gridLine: { enabled: true, style: [{ stroke: "#EEF1F4" }] },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [displayData],
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
          <div className="relative">
            <select
              aria-label="Select trend period"
              value={trendPeriod}
              onChange={(event) =>
                setTrendPeriod(
                  event.target.value as
                    | "monthly"
                    | "quarterly"
                    | "half-yearly"
                    | "yearly",
                )
              }
              className="h-9 cursor-pointer appearance-none rounded-lg border border-[#E3E8EF] bg-white py-1 pl-4 pr-9 text-[12px] font-semibold text-[#17213D] outline-none focus:border-[#43C17A]"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
            <CaretDown
              size={12}
              weight="bold"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#17213D]"
            />
          </div>
        </div>
      </div>
      <div className="custom-scrollbar mt-5 overflow-x-auto pb-2">
        <div
          className="h-[300px]"
          style={{
            minWidth:
              trendPeriod === "monthly"
                ? 820
                : trendPeriod === "quarterly"
                  ? 480
                  : trendPeriod === "half-yearly"
                    ? 320
                    : 280,
          }}
        >
          <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </section>
  );
}

function ExpensesByCategory({
  totalExpenses,
  categories,
}: {
  totalExpenses: number;
  categories: Array<{ category: string; amount: number }>;
}) {
  const [isShowingAll, setIsShowingAll] = useState(false);
  const categorySegments = categories.reduce<
    Array<{ label: string; value: string; color: string; start: number; end: number }>
  >((segments, category, index) => {
    const start = segments.at(-1)?.end ?? 0;
    const percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0;

    segments.push({
      label: category.category,
      value: formatAccountantRevenue(category.amount),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      start,
      end: start + percentage,
    });

    return segments;
  }, []);
  const donutBackground =
    categorySegments.length > 0
      ? `conic-gradient(${categorySegments
          .map(
            (segment) =>
              `${segment.color} ${segment.start}% ${segment.end}%`,
          )
          .join(", ")})`
      : "#EAF8F0";

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <h2 className="text-[15px] font-bold text-[#17213D]">Expenses by Category</h2>
      <div className="mt-7 flex justify-center">
        <div
          className="relative flex h-40 w-40 items-center justify-center rounded-full"
          style={{ background: donutBackground }}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
            <span className="text-[9px] font-bold tracking-wide text-[#8A9099]">
              TOTAL
            </span>
            <span className="mt-1 text-[18px] font-bold text-[#17213D]">
              {formatAccountantRevenue(totalExpenses)}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`mt-7 ${
          isShowingAll
            ? "custom-scrollbar flex gap-3 overflow-x-auto pb-2"
            : "space-y-3"
        }`}
      >
        {(isShowingAll ? categorySegments : categorySegments.slice(0, 4)).map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 ${
              isShowingAll
                ? "min-w-[210px] rounded-lg border border-[#E8ECF1] bg-[#FAFBFC] px-3 py-3"
                : ""
            }`}
          >
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
        onClick={() => setIsShowingAll((current) => !current)}
        className="mt-5 h-10 w-full cursor-pointer rounded-lg bg-[#F4F6F8] text-[12px] font-semibold text-[#17213D]"
      >
        {isShowingAll ? "Show Top Categories" : "View All Categories"}
      </button>
    </section>
  );
}

function PanelHeader({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-bold text-[#17213D]">{title}</h2>
    </div>
  );
}

function RevenueSourcesPanel({
  totalRevenue,
  isLoading,
}: {
  totalRevenue: number;
  isLoading: boolean;
}) {
  const studentFees = {
    ...studentFeeRevenueSource,
    value: isLoading ? "Loading..." : formatAccountantRevenue(totalRevenue),
  };

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Top Revenue Sources" />
      <div className="mb-3 flex text-[9px] font-bold uppercase tracking-wide text-[#A0A7B2]">
        <span className="flex-1">Source</span>
        <span>Amount</span>
      </div>
      <div className="custom-scrollbar h-[250px] space-y-4 overflow-y-scroll pr-2">
        <RevenueSourceRow item={studentFees} />
      </div>
    </section>
  );
}

function RevenueSourceRow({ item }: { item: typeof studentFeeRevenueSource }) {
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

function MonthlyExpensePanel({
  expenses,
  isLoading,
}: {
  expenses: number[];
  isLoading: boolean;
}) {
  const year = new Date().getFullYear();
  const rows = expenses
    .map((amount, monthIndex) => ({
      month: new Intl.DateTimeFormat("en-IN", {
        month: "short",
        year: "numeric",
      }).format(new Date(year, monthIndex, 1)),
      amount,
      monthIndex,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.monthIndex - a.monthIndex);

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Monthly Expense Breakdown" />
      <div className="mb-4 flex text-[9px] font-bold uppercase tracking-wide text-[#A0A7B2]">
        <span className="flex-1">Month</span>
        <span>Amount</span>
      </div>
      <div className="custom-scrollbar h-[250px] space-y-5 overflow-y-scroll pr-2">
        {rows.map((item) => (
          <div key={item.month} className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#525252]">
              {item.month}
            </span>
            <span className="text-[12px] font-bold text-[#17213D]">
              {formatAccountantRevenue(item.amount)}
            </span>
          </div>
        ))}
        {!isLoading && rows.length === 0 && (
          <p className="py-8 text-center text-[12px] font-medium text-[#8A9099]">
            No expenses recorded this year.
          </p>
        )}
        {isLoading && (
          <p className="py-8 text-center text-[12px] font-medium text-[#8A9099]">
            Loading expenses...
          </p>
        )}
      </div>
    </section>
  );
}

type OverviewTransaction = {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  amount: number;
  type: "REVENUE" | "EXPENSE";
};

function RecentTransactionsPanel({
  transactions,
  isLoading,
}: {
  transactions: OverviewTransaction[];
  isLoading: boolean;
}) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Recent Transactions" />
      <div className="custom-scrollbar h-[250px] space-y-4 overflow-y-scroll pr-2">
        {transactions.map((item) => {
          const isRevenue = item.type === "REVENUE";
          const Icon = isRevenue ? ArrowDown : ArrowUp;

          return (
            <div key={item.id} className="flex items-center gap-3">
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
                  {isRevenue ? "+ " : "- "}
                  {formatAccountantRevenue(item.amount)}
                </p>
                <p className="mt-0.5 text-[8px] font-bold text-[#A0A7B2]">
                  {item.type}
                </p>
              </div>
            </div>
          );
        })}
        {!isLoading && transactions.length === 0 && (
          <p className="py-8 text-center text-[12px] font-medium text-[#8A9099]">
            No recent transactions found.
          </p>
        )}
        {isLoading && (
          <p className="py-8 text-center text-[12px] font-medium text-[#8A9099]">
            Loading transactions...
          </p>
        )}
      </div>
    </section>
  );
}

function RevenueAnalyticsChart({
  monthlyRevenue,
}: {
  monthlyRevenue: number[];
}) {
  const [period, setPeriod] = useState<
    "monthly" | "quarterly" | "half-yearly" | "yearly"
  >("monthly");
  const currentYear = new Date().getFullYear();
  const chartData = useMemo(() => {
    const monthlyData = MONTH_LABELS.map((month, index) => ({
      month: month.slice(0, 1) + month.slice(1).toLowerCase(),
      amount: monthlyRevenue[index] ?? 0,
    }));
    const sumRange = (start: number, end: number, month: string) => ({
      month,
      amount: monthlyRevenue
        .slice(start, end)
        .reduce((total, amount) => total + amount, 0),
    });
    const periodData =
      period === "quarterly"
        ? [
            sumRange(0, 3, "Q1"),
            sumRange(3, 6, "Q2"),
            sumRange(6, 9, "Q3"),
            sumRange(9, 12, "Q4"),
          ]
        : period === "half-yearly"
          ? [sumRange(0, 6, "H1"), sumRange(6, 12, "H2")]
          : period === "yearly"
            ? [sumRange(0, 12, String(currentYear))]
            : monthlyData;

    return periodData.map((item, index) => ({
      ...item,
      fill:
        period === "monthly" && index === new Date().getMonth()
          ? "#1EC95F"
          : "#52CD82",
      displayAmount: formatAccountantRevenue(item.amount),
    }));
  }, [currentYear, monthlyRevenue, period]);
  const maxChartAmount = Math.max(
    0,
    ...chartData.map((item) => item.amount),
  );
  const chartScaleStep = 400_000;
  const chartMaximum = Math.max(
    chartScaleStep,
    Math.ceil(maxChartAmount / chartScaleStep) * chartScaleStep,
  );
  const chartHeight =
    maxChartAmount > chartScaleStep
      ? Math.min(
          900,
          260 +
            (Math.ceil(maxChartAmount / chartScaleStep) - 1) * 55,
        )
      : 260;

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
              title:
                period === "yearly"
                  ? String(currentYear)
                  : `${datum.month} ${currentYear}`,
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
          max: chartMaximum,
          interval: { step: chartScaleStep },
          label: {
            color: "#17213D",
            fontSize: 11,
            formatter: ({ value }) => formatAccountantRevenue(Number(value)),
          },
          gridLine: { enabled: false },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [chartData, chartMaximum, currentYear, period],
  );

  return (
    <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.16)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-[#17213D]">Revenue Analytics</h2>
        <div className="flex items-center gap-4">
          <div className="flex rounded-full bg-[#F0F2F4] p-1 text-[10px] font-semibold text-[#6B7280]">
            {[
              ["monthly", "Monthly"],
              ["quarterly", "Quarterly"],
              ["half-yearly", "Half-Yearly"],
              ["yearly", "Yearly"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setPeriod(
                    value as
                      | "monthly"
                      | "quarterly"
                      | "half-yearly"
                      | "yearly",
                  )
                }
                className={`cursor-pointer rounded-full px-5 py-2 ${
                  period === value ? "bg-[#24C96F] text-white" : ""
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="flex h-9 items-center rounded-full bg-[#F0F2F4] px-4 text-[12px] font-semibold text-[#17213D]">
            {currentYear}
          </span>
        </div>
      </div>
      <div
        className={`mt-5 h-[260px] ${
          maxChartAmount > chartScaleStep
            ? "custom-scrollbar overflow-y-auto pr-1"
            : "overflow-hidden"
        }`}
      >
        <div style={{ height: chartHeight }}>
          <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
        </div>
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
          <div className="flex flex-wrap items-center justify-end gap-3">
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
  const { loading: userLoading } = useUser();
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);

  if (userLoading) {
    return <AnalyticsPageShimmer variant="studentFees" />;
  }

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

type RevenueTableRecord = {
  id: string;
  source: string;
  description: string;
  amount: number;
  date: string;
};

function RecentRevenueRecordsTable({
  records,
  isLoading,
}: {
  records: RevenueTableRecord[];
  isLoading: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleRecords = records.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  return (
    <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
      <div className="mb-4">
        <h2 className="text-[16px] font-bold text-[#17213D]">
          Recent Revenue Records
        </h2>
      </div>
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#F8FAFC] text-left text-[10px] font-bold uppercase tracking-wide text-[#9AA4B2]">
              <th className="px-4 py-3">Revenue Source</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record) => (
              <tr
                key={record.id}
                className="border-b border-[#EEF1F4] text-[12px] font-medium text-[#17213D]"
              >
                <td className="px-4 py-4">{record.source}</td>
                <td className="px-4 py-4 text-[#6B7280]">
                  {record.description}
                </td>
                <td className="px-4 py-4 font-bold">
                  {formatAccountantRevenue(record.amount)}
                </td>
                <td className="px-4 py-4 text-[#6B7280]">
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(record.date))}
                </td>
              </tr>
            ))}
            {!isLoading && visibleRecords.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[#8A9099]">
                  No revenue records found.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[#8A9099]">
                  Loading revenue records...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={safeCurrentPage}
        totalItems={records.length}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 50]}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        disabled={isLoading}
        roundedBottom="rounded-b-xl"
      />
    </section>
  );
}

function AddRevenueRecordModal({
  isOpen,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void | Promise<void>;
}) {
  const { accountantId, collegeId, userId } = useUser();
  const [educationOptions, setEducationOptions] = useState<
    AccountantEducationOption[]
  >([]);
  const [selectedEducationIds, setSelectedEducationIds] = useState<number[]>([]);
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const [revenueSource, setRevenueSource] = useState("");
  const [revenueTitle, setRevenueTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isEducationLoading, setIsEducationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const educationDropdownRef = useRef<HTMLDivElement>(null);
  const selectedEducations = educationOptions.filter((education) =>
    selectedEducationIds.includes(education.collegeEducationId),
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;
    const loadEducationOptions = async () => {
      setIsEducationLoading(true);
      setFormError("");

      try {
        const options = await fetchCollegeRevenueEducationOptions(
          accountantId,
          collegeId,
        );
        if (!isCurrent) return;
        setEducationOptions(options);
        setSelectedEducationIds((current) => {
          const validIds = current.filter((id) =>
            options.some((option) => option.collegeEducationId === id),
          );
          return validIds.length > 0
            ? validIds
            : options.length === 1
              ? [options[0].collegeEducationId]
              : [];
        });
      } catch (error) {
        console.error("Unable to load revenue education types", error);
        if (isCurrent) {
          setEducationOptions([]);
          setSelectedEducationIds([]);
          setFormError("Unable to load assigned education types.");
        }
      } finally {
        if (isCurrent) setIsEducationLoading(false);
      }
    };

    void loadEducationOptions();
    return () => {
      isCurrent = false;
    };
  }, [accountantId, collegeId, isOpen]);

  useEffect(() => {
    if (!isEducationDropdownOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        educationDropdownRef.current &&
        !educationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEducationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isEducationDropdownOpen]);

  const resetForm = () => {
    setSelectedEducationIds([]);
    setIsEducationDropdownOpen(false);
    setRevenueSource("");
    setRevenueTitle("");
    setAmount("");
    setDateReceived("");
    setPaymentMethod("");
    setDescription("");
    setAttachments([]);
    setFormError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!collegeId || !userId) {
      setFormError("Unable to identify the current accountant and college.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCollegeRevenueRecord({
        revenueSource,
        revenueTitle,
        amount: Number(amount),
        dateReceived,
        paymentMethod,
        description,
        collegeId,
        collegeEducationIds: selectedEducationIds,
        createdBy: userId,
        attachments,
      });
      await onSaved?.();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Unable to save revenue record", error);
      setFormError(
        error instanceof Error ? error.message : "Unable to save revenue record.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (size: number) =>
    size >= 1024 * 1024
      ? `${(size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(size / 1024))} KB`;

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const uniqueFiles = selectedFiles.filter(
      (file) =>
        !attachments.some(
          (current) =>
            current.name === file.name &&
            current.size === file.size &&
            current.lastModified === file.lastModified,
        ),
    );

    if (attachments.length + uniqueFiles.length > 5) {
      setFormError("You can upload a maximum of 5 attachments.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setAttachments((current) => [...current, ...uniqueFiles]);
    event.target.value = "";
  };

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
            onClick={handleClose}
            className="cursor-pointer text-[#8A9099] hover:text-[#17213D]"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <form
          id="add-revenue-record-form"
          onSubmit={handleSubmit}
          className="custom-scrollbar flex-1 overflow-y-auto px-8 pb-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Revenue Source <span className="text-[#E5484D]">*</span>
              </span>
              <select
                required
                value={revenueSource}
                onChange={(event) => setRevenueSource(event.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Select Revenue Source</option>
                <option value="Student Fees">Student Fees</option>
                <option value="Hostel Fees">Hostel Fees</option>
                <option value="Transport Fees">Transport Fees</option>
                <option value="Examination Fees">Examination Fees</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <div
              ref={educationDropdownRef}
              className="relative flex flex-col gap-2"
            >
              <span className="text-[12px] font-bold text-[#17213D]">
                Education Type <span className="text-[#E5484D]">*</span>
              </span>
              <div
                role="button"
                tabIndex={
                  isEducationLoading || educationOptions.length === 0 ? -1 : 0
                }
                aria-haspopup="listbox"
                aria-expanded={isEducationDropdownOpen}
                aria-disabled={isEducationLoading || educationOptions.length === 0}
                onClick={() => {
                  if (!isEducationLoading && educationOptions.length > 0) {
                    setIsEducationDropdownOpen((current) => !current);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (!isEducationLoading && educationOptions.length > 0) {
                      setIsEducationDropdownOpen((current) => !current);
                    }
                  }
                }}
                className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-[#DDE3EA] bg-white px-3 py-1 text-left text-[12px] font-medium text-[#17213D] outline-none focus:border-[#24C96F] aria-disabled:cursor-not-allowed aria-disabled:bg-[#F4F5F7] aria-disabled:opacity-60"
              >
                {selectedEducations.length > 0 ? (
                  <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                    {selectedEducations.map((education) => (
                      <span
                        key={education.collegeEducationId}
                        className="flex max-w-full items-center gap-1.5 rounded-full bg-[#DFF3E7] py-1 pl-2.5 pr-1 text-[11px] font-bold text-[#086C20]"
                      >
                        <span className="truncate">
                          {education.collegeEducationType}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${education.collegeEducationType}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedEducationIds((current) =>
                              current.filter(
                                (id) => id !== education.collegeEducationId,
                              ),
                            );
                          }}
                          className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[#BFE5CC]"
                        >
                          <X size={10} weight="bold" />
                        </button>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="truncate">
                    {isEducationLoading
                      ? "Loading education types..."
                      : educationOptions.length > 0
                        ? "Select an education type"
                        : "No assigned education types"}
                  </span>
                )}
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`shrink-0 transition-transform ${
                    isEducationDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isEducationDropdownOpen && (
                <div
                  role="listbox"
                  aria-multiselectable="true"
                  className="custom-scrollbar absolute left-0 right-0 top-full z-40 mt-1 max-h-48 overflow-y-auto rounded-md border border-[#DDE3EA] bg-white p-1 shadow-[0_8px_20px_rgba(15,23,42,0.16)]"
                >
                  {educationOptions.map((education) => {
                    const isSelected = selectedEducationIds.includes(
                      education.collegeEducationId,
                    );

                    return (
                      <button
                        key={education.collegeEducationId}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() =>
                          setSelectedEducationIds((current) =>
                            isSelected
                              ? current.filter(
                                  (id) =>
                                    id !== education.collegeEducationId,
                                )
                              : [...current, education.collegeEducationId],
                          )
                        }
                        className={`block w-full cursor-pointer rounded px-3 py-2 text-left text-[12px] font-medium hover:bg-[#EAF6EE] ${
                          isSelected
                            ? "bg-[#DFF3E7] font-bold text-[#086C20]"
                            : "text-[#17213D]"
                        }`}
                      >
                        {education.collegeEducationType}
                      </button>
                    );
                  })}
                </div>
              )}
              <span className="text-[10px] font-medium text-[#6B7280]">
                Select assigned education types. Use X to remove them.
              </span>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#17213D]">
                Revenue Title <span className="text-[#E5484D]">*</span>
              </span>
              <input
                type="text"
                required
                minLength={3}
                maxLength={255}
                value={revenueTitle}
                onChange={(event) => setRevenueTitle(event.target.value)}
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
                  required
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  onWheel={(event) => event.currentTarget.blur()}
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
                required
                value={dateReceived}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) => setDateReceived(event.target.value)}
                className={inputClass}
                style={{ colorScheme: "light" }}
              />
            </label>
          </div>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Payment Method <span className="text-[#E5484D]">*</span>
            </span>
            <select
              required
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select payment method</option>
              <option value="UPI">UPI</option>
              <option value="Cash">By Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Card">Card</option>
            </select>
          </label>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Description
            </span>
            <div className="rounded-md border border-[#DDE3EA] bg-white px-3 py-3 focus-within:border-[#24C96F]">
              <textarea
                maxLength={255}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter details about this revenue transaction..."
                className="min-h-[82px] w-full resize-none bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#9AA4B2]"
              />
              <p className="text-right text-[10px] font-medium text-[#9AA4B2]">
                {description.length} / 255
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
                onChange={handleAttachmentChange}
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
              {attachments.length > 0 && (
                <span className="mt-2 text-[10px] font-bold text-[#08743B]">
                  {attachments.length} file{attachments.length === 1 ? "" : "s"} selected
                </span>
              )}
            </label>
            <p className="mt-2 text-[10px] font-medium text-[#6B7280]">
              You can upload multiple files
            </p>
            {attachments.length > 0 && (
              <ul className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-[#DCE5DC] bg-[#F7FAF8] px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText
                        size={18}
                        weight="fill"
                        className="shrink-0 text-[#147A3D]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold text-[#17213D]">
                          {file.name}
                        </span>
                        <span className="block text-[10px] text-[#6B7280]">
                          {formatFileSize(file.size)}
                        </span>
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter(
                            (_, fileIndex) => fileIndex !== index,
                          ),
                        )
                      }
                      className="shrink-0 cursor-pointer rounded-full p-1 text-[#D14343] hover:bg-red-50"
                    >
                      <X size={15} weight="bold" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {formError && (
            <p role="alert" className="mt-4 text-[12px] font-semibold text-red-600">
              {formError}
            </p>
          )}
        </form>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-[#EEF1F4] bg-white px-8 py-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-10 min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[#E3E8EF] bg-white px-5 text-[12px] font-bold text-[#17213D]"
          >
            <X size={13} weight="bold" />
            Cancel
          </button>
          <button
            type="submit"
            form="add-revenue-record-form"
            disabled={
              isSubmitting ||
              isEducationLoading ||
              educationOptions.length === 0 ||
              selectedEducationIds.length === 0
            }
            className="flex h-10 min-w-[230px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#08743B] px-5 text-[12px] font-bold text-white shadow-[0_6px_12px_rgba(8,116,59,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Receipt size={13} weight="bold" />
            {isSubmitting ? "Saving..." : "Save Revenue Record"}
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
  const { accountantId, collegeId, loading: userLoading } = useUser();
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);
  const [educationOptions, setEducationOptions] = useState<
    AccountantEducationOption[]
  >([]);
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    null,
  );
  const [isEducationLoading, setIsEducationLoading] = useState(true);
  const [isRevenueLoading, setIsRevenueLoading] = useState(true);
  const [revenueRefreshKey, setRevenueRefreshKey] = useState(0);
  const [revenueMetrics, setRevenueMetrics] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    monthlyRevenue: Array<number>(12).fill(0),
    sourceBreakdown: [] as Array<{
      source: string;
      amount: number;
      transactionCount: number;
    }>,
    recentRecords: [] as RevenueTableRecord[],
  });

  useEffect(() => {
    if (userLoading) return;

    let isCurrent = true;

    const loadEducationOptions = async () => {
      setIsEducationLoading(true);

      try {
        const options = await fetchAccountantEducationOptions(
          accountantId,
          collegeId,
        );
        if (!isCurrent) return;

        setEducationOptions(options);
        setSelectedEducationId((currentId) =>
          currentId !== null &&
          options.some((option) => option.collegeEducationId === currentId)
            ? currentId
            : null,
        );
      } catch (error) {
        console.error("Unable to load revenue education types", error);
        if (isCurrent) {
          setEducationOptions([]);
          setSelectedEducationId(null);
        }
      } finally {
        if (isCurrent) setIsEducationLoading(false);
      }
    };

    void loadEducationOptions();

    return () => {
      isCurrent = false;
    };
  }, [accountantId, collegeId, userLoading]);

  useEffect(() => {
    if (userLoading || isEducationLoading) return;

    let isCurrent = true;

    const loadRevenue = async () => {
      setIsRevenueLoading(true);

      try {
        const educationIds = selectedEducationId
          ? [selectedEducationId]
          : educationOptions.map(
              (education) => education.collegeEducationId,
            );
        const [studentFeeMetrics, collegeRevenueMetrics] = await Promise.all([
          fetchAccountantStudentFeeMetrics(
            accountantId,
            collegeId,
            selectedEducationId,
          ),
          fetchCollegeRevenueMetrics(collegeId, educationIds),
        ]);
        if (isCurrent) {
          const sources = new Map<
            string,
            { source: string; amount: number; transactionCount: number }
          >();
          const addSource = (
            source: string,
            amount: number,
            transactionCount: number,
          ) => {
            const key = source.trim().toLocaleLowerCase("en-IN");
            const current = sources.get(key);
            sources.set(key, {
              source: current?.source ?? source,
              amount: (current?.amount ?? 0) + amount,
              transactionCount:
                (current?.transactionCount ?? 0) + transactionCount,
            });
          };

          if (
            studentFeeMetrics.totalRevenue > 0 ||
            studentFeeMetrics.transactionCount > 0
          ) {
            addSource(
              "Student Fees",
              studentFeeMetrics.totalRevenue,
              studentFeeMetrics.transactionCount,
            );
          }
          collegeRevenueMetrics.sourceBreakdown.forEach((source) =>
            addSource(source.source, source.amount, source.transactionCount),
          );

          setRevenueMetrics({
            totalRevenue:
              studentFeeMetrics.totalRevenue +
              collegeRevenueMetrics.totalRevenue,
            transactionCount:
              studentFeeMetrics.transactionCount +
              collegeRevenueMetrics.transactionCount,
            monthlyRevenue: studentFeeMetrics.monthlyRevenue.map(
              (amount, index) =>
                amount + (collegeRevenueMetrics.monthlyRevenue[index] ?? 0),
            ),
            sourceBreakdown: Array.from(sources.values()).sort(
              (a, b) => b.amount - a.amount,
            ),
            recentRecords: [
              ...studentFeeMetrics.recentTransactions.map((record) => ({
                id: `student-fee-${record.id}`,
                source: "Student Fees",
                description: "Student fee collection",
                amount: record.amount,
                date: record.date,
              })),
              ...collegeRevenueMetrics.recentRecords.map(
                (record: CollegeRevenueRecord) => ({
                  id: `college-revenue-${record.collegeRevenueRecordsId}`,
                  source: record.revenueSource,
                  description: record.revenueTitle,
                  amount: record.amount,
                  date: record.dateReceived,
                }),
              ),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 20),
          });
        }
      } catch (error) {
        console.error("Unable to load revenue management data", error);
        if (isCurrent) {
          setRevenueMetrics({
            totalRevenue: 0,
            transactionCount: 0,
            monthlyRevenue: Array<number>(12).fill(0),
            sourceBreakdown: [],
            recentRecords: [],
          });
        }
      } finally {
        if (isCurrent) setIsRevenueLoading(false);
      }
    };

    void loadRevenue();

    return () => {
      isCurrent = false;
    };
  }, [
    accountantId,
    collegeId,
    educationOptions,
    isEducationLoading,
    revenueRefreshKey,
    selectedEducationId,
    userLoading,
  ]);

  const currentMonth = new Date().getMonth();
  const currentMonthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date());
  const dynamicRevenueStats = revenueStats.map((item, index) => {
    if (isRevenueLoading) return { ...item, value: "Loading..." };

    if (index === 0) {
      return { ...item, value: formatAccountantRevenue(revenueMetrics.totalRevenue) };
    }
    if (index === 1) {
      return {
        ...item,
        value: formatAccountantRevenue(
          revenueMetrics.monthlyRevenue[currentMonth] ?? 0,
        ),
        detail: currentMonthLabel,
      };
    }
    if (index === 2) {
      return {
        ...item,
        value: revenueMetrics.sourceBreakdown.length.toLocaleString("en-IN"),
      };
    }

    return {
      ...item,
      value: revenueMetrics.transactionCount.toLocaleString("en-IN"),
    };
  });
  const dynamicRevenueSources = revenueMetrics.sourceBreakdown.map(
    (source, index) => ({
      ...revenueSourceOverview[index % revenueSourceOverview.length],
      label: source.source,
      totalRevenue: formatAccountantRevenue(source.amount),
      transactions: source.transactionCount.toLocaleString("en-IN"),
    }),
  );

  if (userLoading || isEducationLoading || isRevenueLoading) {
    return <AnalyticsPageShimmer variant="revenue" />;
  }

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
          <div className="flex flex-wrap items-center justify-end gap-3">
            {educationOptions.length > 0 && (
              <div className="relative">
                <select
                  aria-label="Select education type for revenue management"
                  value={selectedEducationId ?? "all"}
                  onChange={(event) =>
                    setSelectedEducationId(
                      event.target.value === "all"
                        ? null
                        : Number(event.target.value),
                    )
                  }
                  className="h-11 min-w-[145px] cursor-pointer appearance-none rounded-xl border border-[#E3E8EF] bg-white py-2 pl-5 pr-11 text-[14px] font-bold text-[#17213D] shadow-[0_3px_10px_rgba(15,23,42,0.12)] outline-none focus:border-[#714EF2]"
                >
                  <option value="all">All</option>
                  {educationOptions.map((education) => (
                    <option
                      key={education.collegeEducationId}
                      value={education.collegeEducationId}
                    >
                      {education.collegeEducationType}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={17}
                  weight="bold"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#714EF2]"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsAddRevenueOpen(true)}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#24C96F] px-5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(36,201,111,0.25)]"
            >
              <Plus size={14} weight="bold" />
              Add Revenue Record
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dynamicRevenueStats.map((item) => (
            <RevenueStatCard key={item.label} item={item} />
          ))}
        </section>

        <RevenueAnalyticsChart monthlyRevenue={revenueMetrics.monthlyRevenue} />

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-[#17213D]">
            Revenue Sources Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dynamicRevenueSources.map((source) => (
              <RevenueSourceCard
                key={source.label}
                item={source}
                onClick={
                  source.label.toLocaleLowerCase("en-IN") === "student fees"
                    ? onOpenStudentFees
                    : undefined
                }
              />
            ))}
            {!isRevenueLoading && dynamicRevenueSources.length === 0 && (
              <p className="py-8 text-sm font-medium text-[#8A9099]">
                No revenue sources found.
              </p>
            )}
          </div>
        </section>

        <RecentRevenueRecordsTable
          records={revenueMetrics.recentRecords}
          isLoading={isRevenueLoading}
        />
      </div>
      <AddRevenueRecordModal
        isOpen={isAddRevenueOpen}
        onClose={() => setIsAddRevenueOpen(false)}
        onSaved={() => setRevenueRefreshKey((current) => current + 1)}
      />
    </main>
  );
}

export function AnalyticsOverviewScreen({
  onOpenRevenue,
}: {
  onOpenRevenue: () => void;
}) {
  const {
    accountantId,
    collegeId,
    loading: userLoading,
  } = useUser();
  const [educationOptions, setEducationOptions] = useState<
    AccountantEducationOption[]
  >([]);
  const [isEducationOptionsLoading, setIsEducationOptionsLoading] =
    useState(true);
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    null,
  );
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [studentFeeRevenue, setStudentFeeRevenue] = useState(0);
  const [feeTransactionCount, setFeeTransactionCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(
    Array<number>(12).fill(0),
  );
  const [recentRevenueTransactions, setRecentRevenueTransactions] = useState<
    AccountantRevenueTransaction[]
  >([]);
  const [recentExpenses, setRecentExpenses] = useState<AccountantExpense[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [isRevenueLoading, setIsRevenueLoading] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState<AccountantExpenseSummary>({
    totalExpenses: 0,
    transactionCount: 0,
    topCategory: "-",
    monthlyExpenses: Array<number>(12).fill(0),
    categoryBreakdown: [],
  });
  const [isExpenseSummaryLoading, setIsExpenseSummaryLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    let isCurrent = true;

    const loadEducationOptions = async () => {
      setIsEducationOptionsLoading(true);

      try {
        const options = await fetchAccountantEducationOptions(
          accountantId,
          collegeId,
        );

        if (!isCurrent) return;

        setEducationOptions(options);
        setSelectedEducationId((currentId) =>
          currentId !== null &&
          options.some(
            (option) => option.collegeEducationId === currentId,
          )
            ? currentId
            : null,
        );

        if (options.length === 0) {
          setTotalRevenue(0);
          setStudentFeeRevenue(0);
          setFeeTransactionCount(0);
          setMonthlyRevenue(Array<number>(12).fill(0));
          setRecentRevenueTransactions([]);
          setRecentExpenses([]);
          setIsRevenueLoading(false);
          setIsExpenseSummaryLoading(false);
        }
      } catch (error) {
        console.error("Unable to load accountant education types", error);
        if (isCurrent) {
          setEducationOptions([]);
          setSelectedEducationId(null);
          setTotalRevenue(0);
          setStudentFeeRevenue(0);
          setFeeTransactionCount(0);
          setMonthlyRevenue(Array<number>(12).fill(0));
          setRecentRevenueTransactions([]);
          setRecentExpenses([]);
          setIsRevenueLoading(false);
          setIsExpenseSummaryLoading(false);
        }
      } finally {
        if (isCurrent) setIsEducationOptionsLoading(false);
      }
    };

    void loadEducationOptions();

    return () => {
      isCurrent = false;
    };
  }, [accountantId, collegeId, userLoading]);

  useEffect(() => {
    if (userLoading || educationOptions.length === 0) return;

    let isCurrent = true;

    const loadExpenseSummary = async () => {
      setIsExpenseSummaryLoading(true);

      try {
        const educationIds = selectedEducationId
          ? [selectedEducationId]
          : educationOptions.map(
              (education) => education.collegeEducationId,
            );
        const [summary, recentExpenseResult] = await Promise.all([
          fetchAccountantExpenseSummary(collegeId, educationIds),
          fetchAccountantExpenses({
            collegeId: Number(collegeId),
            collegeEducationIds: educationIds,
            page: 1,
            itemsPerPage: 20,
          }),
        ]);
        if (isCurrent) {
          setExpenseSummary(summary);
          setRecentExpenses(recentExpenseResult.data);
        }
      } catch (error) {
        console.error("Unable to load accountant expense summary", error);
        if (isCurrent) {
          setExpenseSummary({
            totalExpenses: 0,
            transactionCount: 0,
            topCategory: "-",
            monthlyExpenses: Array<number>(12).fill(0),
            categoryBreakdown: [],
          });
          setRecentExpenses([]);
        }
      } finally {
        if (isCurrent) setIsExpenseSummaryLoading(false);
      }
    };

    void loadExpenseSummary();

    return () => {
      isCurrent = false;
    };
  }, [collegeId, educationOptions, selectedEducationId, userLoading]);

  useEffect(() => {
    if (userLoading || educationOptions.length === 0) return;

    let isCurrent = true;

    const loadRevenue = async () => {
      setIsRevenueLoading(true);

      try {
        const educationIds = selectedEducationId
          ? [selectedEducationId]
          : educationOptions.map(
              (education) => education.collegeEducationId,
            );
        const [metrics, collegeRevenueMetrics] = await Promise.all([
          fetchAccountantStudentFeeMetrics(
            accountantId,
            collegeId,
            selectedEducationId,
          ),
          fetchCollegeRevenueMetrics(collegeId, educationIds),
        ]);

        if (isCurrent) {
          setStudentFeeRevenue(metrics.totalRevenue);
          setTotalRevenue(
            metrics.totalRevenue + collegeRevenueMetrics.totalRevenue,
          );
          setFeeTransactionCount(
            metrics.transactionCount + collegeRevenueMetrics.transactionCount,
          );
          setMonthlyRevenue(
            metrics.monthlyRevenue.map(
              (amount, index) =>
                amount + (collegeRevenueMetrics.monthlyRevenue[index] ?? 0),
            ),
          );
          setRecentRevenueTransactions(metrics.recentTransactions);
        }
      } catch (error) {
        console.error("Unable to load accountant student-fee revenue", error);
        if (isCurrent) {
          setTotalRevenue(0);
          setStudentFeeRevenue(0);
          setFeeTransactionCount(0);
          setMonthlyRevenue(Array<number>(12).fill(0));
          setRecentRevenueTransactions([]);
        }
      } finally {
        if (isCurrent) setIsRevenueLoading(false);
      }
    };

    void loadRevenue();

    return () => {
      isCurrent = false;
    };
  }, [
    accountantId,
    collegeId,
    educationOptions,
    selectedEducationId,
    userLoading,
  ]);

  const overviewStats = useMemo(
    () =>
      stats.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            value: isRevenueLoading
              ? "Loading..."
              : formatAccountantRevenue(totalRevenue),
          };
        }

        if (index === 1) {
          return {
            ...item,
            value: isExpenseSummaryLoading
              ? "Loading..."
              : formatAccountantRevenue(expenseSummary.totalExpenses),
          };
        }

        if (index === 2) {
          return {
            ...item,
            value:
              isRevenueLoading || isExpenseSummaryLoading
                ? "Loading..."
                : (
                    feeTransactionCount + expenseSummary.transactionCount
                  ).toLocaleString("en-IN"),
          };
        }

        return {
          ...item,
          value: isExpenseSummaryLoading
            ? "Loading..."
            : expenseSummary.topCategory,
        };
      }),
    [
      expenseSummary,
      feeTransactionCount,
      isExpenseSummaryLoading,
      isRevenueLoading,
      totalRevenue,
    ],
  );

  const monthlyTrendData = useMemo(
    () =>
      MONTH_LABELS.map((month, index) => ({
        month,
        revenue: monthlyRevenue[index] ?? 0,
        expenses: expenseSummary.monthlyExpenses[index] ?? 0,
      })),
    [expenseSummary.monthlyExpenses, monthlyRevenue],
  );

  const overviewTransactions = useMemo<OverviewTransaction[]>(() => {
    const formatDate = (date: string) => {
      const parsedDate = new Date(date);

      return Number.isNaN(parsedDate.getTime())
        ? date
        : new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(parsedDate);
    };

    const visibleExpenses =
      selectedEducationId === null
        ? Array.from(
            new Map(
              recentExpenses.map((expense) => [
                [
                  expense.expenseName.trim().toLocaleLowerCase("en-IN"),
                  expense.category.trim().toLocaleLowerCase("en-IN"),
                  expense.amount,
                  expense.expenseDate,
                  expense.paymentMethod.trim().toLocaleLowerCase("en-IN"),
                ].join("|"),
                expense,
              ]),
            ).values(),
          )
        : recentExpenses;

    return [
      ...recentRevenueTransactions.map((transaction) => ({
        id: `revenue-${transaction.id}`,
        title: "Student Fees Collection",
        date: formatDate(transaction.date),
        rawDate: transaction.date,
        amount: transaction.amount,
        type: "REVENUE" as const,
      })),
      ...visibleExpenses.map((expense) => ({
        id: `expense-${expense.accountantExpenseId}`,
        title: expense.expenseName,
        date: formatDate(expense.expenseDate),
        rawDate: expense.expenseDate,
        amount: expense.amount,
        type: "EXPENSE" as const,
      })),
    ].sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  }, [recentExpenses, recentRevenueTransactions, selectedEducationId]);

  if (
    userLoading ||
    isEducationOptionsLoading ||
    isRevenueLoading ||
    isExpenseSummaryLoading
  ) {
    return <AnalyticsPageShimmer />;
  }

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
            {educationOptions.length > 0 && (
              <div className="relative">
                <select
                  aria-label="Select education type"
                  value={selectedEducationId ?? "all"}
                  onChange={(event) =>
                    setSelectedEducationId(
                      event.target.value === "all"
                        ? null
                        : Number(event.target.value),
                    )
                  }
                  className="h-11 min-w-[145px] cursor-pointer appearance-none rounded-xl border border-[#E3E8EF] bg-white py-2 pl-5 pr-11 text-[14px] font-bold text-[#17213D] shadow-[0_3px_10px_rgba(15,23,42,0.12)] outline-none focus:border-[#714EF2]"
                >
                  <option value="all">All</option>
                  {educationOptions.map((education) => (
                    <option
                      key={education.collegeEducationId}
                      value={education.collegeEducationId}
                    >
                      {education.collegeEducationType}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={17}
                  weight="bold"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#714EF2]"
                />
              </div>
            )}
            <div className="shrink-0">
              {!isDatePickerOpen ? (
                <button
                  type="button"
                  aria-label="Select date"
                  onClick={() => setIsDatePickerOpen(true)}
                  className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 font-bold shadow-[0_3px_10px_rgba(15,23,42,0.12)] transition-colors ${
                    selectedDateKey
                      ? "border-[#CBE9D8] bg-[#DAE9E1] text-[14px] tracking-wide text-[#43C17A] hover:bg-[#CBE6D7]"
                      : "w-11 border-[#E3E8EF] bg-white text-[#17213D] hover:border-[#43C17A]"
                  }`}
                >
                  <CalendarBlank size={17} weight="bold" />
                  {selectedDateKey &&
                    selectedDateKey.split("-").reverse().join("/")}
                </button>
              ) : (
                <div className="flex h-11 items-center gap-2 rounded-xl border border-[#43C17A] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.16)]">
                  <CalendarBlank
                    size={17}
                    className="ml-1 text-[#43C17A]"
                    weight="fill"
                  />
                  <input
                    type="date"
                    autoFocus
                    value={selectedDateKey}
                    max={new Date().toISOString().split("T")[0]}
                    onFocus={(event) => event.currentTarget.showPicker?.()}
                    onChange={(event) => {
                      if (event.target.value) {
                        setSelectedDateKey(event.target.value);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    className="cursor-pointer rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#43C17A]"
                  />
                  {selectedDateKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDateKey("");
                        setIsDatePickerOpen(false);
                      }}
                      className="cursor-pointer rounded px-1 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Close calendar"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((item, index) => (
            <StatCard
              key={item.label}
              item={item}
              onClick={index === 0 ? onOpenRevenue : undefined}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <RevenueExpenseChart data={monthlyTrendData} />
          <ExpensesByCategory
            totalExpenses={expenseSummary.totalExpenses}
            categories={expenseSummary.categoryBreakdown}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <RevenueSourcesPanel
            totalRevenue={studentFeeRevenue}
            isLoading={isRevenueLoading}
          />
          <MonthlyExpensePanel
            expenses={expenseSummary.monthlyExpenses}
            isLoading={isExpenseSummaryLoading}
          />
          <RecentTransactionsPanel
            transactions={overviewTransactions}
            isLoading={isRevenueLoading || isExpenseSummaryLoading}
          />
        </section>
      </div>
    </main>
  );
}
