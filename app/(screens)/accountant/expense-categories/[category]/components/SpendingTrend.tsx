"use client";

import { useMemo } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export function SpendingTrend() {
  const chartData = useMemo(
    () => [
      { month: "JAN", amount: 8 },
      { month: "FEB", amount: 12 },
      { month: "MAR", amount: 9 },
      { month: "APR", amount: 15 },
      { month: "MAY", amount: 13 },
      { month: "JUN", amount: 17 },
      { month: "JUL", amount: 16 },
      { month: "AUG", amount: 16 },
      { month: "SEP", amount: 17 },
      { month: "OCT", amount: 17 },
      { month: "NOV", amount: 0 },
      { month: "DEC", amount: 0 },
    ],
    [],
  );

  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
      background: { fill: "transparent" },
      padding: { top: 18, right: 10, bottom: 0, left: 10 },
      series: [
        {
          type: "line",
          xKey: "month",
          yKey: "amount",
          stroke: "#43C17A",
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: "#FFFFFF",
            stroke: "#43C17A",
            size: 8,
          },
        },
      ],
      axes: {
        bottom: {
          type: "category",
          position: "bottom",
          label: { color: "#282828", fontSize: 9, fontWeight: 700 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          position: "left",
          min: 0,
          max: 20,
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
    <section className="rounded-xl bg-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[#17213D]">Spending Trend</h2>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-[#CBD5C9] bg-white px-4 text-[13px] font-medium text-[#282828]"
        >
          Monthly
          <CaretDown size={13} weight="bold" />
        </button>
      </div>
      <div className="mt-6 h-[250px]">
        <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
}
