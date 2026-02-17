import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";

const ROLES_COLORS = {
  Admins: "#8B5CF6",    // Purple
  Students: "#FBBF24",  // Amber/Orange
  Parents: "#34D399",   // Emerald
  Faculty: "#60A5FA",   // Blue
  Finance: "#F97316",   // Orange-deep
  Placement: "#F472B6", // Pink
};

export default function DonutCard({ title, total, data }: any) {
  // const options: AgChartOptions = useMemo(() => ({
  //   data,
  //   background: { fill: "transparent" },
  //   padding: { top: 0, bottom: 0, left: 0, right: 0 },
  //   series: [
  //     {
  //       type: "donut",
  //       angleKey: "value",
  //       legendItemKey: "role",
  //       innerRadiusRatio: 0.3,
  //       outerRadiusRatio:0.5,
  //       strokeWidth: 0,
  //       fills: Object.values(ROLES_COLORS),
  //       highlightStyle: { series: { dimOpacity: 0.9 } },
  //     },
  //   ],
  //   legend: {
  //     position: "bottom",
  //     item: {
  //       label: { fontSize: 8, color: "#6B7280" },
  //       marker: { size: 8, shape: "circle", padding: 2 },
  //     },
  //     spacing: 0,
  //   },
  // }), [data]);

  const options: AgChartOptions = useMemo(() => ({
    data,
    background: { fill: "transparent" },
    padding: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [
      {
        type: "donut",
        angleKey: "value",
        legendItemKey: "role",
        outerRadiusRatio: 0.6,
        innerRadiusRatio: 0.3,
        // outerRadiusOffset: 0.1,
        strokeWidth: 0,
        fills: Object.values(ROLES_COLORS),
        highlightStyle: { series: { dimOpacity: 0.9 } },
      },
    ],

    legend: {
      position: "bottom",
      spacing: 0,
      item: {
        label: { fontSize: 8, color: "#6B7280" },
        marker: { size: 8, shape: "circle", padding: 2 },
      },
    },
  }), [data]);

  return (
    <div className="p-4 rounded-2xl shadow-sm flex flex-col" style={{ backgroundColor: "white", height:"43vh" }}>
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-gray-800">{title}</h4>
        <span className="text-xs text-gray-400">Total Users : {total} Users</span>
      </div>
      <div className="w-full h-auto aspect-square">
        <AgCharts options={options} style={{ height: "60%" }} />
      </div>
    </div>
  );
};