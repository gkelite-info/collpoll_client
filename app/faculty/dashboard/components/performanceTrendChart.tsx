"use client";

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

export default function PerformanceTrendChart() {
  const data = [
    { month: "Jan", value: 78 },
    { month: "Feb", value: 52 },
    { month: "Mar", value: 70 },
    { month: "Apr", value: 49 },
    { month: "May", value: 79 },
    { month: "Jun", value: 84 },
    { month: "Jul", value: 43 },
    { month: "Aug", value: 72 },
    { month: "Sep", value: 79 },
    { month: "Oct", value: 56 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 w-full font-sans">
      <h2 className="text-lg font-bold mb-4 text-[#282828]">
        Performance Trend
      </h2>

      {/* Reduced height to 300px for compactness */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            // Reduced margins to save space
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A4DE85" />
                <stop offset="100%" stopColor="#8CCB72" />
              </linearGradient>
            </defs>

            <YAxis
              domain={[0, 100]} // Fixed domain ensures background bar hits top
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
              interval={0} // Force show all labels
            />

            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}%`, "Performance"]}
            />

            <Bar
              dataKey="value"
              // maxBarSize allows bars to shrink on small screens but stops getting huge on large ones
              maxBarSize={50}
              radius={[12, 12, 12, 12]}
              // This prop creates the "Full" background automatically
              background={{ fill: "#EFF9EB", radius: 12 }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill="url(#barGradient)" />
              ))}

              <LabelList
                dataKey="value"
                position="top"
                content={(props: any) => {
                  const { x, y, width, value } = props;
                  // Compact bubble sizing
                  const r = width > 30 ? 16 : 12; // Shrink bubble if bar is narrow
                  const fontSize = width > 30 ? 11 : 9;
                  const centerY = y + r * 1.5;
                  const centerX = x + width / 2;

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
