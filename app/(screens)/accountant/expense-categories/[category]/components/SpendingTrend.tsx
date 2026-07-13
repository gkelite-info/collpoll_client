"use client";

import { useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import type { AccountantExpense } from "@/lib/helpers/accountant/accountantExpensesAPI";

ModuleRegistry.registerModules([AllCommunityModule]);

type TrendPeriod = "monthly" | "quarterly" | "half-yearly" | "yearly";

export function SpendingTrend({ expenses }: { expenses: AccountantExpense[] }) {
  const [period, setPeriod] = useState<TrendPeriod>("monthly");
  const chartData = useMemo(
    () => {
      const totals = new Map<string, { label: string; amount: number; order: number }>();
      if (!expenses.length) return [];

      const bucketFor = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        if (period === "quarterly") {
          const quarter = Math.floor(month / 3) + 1;
          return { key: `${year}-Q${quarter}`, label: `Q${quarter} ${year}`, order: year * 10 + quarter };
        }
        if (period === "half-yearly") {
          const half = month < 6 ? 1 : 2;
          return { key: `${year}-H${half}`, label: `H${half} ${year}`, order: year * 10 + half };
        }
        if (period === "yearly") return { key: String(year), label: String(year), order: year };
        return {
          key: `${year}-${String(month + 1).padStart(2, "0")}`,
          label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          order: year * 100 + month,
        };
      };

      const years = expenses.map((expense) =>
        new Date(`${expense.expenseDate}T00:00:00`).getFullYear(),
      );
      let firstYear = Math.min(...years);
      let lastYear = Math.max(...years);
      if (period === "yearly" && firstYear === lastYear) {
        firstYear -= 1;
        lastYear += 1;
      }

      for (let year = firstYear; year <= lastYear; year += 1) {
        const months = period === "monthly" ? 12 : period === "quarterly" ? 4 : period === "half-yearly" ? 2 : 1;
        for (let index = 0; index < months; index += 1) {
          const month = period === "quarterly" ? index * 3 : period === "half-yearly" ? index * 6 : index;
          const bucket = bucketFor(new Date(year, month, 1));
          totals.set(bucket.key, { label: bucket.label, order: bucket.order, amount: 0 });
        }
      }

      expenses.forEach((expense) => {
        const bucket = bucketFor(new Date(`${expense.expenseDate}T00:00:00`));
        const current = totals.get(bucket.key);
        totals.set(bucket.key, {
          label: bucket.label,
          order: bucket.order,
          amount: (current?.amount ?? 0) + expense.amount,
        });
      });
      return Array.from(totals.values())
        .sort((first, second) => first.order - second.order)
        .map((item) => ({ period: item.label, amount: item.amount }));
    },
    [expenses, period],
  );

  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
      background: { fill: "transparent" },
      padding: { top: 18, right: 10, bottom: 0, left: 10 },
      series: [
        {
          type: "line",
          xKey: "period",
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
        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value as TrendPeriod)}
          aria-label="Spending trend period"
          className="h-9 cursor-pointer rounded-lg border border-[#CBD5C9] bg-white px-4 text-[13px] font-medium text-[#282828] outline-none"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="half-yearly">Half Yearly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div className="custom-scrollbar mt-6 overflow-x-auto pb-2">
        <div
          className="h-[250px]"
          style={{ width: `${Math.max(1120, chartData.length * 140)}px` }}
        >
          <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </section>
  );
}
