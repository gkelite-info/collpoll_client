"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AttendanceInsightProps {
  weeklyData?: number[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-md border border-[#D9DEE8] bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-[#1F2937]">{label}</p>
      <p className="text-sm font-medium text-[#43C17A]">{`Percentage: ${value}%`}</p>
    </div>
  );
}

export default function AttendanceInsight({
  weeklyData = [80, 70, 90, 50, 30, 85, 62],
}: AttendanceInsightProps) {
  const data = ["M", "TU", "W", "TH", "F", "S"].map((day, index) => ({
    day,
    percentage: weeklyData[index] || 0,
  }));

  return (
    <div className="bg-white relative overflow-hidden rounded-lg p-4 shadow-sm w-full">
      <h2 className="text-[#282828] font-semibold text-lg mb-4">
        Attendance Insight
      </h2>

      <div className="w-full h-90">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            barCategoryGap="15%" 
          >
            
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              horizontal={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#666" }}
              axisLine={false} 
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              allowDataOverflow={true}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: "#666" }}
              axisLine={false} 
              tickLine={false}
              width={38}
            />
            <Tooltip
              cursor={{ fill: "rgba(67, 193, 122, 0.1)" }}
              content={<CustomTooltip />}
            />
            
            <defs>
              <linearGradient
                id="attendanceGradient"
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop offset="0%" stopColor="#205B3A" />
                <stop offset="100%" stopColor="#43C17A" />
              </linearGradient>
            </defs>

            <Bar
              dataKey="percentage"
              fill="url(#attendanceGradient)"
              radius={[6, 6, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
