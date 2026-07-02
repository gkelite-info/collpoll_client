"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgCharts } from "ag-charts-react";
import { motion } from "framer-motion";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import { CaretDown } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { AdminInfoCard } from "@/app/(screens)/admin/utils/adminInfoCard";
import {
  expenseCategories,
  expenseSummaryCards,
  monthlyExpenseData,
} from "./data";

ModuleRegistry.registerModules([AllCommunityModule]);

type ExpenseAnalyticsRange = "Monthly" | "Quarterly" | "Half-Yearly" | "Yearly";

const analyticsRanges: ExpenseAnalyticsRange[] = [
  "Monthly",
  "Quarterly",
  "Half-Yearly",
  "Yearly",
];
const analyticsYears = ["2025", "2024", "2023", "2022"];

const expenseAnalyticsByRange: Record<
  ExpenseAnalyticsRange,
  {
    data: Array<{ label: string; value: number; displayAmount: string }>;
    totalSpending: string;
    highestLabel: string;
    highestSpending: string;
    axisMax: number;
    axisStep: number;
  }
> = {
  Monthly: {
    data: monthlyExpenseData.map((item) => ({
      label: item.month,
      value: item.value,
      displayAmount: item.month === "May" ? "18.45 L" : `${item.value} L`,
    })),
    totalSpending: "Rs 1.84 Cr",
    highestLabel: "Highest Spending (May)",
    highestSpending: "Rs 18.45 L",
    axisMax: 32,
    axisStep: 10,
  },
  Quarterly: {
    data: [
      { label: "Q1", value: 52, displayAmount: "52 L" },
      { label: "Q2", value: 80, displayAmount: "80 L" },
      { label: "Q3", value: 56, displayAmount: "56 L" },
      { label: "Q4", value: 50, displayAmount: "50 L" },
    ],
    totalSpending: "Rs 2.38 Cr",
    highestLabel: "Highest Spending (Q2)",
    highestSpending: "Rs 80 L",
    axisMax: 90,
    axisStep: 30,
  },
  "Half-Yearly": {
    data: [
      { label: "H1", value: 132, displayAmount: "1.32 Cr" },
      { label: "H2", value: 106, displayAmount: "1.06 Cr" },
    ],
    totalSpending: "Rs 2.38 Cr",
    highestLabel: "Highest Spending (H1)",
    highestSpending: "Rs 1.32 Cr",
    axisMax: 150,
    axisStep: 50,
  },
  Yearly: {
    data: [
      { label: "2022", value: 168, displayAmount: "1.68 Cr" },
      { label: "2023", value: 204, displayAmount: "2.04 Cr" },
      { label: "2024", value: 226, displayAmount: "2.26 Cr" },
      { label: "2025", value: 238, displayAmount: "2.38 Cr" },
    ],
    totalSpending: "Rs 2.38 Cr",
    highestLabel: "Highest Spending (2025)",
    highestSpending: "Rs 2.38 Cr",
    axisMax: 260,
    axisStep: 65,
  },
};

function SummaryCard({
  item,
  onClick,
}: {
  item: (typeof expenseSummaryCards)[number];
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <section
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
      className="flex h-[74px] min-w-0 cursor-pointer items-center gap-2.5 rounded-2xl bg-white px-4 shadow-[0_4px_14px_rgba(15,23,42,0.12)]"
    >
      <span
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-md text-white"
        style={{ backgroundColor: item.iconBgColor }}
      >
        <Icon size={21} weight="fill" />
      </span>
      <div className="min-w-0 flex-1 overflow-x-auto">
        <p className="whitespace-nowrap text-[10px] font-semibold leading-tight text-[#2F3340]">
          {item.label}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-[18px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-[10px] leading-tight text-gray-500">
          {item.detail}
        </p>
      </div>
    </section>
  );
}

function ExpenseAnalyticsCard() {
  const [activeRange, setActiveRange] = useState<ExpenseAnalyticsRange>("Monthly");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const activeAnalytics = expenseAnalyticsByRange[activeRange];
  const chartData = useMemo(
    () =>
      activeAnalytics.data.map((item) => ({
        ...item,
        fill:
          item.value === Math.max(...activeAnalytics.data.map((entry) => entry.value))
            ? "#1EC95F"
            : "#50CD81",
      })),
    [activeAnalytics.data],
  );

  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
      background: { fill: "transparent" },
      padding: { top: 12, right: 8, bottom: 0, left: 8 },
      series: [
        {
          type: "bar",
          direction: "vertical",
          xKey: "label",
          yKey: "value",
          fill: "#50CD81",
          strokeWidth: 0,
          cornerRadius: 5,
          width: 22,
          itemStyler: ({ datum }) => ({
            fill: datum.fill,
          }),
          tooltip: {
            renderer: ({ datum }) => ({
              title: activeRange === "Yearly" ? `${datum.label}` : `${datum.label} ${selectedYear}`,
              content: `Rs ${datum.displayAmount}`,
            }),
          },
        },
      ],
      axes: {
        bottom: {
          type: "category",
          position: "bottom",
          label: {
            color: "#17213D",
            fontSize: 11,
            fontWeight: 500,
          },
          line: { enabled: false },
        },
        left: {
          type: "number",
          position: "left",
          min: 0,
          max: activeAnalytics.axisMax,
          nice: false,
          interval: { step: activeAnalytics.axisStep },
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
    [activeAnalytics.axisMax, activeAnalytics.axisStep, activeRange, chartData, selectedYear],
  );

  useEffect(() => {
    if (!isYearDropdownOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isYearDropdownOpen]);

  return (
    <section className="rounded-3xl bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#17213D]">Expense Analytics</h2>
        <div className="flex rounded-full bg-[#F0F2F5] p-1 text-[10px] text-gray-500">
          {analyticsRanges.map((item) => (
            <button
              key={item}
              onClick={() => setActiveRange(item)}
              className={`relative z-10 cursor-pointer rounded-full px-4 py-1.5 transition-colors ${
                item === activeRange
                  ? "font-semibold text-white"
                  : "text-gray-500"
              }`}
              type="button"
            >
              {item}
              {item === activeRange && (
                <motion.div
                  layoutId="accountant-expense-range-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-[#43C17A] shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
        <div ref={yearDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsYearDropdownOpen((open) => !open)}
            className="flex min-w-[92px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#F4F5F7] px-4 py-2 text-xs font-semibold text-[#17213D]"
          >
            {selectedYear}
            <CaretDown
              size={12}
              weight="bold"
              className={`transition-transform ${isYearDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isYearDropdownOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-24 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              {analyticsYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    setSelectedYear(year);
                    setIsYearDropdownOpen(false);
                  }}
                  className={`block w-full cursor-pointer px-4 py-2 text-left text-xs font-semibold ${
                    year === selectedYear
                      ? "bg-[#E8F8EF] text-[#43C17A]"
                      : "text-[#17213D] hover:bg-gray-50"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-[#EFEFEF] p-3 text-center">
          <p className="text-[10px] font-semibold text-[#17213D]">Total Spending</p>
          <p className="mt-1 text-lg font-bold text-[#1BC36D]">
            {activeAnalytics.totalSpending}
          </p>
        </div>
        <div className="rounded-xl bg-[#EFEFEF] p-3 text-center">
          <p className="text-[10px] font-semibold text-[#17213D]">
            {activeAnalytics.highestLabel}
          </p>
          <p className="mt-1 text-lg font-bold text-[#8D3DFF]">
            {activeAnalytics.highestSpending}
          </p>
        </div>
      </div>

      <div className="mt-6 h-[190px] w-full">
        <AgCharts
          key={`${activeRange}-${selectedYear}`}
          options={chartOptions}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </section>
  );
}

function ExpenseCategoriesOverview() {
  return (
    <section className="mt-5">
      <h2 className="mb-5 text-base font-bold text-[#17213D]">
        Expense Categories Overview
      </h2>
      <div className="grid gap-x-5 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {expenseCategories.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className={`flex h-[108px] min-w-0 flex-col justify-between rounded-2xl px-5 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.12)] ${item.bg}`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Icon size={22} weight="regular" color={item.color} />
                <h3
                  className="min-w-0 overflow-x-auto whitespace-nowrap text-[12px] font-bold leading-tight"
                  style={{ color: item.color }}
                >
                  {item.title}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-[11px] leading-tight">
                <p className="overflow-x-auto whitespace-nowrap text-[#6B7280]">
                  {item.countLabel}
                </p>
                <p className="overflow-x-auto whitespace-nowrap text-[#6B7280]">
                  Total Spending
                </p>
                <p className="overflow-x-auto whitespace-nowrap text-[12px] font-bold text-[#17213D]">
                  {item.count}
                </p>
                <p className="overflow-x-auto whitespace-nowrap text-[12px] font-bold text-[#17213D]">
                  {item.amount}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function AccountantDashboardLeft() {
  const { fullName } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayName = fullName || "Accountant";
  const welcomeCard = [
    {
      show: false,
      user: displayName,
      adminSubject: "Here's an overview of institution expenses and spending analytics",
      description: "Review expense categories, monthly spending, and recent records.",
      image: "/financer-m.png",
      suppressHonorific: true,
    },
  ];

  return (
    <div className="w-full px-2 py-3 pb-8 md:w-[68%]">
      <AdminInfoCard cardProps={welcomeCard} />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {expenseSummaryCards.map((item) => {
          const viewByCardLabel: Record<string, string> = {
            "Total Expenses": "totalExpenses",
            "This Month Spending": "thisMonthSpending",
            "Expense Categories": "expenseCategories",
            "Transactions Recorded": "transactions",
          };
          const targetView = viewByCardLabel[item.label];
          const handleClick = targetView
            ? () => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("view", targetView);
                router.push(`?${params.toString()}`);
              }
            : undefined;

          return (
            <SummaryCard key={item.label} item={item} onClick={handleClick} />
          );
        })}
      </div>

      <div className="mt-4">
        <ExpenseAnalyticsCard />
      </div>

      <ExpenseCategoriesOverview />
    </div>
  );
}
