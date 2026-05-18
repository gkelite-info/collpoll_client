"use client";

import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import { revenueTrendData } from "./data";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function RevenueTrendsChart() {
  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data: revenueTrendData,
      background: { fill: "transparent" },
      padding: { top: 12, right: 20, bottom: 0, left: 0 },
      series: [
        {
          type: "bar",
          xKey: "program",
          yKey: "collected",
          yName: "Collected",
          stacked: true,
          fill: "#43C17A",
          strokeWidth: 0,
          width: 60,
          itemStyler: ({ datum }) => ({
            fill: datum.collectedColor,
          }),
        },
        {
          type: "bar",
          xKey: "program",
          yKey: "pending",
          yName: "Pending",
          stacked: true,
          fill: "#CFF3DD",
          strokeWidth: 0,
          cornerRadius: 6,
          width: 60,
          itemStyler: ({ datum }) => ({
            fill: datum.pendingColor,
          }),
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
