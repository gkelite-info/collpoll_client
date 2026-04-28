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

type AcademicPerformanceItem = {
  subject: string;
  value: number;
  full: number;
};

interface AcademicPerformanceProps {
  data?: AcademicPerformanceItem[];
}

export default function AcademicPerformance({
  data,
}: AcademicPerformanceProps) {
  const defaultData: AcademicPerformanceItem[] = [
    { subject: "Java Programming", value: 70, full: 100 },
    { subject: "Data Structures", value: 50, full: 100 },
    { subject: "Database Management Systems", value: 80, full: 100 },
    { subject: "Operating Systems", value: 35, full: 100 },
    { subject: "Software Engineering", value: 80, full: 100 },
    { subject: "Web Development", value: 60, full: 100 },
  ];

  const chartData = (data && data.length ? data : defaultData).length
    ? data && data.length
      ? data
      : defaultData
    : [{ subject: "No Data", value: 0, full: 100 }];

  return (
    <div className="bg-white rounded-lg shadow-md px-2 pt-5 w-full max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold ml-3 text-[#282828]">
        Academic Performance
      </h2>

      <div className="w-full h-70 bg-green-00">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 40, right: 30, left: 0, bottom: 0 }}
            barGap={-50}
            barCategoryGap={0}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8E089" />
                <stop offset="100%" stopColor="#9ACC7D" />
              </linearGradient>
            </defs>

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#888" }}
              tickFormatter={(v) => `${v}%`}
            />

            <XAxis
              dataKey="subject"
              tick={{ fontSize: 8.5, fill: "#000" }}
              interval={0}
              angle={0}
              textAnchor="middle"
              height={60}
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
              labelStyle={{
                color: "#000000",
                fontWeight: 600,
              }}
              itemStyle={{
                color: "#000000",
                fontSize: 13,
              }}
            />

            <Bar
              dataKey="full"
              barSize={50}
              fill="rgba(233, 245, 230, 0.7)"
              radius={[10, 10, 10, 10]}
            />

            <Bar dataKey="value" barSize={50} radius={[10, 10, 10, 10]}>
              <LabelList
                dataKey="value"
                position="insideTop"
                content={(props: any) => {
                  const { x, y, width, value } = props;
                  return (
                    <g>
                      <circle
                        cx={x + width / 2}
                        cy={y + 25}
                        r={18}
                        fill="#E8F6E2"
                      />
                      <text
                        x={x + width / 2}
                        y={y + 30}
                        textAnchor="middle"
                        fill="#7CD24C"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {`${value}%`}
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
  );
}
