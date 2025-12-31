"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface UptimeDataPoint {
  date: string;
  value: number;
}

interface UptimeChartProps {
  data: UptimeDataPoint[];
  title?: string;
  height?: number;
  className?: string;
}

const UptimeChart: React.FC<UptimeChartProps> = ({
  data,
  title = "System Uptime / Response Time",
  height = 350,
  className = "",
}) => {
  return (
    <div className={`w-full bg-white p-6 rounded-lg ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">{title}</h2>

      <div style={{ width: "100%", height: height }}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 0,
              left: -25,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#43C17A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#43C17A" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} horizontal={false} opacity={0} />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#374151", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#374151", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                color: "black",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${value}%`, "Uptime"]}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#43C17A"
              strokeWidth={2}
              fill="url(#colorUptime)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UptimeChart;
