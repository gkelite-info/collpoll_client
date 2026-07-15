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

import { StatCard, RevenueStatCard, RevenueSourceCard, StudentFeesStatCard, FeeTypeCard } from "../cards";
import { RevenueDetailsModal, AddRevenueRecordModal } from "../modals";
import { PanelHeader, RevenueSourcesPanel, RevenueSourceRow, MonthlyExpensePanel, RecentTransactionsPanel, RecentFeeCollectionsTable, RecentRevenueRecordsTable } from "../panels";
import { StudentFeesScreen, RevenueManagementScreen, AnalyticsOverviewScreen } from "../screens";
import { stats, MONTH_LABELS, CATEGORY_COLORS, studentFeeRevenueSource, revenueStats, revenueSourceOverview, studentFeeStats, feeTypeSummary, recentFeeCollections } from "../shared/constants";
import { AnalyticsPageShimmer } from "../shimmers/AnalyticsPageShimmer";
import { AnalyticsShimmerVariant } from "../shared/types";

export function RevenueExpenseChart({
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


export function ExpensesByCategory({
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


export function RevenueAnalyticsChart({
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


export function StudentRevenueTrendChart() {
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


