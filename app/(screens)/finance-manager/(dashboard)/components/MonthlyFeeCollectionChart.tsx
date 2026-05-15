"use client";

import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import { monthlyFeeCollection } from "./data";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function MonthlyFeeCollectionChart() {
  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data: monthlyFeeCollection,
      background: { fill: "transparent" },
      padding: { top: 10, right: 10, bottom: 0, left: 0 },
      series: [
        {
          type: "area",
          xKey: "month",
          yKey: "amount",
          fill: "#43C17A",
          fillOpacity: 0.32,
          stroke: "#3EAD6F",
          strokeWidth: 2,
          marker: {
            enabled: true,
            fill: "#3EAD6F",
            stroke: "#FFFFFF",
            size: 5,
          },
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
          max: 8,
          nice: false,
          interval: { step: 2 },
          label: {
            color: "#282828",
            fontSize: 12,
            formatter: ({ value }) => `₹ ${value} Cr`,
          },
          gridLine: { enabled: false },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [],
  );

  return <AgCharts options={options} style={{ height: "100%", width: "100%" }} />;
}
