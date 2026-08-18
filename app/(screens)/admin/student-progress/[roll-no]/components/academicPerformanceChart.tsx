"use client";

import { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  CartesianGrid,
} from "recharts";

type SubjectMetric = {
  subject: string;
  value: number;
  full: number;
};

interface AcademicPerformanceProps {
  data?: SubjectMetric[];
}

/* ── Layout constants ── */
const YAXIS_WIDTH = 48;          // px reserved for fixed Y-axis labels
const CHART_HEIGHT = 300;        // total chart height including x-axis
const TOP_PAD = 20;              // space above the tallest bar
const XAXIS_HEIGHT = 44;         // space for subject labels at bottom
const PLOT_HEIGHT = CHART_HEIGHT - TOP_PAD - XAXIS_HEIGHT; // usable bar area
const BAR_SLOT_WIDTH = 90;       // px per subject when scrolling
const MAX_FIT = 5;               // subjects that fit without needing scroll

const Y_TICKS = [100, 75, 50, 25, 0];

export default function AcademicPerformance({
  data = [],
}: AcademicPerformanceProps) {
  const chartData = data.length
    ? data
    : [{ subject: "N/A", value: 0, full: 100 }];

  const needsScroll = chartData.length > MAX_FIT;
  const innerWidth = needsScroll
    ? chartData.length * BAR_SLOT_WIDTH
    : undefined; // undefined = 100% of container

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-white px-2 pt-5 shadow-md">
      <h2 className="ml-3 shrink-0 text-xl font-semibold text-[#282828]">
        Academic Performance
      </h2>

      {/*
        Outer layout: fixed Y-axis labels on left + scrollable chart on right.
        Both share the same height so they stay perfectly aligned.
      */}
      <div className="relative mt-4 flex" style={{ height: CHART_HEIGHT }}>

        {/* ─── Fixed Y-Axis labels ─── */}
        <div
          className="relative z-10 shrink-0 flex flex-col justify-between bg-white pr-1"
          style={{
            width: YAXIS_WIDTH,
            paddingTop: TOP_PAD - 6,          // center first label on gridline
            paddingBottom: XAXIS_HEIGHT - 6,   // center last label on gridline
          }}
        >
          {Y_TICKS.map((v) => (
            <span
              key={v}
              className="block text-right text-[12px] leading-none text-[#888]"
            >
              {v}%
            </span>
          ))}
        </div>

        {/* ─── Fixed Y-axis vertical line ─── */}
        <div
          className="absolute z-[5] bg-[#ccc]"
          style={{
            left: YAXIS_WIDTH,
            top: TOP_PAD,
            bottom: XAXIS_HEIGHT,
            width: 1,
          }}
        />

        {/* ─── Fixed X-axis horizontal baseline ─── */}
        <div
          className="absolute z-[5] bg-[#ccc]"
          style={{
            left: YAXIS_WIDTH,
            right: 0,
            bottom: XAXIS_HEIGHT,
            height: 1,
          }}
        />

        {/* ─── Scrollable bars + X-axis labels ─── */}
        <div
          ref={scrollRef}
          className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar"
        >
          <div
            className="h-full"
            style={{ width: innerWidth ?? "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: TOP_PAD, right: 20, left: 0, bottom: 0 }}
                barGap={-50}
                barCategoryGap={0}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A8E089" />
                    <stop offset="100%" stopColor="#9ACC7D" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines for reference */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                {/* Hidden Y-axis — domain must match the fixed labels */}
                <YAxis hide domain={[0, 100]} />

                {/* X-axis — subject names scroll WITH their bars */}
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 9, fill: "#000" }}
                  interval={0}
                  angle={0}
                  textAnchor="middle"
                  height={XAXIS_HEIGHT}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />

                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "#000000", fontWeight: 600 }}
                  itemStyle={{ color: "#000000", fontSize: 13 }}
                />

                {/* Background bar (light green) */}
                <Bar
                  dataKey="full"
                  barSize={50}
                  fill="rgba(233, 245, 230, 0.7)"
                  radius={[10, 10, 10, 10]}
                />

                {/* Actual value bar (gradient green) */}
                <Bar dataKey="value" barSize={50} radius={[10, 10, 10, 10]}>
                  <LabelList
                    dataKey="value"
                    content={(props: any) => {
                      const { x, y, width, value } = props;
                      const numericValue =
                        typeof value === "number" ? value : Number(value ?? 0);
                      const centerX = x + width / 2;
                      const centerY =
                        numericValue === 0
                          ? y - 12
                          : numericValue < 15
                          ? y + 2
                          : y + 12;
                      return (
                        <g>
                          <circle
                            cx={centerX}
                            cy={centerY}
                            r={11.5}
                            fill="#E8F6E2"
                          />
                          <text
                            x={centerX}
                            y={centerY + 4}
                            textAnchor="middle"
                            fill="#7CD24C"
                            fontSize={8}
                            fontWeight="bold"
                          >
                            {`${numericValue}%`}
                          </text>
                        </g>
                      );
                    }}
                  />

                  {chartData.map((_, i) => (
                    <Cell key={i} fill="url(#barGradient)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
