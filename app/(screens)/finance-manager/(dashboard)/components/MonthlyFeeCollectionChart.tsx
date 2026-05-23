"use client";

import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import {
  fetchMonthlyFeeCollection,
  type MonthlyFeeCollectionRow,
} from "@/lib/helpers/finance-manager/dashboard/FetchMonthlyFeeCollection";

ModuleRegistry.registerModules([AllCommunityModule]);

const formatShortAmount = (value: number) => {
  const amount = Number(value) || 0;
  if (amount >= 10000000) return `\u20B9 ${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `\u20B9 ${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `\u20B9 ${Math.round(amount / 1000)} K`;
  return `\u20B9 ${Math.round(amount).toLocaleString("en-IN")}`;
};

const getAxisStep = (maxValue: number) => {
  if (maxValue <= 50000) return 25000;
  if (maxValue <= 100000) return 50000;
  if (maxValue <= 500000) return 100000;
  if (maxValue <= 1000000) return 200000;
  if (maxValue <= 5000000) return 500000;
  if (maxValue <= 10000000) return 1000000;
  return 2000000;
};

export default function MonthlyFeeCollectionChart() {
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const [monthlyData, setMonthlyData] = useState<MonthlyFeeCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMonthlyCollection() {
      if (contextLoading || !collegeId || !collegeEducationId) return;

      setLoading(true);
      try {
        const result = await fetchMonthlyFeeCollection(
          collegeId,
          collegeEducationId,
        );
        if (!isMounted) return;
        setMonthlyData(result);
      } catch {
        if (!isMounted) return;
        setMonthlyData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMonthlyCollection();

    return () => {
      isMounted = false;
    };
  }, [collegeEducationId, collegeId, contextLoading]);

  const maxValue = useMemo(
    () => Math.max(1, ...monthlyData.map((item) => Number(item.amount) || 0)),
    [monthlyData],
  );
  const axisStep = getAxisStep(maxValue);
  const axisMax = Math.max(
    axisStep,
    Math.ceil((maxValue * 1.15) / axisStep) * axisStep,
  );

  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data: monthlyData,
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
          max: axisMax,
          nice: false,
          interval: { step: axisStep },
          label: {
            color: "#282828",
            fontSize: 12,
            formatter: ({ value }) => formatShortAmount(Number(value)),
          },
          gridLine: { enabled: false },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [axisMax, axisStep, monthlyData],
  );

  const isLoading = contextLoading || loading;
  const hasData = monthlyData.some((item) => Number(item.amount) > 0);

  if (isLoading) {
    return <div className="h-full animate-pulse rounded-md bg-[#F2F2F2]" />;
  }

  if (!hasData) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#525252]">
        No monthly fee collection data available
      </div>
    );
  }

  return <AgCharts options={options} style={{ height: "100%", width: "100%" }} />;
}
