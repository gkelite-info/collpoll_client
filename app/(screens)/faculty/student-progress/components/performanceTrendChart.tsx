"use client";

import type { FacultyStudentProgressTrendPoint } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

import type { Formatter } from "recharts/types/component/DefaultTooltipContent";

const performanceFormatter: Formatter<number, string> = (value, name) => [
  `${value ?? 0}%`,
  name,
];

type PerformanceTrendChartProps = {
  data: FacultyStudentProgressTrendPoint[];
};

export default function PerformanceTrendChart({
  data,
}: PerformanceTrendChartProps) {
  const chartData = data.length ? data : [{ month: "N/A", value: 0 }];

  return (
    <div className="w-full rounded-xl bg-white p-4 font-sans shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-[#282828]">
        Performance Trend
      </h2>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A4DE85" />
                <stop offset="100%" stopColor="#8CCB72" />
              </linearGradient>
            </defs>

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#888", fontWeight: 500 }}
              tickFormatter={(v) => `${v}%`}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#444", fontWeight: 600, dy: 10 }}
              interval={0}
            />

            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                color: "black",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "12px",
              }}
              formatter={performanceFormatter}
            />

            <Bar
              dataKey="value"
              maxBarSize={50}
              radius={[12, 12, 12, 12]}
              background={{ fill: "#EFF9EB", radius: 12 }}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill="url(#barGradient)" />
              ))}

              <LabelList
                dataKey="value"
                position="top"
                content={(props: any) => {
                  const { x, y, width, value } = props;
                  const numericValue =
                    typeof value === "number" ? value : Number(value ?? 0);

                  if (!numericValue) {
                    return null;
                  }

                  const r = width > 30 ? 16 : 12;
                  const fontSize = width > 30 ? 11 : 9;
                  const centerX = x + width / 2;
                  const centerY = Math.max(y - r - 6, 18);

                  return (
                    <g>
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r={r}
                        fill="#DFF2D6"
                        opacity={0.9}
                      />
                      <text
                        x={centerX}
                        y={centerY}
                        dy={fontSize / 3}
                        textAnchor="middle"
                        fill="#6DB951"
                        fontSize={fontSize}
                        fontWeight="800"
                      >
                        {`${value}%`}
                      </text>
                    </g>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
