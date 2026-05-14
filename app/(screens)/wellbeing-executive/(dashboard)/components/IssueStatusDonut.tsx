"use client";

import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgPolarChartOptions,
} from "ag-charts-community";
import { issueBreakdown } from "../data";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function IssueStatusDonut() {
  const total = issueBreakdown[0]?.value ?? 0;

  const options = useMemo<AgPolarChartOptions>(
    () => ({
      data: issueBreakdown,
      background: { fill: "transparent" },
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      series: [
        {
          type: "donut",
          angleKey: "value",
          innerRadiusRatio: 0.62,
          outerRadiusRatio: 0.88,
          fills: issueBreakdown.map((item) => item.color),
          strokeWidth: 0,
          innerLabels: [
            {
              text: String(total),
              fontSize: 34,
              fontWeight: "bold",
              color: "#111827",
            },
            {
              text: "Total Issues",
              fontSize: 12,
              color: "#6B7280",
            },
          ],
        },
      ],
      legend: { enabled: false },
    }),
    [total],
  );

  return (
    <div className="mt-6 flex min-h-[180px] items-center justify-center gap-4">
      <div className="h-[175px] w-[180px] shrink-0">
        <AgCharts options={options} style={{ height: "100%", width: "100%" }} />
      </div>
      <div className="flex w-[105px] flex-col gap-2">
        {issueBreakdown.map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-[11px] font-medium text-[#4B5563]">
              {item.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
