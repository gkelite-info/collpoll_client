"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import { feeCollectionOverview } from "./data";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function FeeCollectionOverviewChart() {
  const router = useRouter();
  const maxStackValue = useMemo(
    () =>
      Math.max(
        ...feeCollectionOverview.map(
          (item) => item.collected + item.pending,
        ),
      ),
    [],
  );
  const shouldShowVerticalScroll = maxStackValue > 8;
  const axisMax = shouldShowVerticalScroll
    ? Math.ceil(maxStackValue / 2) * 2
    : 8;

  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data: feeCollectionOverview,
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
          maxWidth: 28,
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
          maxWidth: 28,
          label: {
            enabled: true,
            color: "#FFFFFF",
            fontSize: 11,
            formatter: ({ datum }) => `₹ ${datum.pendingLabel}r`,
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
          interval: { step: 2 },
          label: {
            color: "#282828",
            fontSize: 13,
            formatter: ({ value }) => `₹ ${value} Cr`,
          },
          gridLine: { enabled: false },
          line: { stroke: "#B3B3B3" },
        },
      },
      legend: { enabled: false },
    }),
    [axisMax],
  );

  // Each bar slot = ~80px (5 bars) + ~70px for the left Y-axis labels = ~470px total
  // maxWidth:44 only fires when the natural bar width > 44px
  // So we fix the chart width so natural bar width ≈ 44px
  const BAR_SLOT_WIDTH = 68; // px per category
  const Y_AXIS_WIDTH = 70; // px for left axis labels
  const chartWidth = feeCollectionOverview.length * BAR_SLOT_WIDTH + Y_AXIS_WIDTH;
  const chartHeight = shouldShowVerticalScroll
    ? Math.ceil((axisMax / 8) * 256)
    : 256;

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

      <div className="custom-scrollbar overflow-x-auto overflow-y-hidden pb-2">
        <div style={{ width: chartWidth, height: chartHeight }}>
          <AgCharts options={options} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
