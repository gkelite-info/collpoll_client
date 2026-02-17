"use client";

import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import {
  ModuleRegistry,
  AllCommunityModule,
} from "ag-charts-community";
import type {
  AgCartesianChartOptions,
  AgPolarChartOptions,
} from "ag-charts-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const COLORS = {
  ece: "#7C3AED",     
  civil: "#F59E0B",   
  mech: "#60A5FA",   
  cse: "#22C55E",     
};


const EducationDonut = () => {
  const options = useMemo<AgPolarChartOptions>(() => ({
    data: [
      { branch: "ECE", value: 25 },
      { branch: "CIVIL", value: 15 },
      { branch: "MECH", value: 20 },
      { branch: "CSE", value: 40 },
    ],

    background: { fill: "transparent" },
    padding: { top: 20, bottom: 10, left: 20, right: 20 },

    series: [
      {
        type: "donut",
        angleKey: "value",
        legendItemKey: "branch",
        innerRadiusRatio: 0.6,
        strokeWidth: 0,
        fills: [
          COLORS.ece,
          COLORS.civil,
          COLORS.mech,
          COLORS.cse,
        ],
        innerLabels: [
          {
            text: "7.6 Cr",
            fontSize: 20,
            fontWeight: 700,
            color: "#282828",
          },
        ],
      },
    ],

    legend: {
      position: "bottom",
      item: {
        marker: { shape: "circle", size: 10 },
        label: {
          fontSize: 12,
          color: "#4B5563",
        },
      },
    },
  }), []);

  return (
    <div className="bg-white rounded-[15px] p-4">
      <h3 className="text-lg font-semibold text-[#282828] mb-3">
        Fee Collection Trend
      </h3>

      <AgCharts options={options} />
    </div>
  );
};

const YearWiseTrend = () => {
  const options = useMemo<AgCartesianChartOptions>(() => ({
    data: [
      { year: "1st Year", value: 30 },
      { year: "2nd Year", value: 45 },
      { year: "3rd Year", value: 25 },
      { year: "4th Year", value: 40 },
    ],

    background: { fill: "transparent" },

    series: [
      {
        type: "bar",
        xKey: "year",
        yKey: "value",
        fill: "#22C55E", 
        cornerRadius: 6,
        strokeWidth: 0,
        maxWidth: 45,
      },
    ],

    axes: {
      bottom: {
        type: "category",
        line: {
          width: 1,
          stroke: "#E5E7EB",
        },
        label: {
          fontSize: 12,
          color: "#6B7280",
        },
      },
      left: {
        type: "number",
        label: { enabled: false },
        line: { enabled: false },
        gridLine: { enabled: false },
      },
    },

    legend: { enabled: false },
  }), []);

  return (
    <div className="bg-white rounded-[15px] p-4">
      <h3 className="text-lg font-semibold text-[#282828] mb-3">
        Year-Wise Trend
      </h3>

      <AgCharts options={options} />
    </div>
  );
};

export default function FinanceEducationCharts() {
  return (
    <div className="grid lg:grid-cols-2 gap-3 mt-0">
      <EducationDonut />
      <YearWiseTrend />
    </div>
  );
}
