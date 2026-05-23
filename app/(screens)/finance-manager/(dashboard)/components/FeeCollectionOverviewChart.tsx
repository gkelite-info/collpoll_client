"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getFinanceAnalyticsOverview } from "@/lib/helpers/finance-manager/analytics/FetchFinanceAnalytics";

ModuleRegistry.registerModules([AllCommunityModule]);

type FeeCollectionChartRow = {
  program: string;
  collected: number;
  pending: number;
};

type ChartDatum = FeeCollectionChartRow & {
  pendingValue: number;
};

const formatShortAmount = (value: number) => {
  const amount = Number(value) || 0;
  if (amount >= 10000000) return `\u20B9 ${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `\u20B9 ${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `\u20B9 ${Math.round(amount / 1000)} K`;
  return `\u20B9 ${Math.round(amount).toLocaleString("en-IN")}`;
};

export default function FeeCollectionOverviewChart() {
  const router = useRouter();
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const [chartData, setChartData] = useState<FeeCollectionChartRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      if (contextLoading || !collegeId || !collegeEducationId) return;

      setLoading(true);
      try {
        const result = await getFinanceAnalyticsOverview(
          collegeId,
          collegeEducationId,
        );
        if (!isMounted) return;
        setChartData(result.chartData);
      } catch {
        if (!isMounted) return;
        setChartData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [collegeEducationId, collegeId, contextLoading]);

  const data = useMemo<ChartDatum[]>(
    () =>
      chartData.map((item) => ({
        program: item.program,
        collected: Number(item.collected) || 0,
        pending: Number(item.pending) || 0,
        pendingValue: Number(item.pending) || 0,
      })),
    [chartData],
  );

  const maxStackValue = useMemo(
    () =>
      Math.max(
        1,
        ...data.map((item) => Number(item.collected) + Number(item.pending)),
      ),
    [data],
  );
  const lakh = 100000;
  const axisStep = 2 * lakh;
  const axisMax = Math.max(
    axisStep,
    Math.ceil((maxStackValue * 1.15) / axisStep) * axisStep,
  );

  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data,
      background: { fill: "transparent" },
      padding: { top: 6, right: 6, bottom: 0, left: 0 },
      series: [
        {
          type: "bar",
          xKey: "program",
          yKey: "collected",
          yName: "Collected",
          stacked: true,
          fill: "#3BAE64",
          strokeWidth: 0,
          cornerRadius: 0,
          width: 50,
        },
        {
          type: "bar",
          xKey: "program",
          yKey: "pending",
          yName: "Pending",
          stacked: true,
          fill: "#16284F",
          strokeWidth: 0,
          cornerRadius: 6,
          width: 50,
          label: {
            enabled: true,
            color: "#FFFFFF",
            fontSize: 11,
            formatter: ({ datum }) =>
              formatShortAmount(Number(datum.pendingValue) || 0),
          },
        },
      ],
      axes: {
        bottom: {
          type: "category",
          label: {
            color: "#282828",
            fontSize: 14,
            rotation: 0,
            autoRotate: false,
            avoidCollisions: false,
          },
          line: { stroke: "#B3B3B3" },
        },
        left: {
          type: "number",
          min: 0,
          max: axisMax,
          nice: false,
          interval: { step: axisStep },
          label: {
            color: "#282828",
            fontSize: 13,
            formatter: ({ value }) => formatShortAmount(Number(value)),
          },
          gridLine: { enabled: false },
          line: { stroke: "#B3B3B3" },
        },
      },
      legend: { enabled: false },
    }),
    [axisMax, axisStep, data],
  );

  const BAR_SLOT_WIDTH = 110;
  const Y_AXIS_WIDTH = 70;
  const chartWidth = Math.max(
    Math.max(data.length, 1) * BAR_SLOT_WIDTH + Y_AXIS_WIDTH,
    200,
  );
  const chartHeight = 256;
  const isLoading = contextLoading || loading;

  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold text-[#282828]">
          Fee Collection Overview
        </h2>
        <button
          type="button"
          className="cursor-pointer text-[#282828] transition-transform hover:translate-x-1"
          onClick={() => router.push("?view=fee-collection-overview")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="custom-scrollbar overflow-x-scroll overflow-y-hidden pb-2">
        <div style={{ width: chartWidth, height: chartHeight }}>
          {isLoading ? (
            <div className="h-full animate-pulse rounded-md bg-[#F2F2F2]" />
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-[#525252]">
              No fee collection data available
            </div>
          ) : (
            <AgCharts
              options={options}
              style={{ height: "100%", width: "100%" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
