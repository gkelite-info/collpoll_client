"use client";

import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";

ModuleRegistry.registerModules([AllCommunityModule]);

type RevenueTrendRow = {
  program: string;
  collected: number;
  pending: number;
  collectedColor?: string;
  pendingColor?: string;
};

const collectedColors = ["#43C17A", "#60AEFF", "#E6B75F", "#16284F", "#7654E8"];
const pendingColors = ["#CFF3DD", "#DDEEFF", "#FFF2D8", "#E3DAFF", "#DCCFFF"];

const formatAxisAmount = (value: number) => {
  const numericValue = Number(value) || 0;

  if (numericValue >= 10000000) {
    return `${(numericValue / 10000000).toFixed(1)}Cr`;
  }

  if (numericValue >= 100000) {
    return `${(numericValue / 100000).toFixed(1)}L`;
  }

  if (numericValue >= 1000) {
    return `${(numericValue / 1000).toFixed(0)}K`;
  }

  return `${Math.round(numericValue)}`;
};

export default function RevenueTrendsChart({
  data,
}: {
  data: RevenueTrendRow[];
}) {
  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        collectedColor: item.collectedColor ?? collectedColors[index % collectedColors.length],
        pendingColor: item.pendingColor ?? pendingColors[index % pendingColors.length],
      })),
    [data],
  );
  const maxValue = useMemo(
    () =>
      Math.max(
        1,
        ...chartData.map(
          (item) => Number(item.collected) + Number(item.pending),
        ),
      ),
    [chartData],
  );

  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
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
          max: maxValue,
          nice: true,
          label: {
            color: "#525252",
            fontSize: 12,
            formatter: ({ value }) => formatAxisAmount(Number(value)),
          },
          gridLine: { stroke: "#E4E4E4" },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [chartData, maxValue],
  );

  return <AgCharts options={options} style={{ height: "100%", width: "100%" }} />;
}
