"use client";

import TableComponent from "@/app/utils/table/table";
import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import { useMemo } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

const rupee = "\u20B9";

const branchData = [
  {
    branch: "CSE",
    collected: 5.8,
    pending: 3,
    title: "CSE",
  },
  {
    branch: "EEE",
    collected: 8.8,
    pending: 3,
    title: "EEE",
  },
  {
    branch: "IT",
    collected: 7.1,
    pending: 1.7,
    title: "IT",
  },
  {
    branch: "ME",
    collected: 11.4,
    pending: 1.8,
    title: "ME",
  },
  {
    branch: "CIVIL",
    collected: 5,
    pending: 0.8,
    title: "CIVIL",
  },
  {
    branch: "ECE",
    collected: 7.2,
    pending: 1.8,
    title: "ECE",
  },
];

const branchCards = branchData.map((item) => ({
  title: item.title,
  amount: `${rupee} 1.2 Cr`,
  collected: `${rupee} 1,20,000`,
  pending: `${rupee} 30L`,
}));

const branchOverviewColumns = [
  { title: "Branch", key: "branch" },
  { title: "Collected", key: "collected" },
  { title: "Pending", key: "pending" },
  { title: "Total Fees", key: "totalFees" },
  { title: "Action", key: "actions" },
];

function BranchCollectionChart() {
  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data: branchData,
      background: { fill: "transparent" },
      padding: { top: 12, right: 16, bottom: 0, left: 0 },
      series: [
        {
          type: "bar",
          xKey: "branch",
          yKey: "collected",
          stacked: true,
          fill: "#43C17A",
          strokeWidth: 0,
          width: 44,
        },
        {
          type: "bar",
          xKey: "branch",
          yKey: "pending",
          stacked: true,
          fill: "#CFF3DD",
          strokeWidth: 0,
          cornerRadius: 6,
          width: 44,
        },
      ],
      axes: {
        bottom: {
          type: "category",
          label: { color: "#282828", fontSize: 12 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          min: 0,
          max: 14,
          nice: false,
          interval: { step: 2 },
          label: {
            color: "#525252",
            fontSize: 12,
            formatter: ({ value }) => (value >= 10 ? `${value / 10}Cr` : `${value}.0L`),
          },
          gridLine: { stroke: "#E4E4E4" },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [],
  );

  return <AgCharts options={options} style={{ height: "100%", width: "100%" }} />;
}

export default function BranchWiseCollectionView({
  program,
  backHref = "/finance-manager/finance-analytics",
  yearWiseView = "year-wise",
}: {
  program: string;
  backHref?: string;
  yearWiseView?: string;
}) {
  const router = useRouter();
  const title = program || "B-Tech";
  const branchOverviewRows = branchData.map((item) => ({
    branch: item.branch,
    collected: `${rupee} 1,20,00,000`,
    pending: `${rupee} 30,0000`,
    totalFees: `${rupee} 1,50,00,000`,
    actions: (
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[#22A55D] underline decoration-2 underline-offset-4"
        onClick={() =>
          router.push(
            `?view=${yearWiseView}&program=${encodeURIComponent(title)}&branch=${encodeURIComponent(item.branch)}`,
          )
        }
      >
        View Years
      </button>
    ),
  }));

  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Back to Finance Analytics"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
          onClick={() => router.push(backHref)}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-xl font-semibold text-[#282828]">{title}</h1>
        <CaretRight size={18} className="text-[#8A8A8A]" />
        <span className="text-sm text-[#525252]">Branch Wise Collection</span>
      </div>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-md font-semibold text-[#282828]">
            Fee Collection Trends
          </h2>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#525252]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#282828]">Academic Year</span>
              <button
                type="button"
                className="flex items-center gap-1 rounded-full bg-[#E9D8FF] px-3 py-1 font-semibold text-[#714EF2]"
              >
                2026 <CaretDown size={14} weight="bold" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#43C17A]" />
              <span>Collected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#CFF3DD]" />
              <span>Pending</span>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto overflow-y-hidden pb-2">
          <div className="h-56 min-w-[115%]">
            <BranchCollectionChart />
          </div>
        </div>

        <div className="custom-scrollbar mt-4 overflow-x-auto pb-2">
          <div className="grid min-w-[115%] grid-cols-6 gap-3">
            {branchCards.map((card) => (
              <article
                key={card.title}
                className="rounded-md bg-[#F2F2F2] p-3 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-[#43C17A]">
                  {card.title}
                </h3>
                <p className="mt-2 rounded bg-[#16284F] px-2 py-1 text-sm font-semibold text-white">
                  {card.amount}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#16284F]">
                    {card.collected}
                  </span>
                  <span className="text-[#43C17A]">Collected</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#16284F]">
                    {card.pending}
                  </span>
                  <span className="text-[#43C17A]">Pending</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-[#282828]">
          Branch Overview
        </h2>
        <div className="custom-scrollbar overflow-x-auto">
          <div className="min-w-[900px]">
            <TableComponent
              columns={branchOverviewColumns}
              tableData={branchOverviewRows}
              height="auto"
              stickyHeader={false}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
