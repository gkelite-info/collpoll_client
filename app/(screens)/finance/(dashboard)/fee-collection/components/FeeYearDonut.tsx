"use client";

import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import {
  ModuleRegistry,
  AllCommunityModule,
} from "ag-charts-community";
import type { AgPolarChartOptions } from "ag-charts-community";
import { CaretRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";


ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  title: string;
  percentage: number;
  expected?: string;
  collected?: string;
  pending?: string;
}

export default function FeeYearDonut({
  title,
  percentage,
  expected = "24.2 L",
  collected = "24.2 L",
  pending = "24.2 L"
}: Props) {

  const options = useMemo<AgPolarChartOptions>(() => ({
    autoSize: true,
    data: [
      { type: "Collected_Dark", value: percentage * 0.6 },
      { type: "Collected_Light", value: percentage * 0.4 },
      { type: "Pending", value: 100 - percentage },
    ],
    background: { fill: "transparent" },
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    series: [
      {
        type: "donut",
        angleKey: "value",
        innerRadiusRatio: 0.5,
        outerRadiusRatio: 0.7,
        fills: ["#6D28D9", "#A78BFA", "#EF4444"],
        strokeWidth: 0,
        rotation: -30,
        innerLabels: [
          {
            text: `${percentage}%`,
            fontSize: 32,
            fontWeight: "bold",
            color: "#1F2937",
            margin: 4,
          },
          {
            text: "Fee Collected",
            fontSize: 14,
            color: "#6B7280",
          },
        ],
      },
    ],
    legend: { enabled: false },
  }), [percentage]);

  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full max-w-lg">

    
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-[#6D28D9]">
          {title}
        </h3>

        <CaretRight
          size={18}
          className="text-gray-400 cursor-pointer"
          onClick={() =>
            router.push(`/finance/fee-collection/details?year=${title}`)
          }
        />
      </div>   
      <div className="h-[220px] w-full flex items-center justify-center relative">
        <AgCharts options={options} />
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-sm font-medium">Expected :</span>
          <span className="text-[#6D28D9] text-sm font-bold">{expected}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-sm font-medium">Collected :</span>
          <span className="text-[#A78BFA] text-sm font-bold">{collected}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-sm font-medium">Pending :</span>
          <span className="text-[#EF4444] text-sm font-bold">{pending}</span>
        </div>
      </div>
    </div>
  );
}