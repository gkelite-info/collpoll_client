"use client";

import TableComponent from "@/app/utils/table/table";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import {
  CaretLeft,
  DownloadSimple,
  FunnelSimple,
  Plus,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import RecordNewExpenseModal from "../modal/RecordNewExpenseModal";
import {
  thisMonthCategorySpending,
  thisMonthExpenseRecords,
  weeklySpendingTrend,
} from "./data";

ModuleRegistry.registerModules([AllCommunityModule]);

const columns = [
  { title: "DATE", key: "date" },
  { title: "CATEGORY", key: "category" },
  { title: "EXPENSE NAME", key: "expenseName" },
  { title: "AMOUNT", key: "amount" },
];

const categoryToneClasses: Record<string, string> = {
  green: "bg-[#CFF3D6] text-[#147A3D]",
  gray: "bg-[#DDE2E5] text-[#5B6269]",
  blue: "bg-[#DCEAFF] text-[#2762B4]",
};

function CategoryBadge({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <span
      className={`inline-flex min-w-[54px] justify-center rounded-full px-2 py-1 text-[9px] font-bold ${
        categoryToneClasses[tone] ?? categoryToneClasses.green
      }`}
    >
      {label}
    </span>
  );
}

function CategorySpendingCard({
  item,
}: {
  item: (typeof thisMonthCategorySpending)[number];
}) {
  const Icon = item.icon;

  return (
    <article
      className={`flex h-[92px] min-w-[155px] flex-col justify-between rounded-lg px-4 py-4 shadow-[0_5px_14px_rgba(15,23,42,0.12)] ${item.bg}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: item.iconBg, color: item.color }}
        >
          <Icon size={17} weight="fill" />
        </span>
        <h3
          className="min-w-0 overflow-x-auto whitespace-nowrap text-[13px] font-bold leading-tight"
          style={{ color: item.color }}
        >
          {item.title}
        </h3>
      </div>
      <p className="text-[13px] font-bold text-[#282828]">{item.amount}</p>
    </article>
  );
}

function WeeklySpendingChart() {
  const chartData = useMemo(
    () =>
      weeklySpendingTrend.map((item) => ({
        ...item,
        fill: item.week === "Week 4" ? "#086C20" : "#91D58B",
      })),
    [],
  );

  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
      background: { fill: "transparent" },
      padding: { top: 24, right: 8, bottom: 0, left: 0 },
      series: [
        {
          type: "bar",
          direction: "vertical",
          xKey: "week",
          yKey: "amount",
          fill: "#91D58B",
          strokeWidth: 0,
          cornerRadius: 5,
          width: 34,
          itemStyler: ({ datum }) => ({
            fill: datum.fill,
          }),
          tooltip: {
            renderer: ({ datum }) => ({
              title: datum.week,
              content: datum.displayAmount,
            }),
          },
        },
      ],
      axes: {
        bottom: {
          type: "category",
          position: "bottom",
          label: { color: "#282828", fontSize: 10 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          position: "left",
          min: 0,
          max: 70,
          label: { enabled: false },
          gridLine: { enabled: false },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [chartData],
  );

  return (
    <section className="flex min-h-[300px] flex-col rounded-lg bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
      <h2 className="text-[15px] font-bold text-[#282828]">
        Weekly Spending Trend
      </h2>
      <div className="mt-4 h-[235px]">
        <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
}

export default function ThisMonthSpendingPage() {
  const router = useRouter();
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const tableData = thisMonthExpenseRecords.map((record) => ({
    date: <span className="text-[13px] font-medium">{record.date}</span>,
    category: (
      <CategoryBadge label={record.category} tone={record.categoryTone} />
    ),
    expenseName: (
      <span className="text-[13px] font-semibold text-[#282828]">
        {record.expenseName}
      </span>
    ),
    amount: (
      <span className="text-[13px] font-medium text-[#282828]">
        {record.amount}
      </span>
    ),
  }));

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-2 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <section className="py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
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
                  This Month Spending
                </h1>
                <p className="mt-1 text-[13px] font-medium text-[#282828]">
                  Track and analyze all expenses recorded during this month.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRecordExpenseOpen(true)}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#172B58] px-6 text-[13px] font-bold text-white"
            >
              <Plus size={16} weight="bold" />
              Record New Expense
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[15px] font-bold text-[#282828]">
            Expense Categories
          </h2>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            {thisMonthCategorySpending.map((item) => (
              <CategorySpendingCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.95fr)]">
          <section className="rounded-lg bg-white shadow-[0_4px_14px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-[16px] font-bold text-[#282828]">
                This Month Expense Records
              </h2>
              <div className="flex items-center gap-3 text-[#282828]">
                <button
                  type="button"
                  aria-label="Filter records"
                  className="cursor-pointer"
                >
                  <FunnelSimple size={18} weight="bold" />
                </button>
                <button
                  type="button"
                  aria-label="Download records"
                  className="cursor-pointer"
                >
                  <DownloadSimple size={18} weight="bold" />
                </button>
              </div>
            </div>
            <TableComponent
              columns={columns}
              tableData={tableData}
              height="260px"
              stickyHeader={false}
              tableClassName="min-w-[620px]"
            />
            <div className="flex justify-end px-5 pb-4 pt-1">
              <button
                type="button"
                className="cursor-pointer text-[13px] font-medium text-[#086C20]"
              >
                View All 142 Records
              </button>
            </div>
          </section>

          <WeeklySpendingChart />
        </div>
      </div>
      <RecordNewExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
      />
    </main>
  );
}
