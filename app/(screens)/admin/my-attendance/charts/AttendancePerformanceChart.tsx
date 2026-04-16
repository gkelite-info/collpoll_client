import { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

type ChartDataPoint = {
  month: string;
  performance: number;
  attendance: number;
};

interface Props {
  data?: ChartDataPoint[];
}

const mockChartData: ChartDataPoint[] = [
  { month: "Jan", performance: 71, attendance: 10 },
  { month: "Feb", performance: 96, attendance: 15 },
  { month: "Mar", performance: 100, attendance: 18 },
  { month: "Apr", performance: 40, attendance: 14 },
  { month: "May", performance: 35, attendance: 23 },
  { month: "Jun", performance: 42, attendance: 14 },
  { month: "Jul", performance: 47, attendance: 32 },
];

const AttendancePerformanceChart: FC<Props> = ({ data }) => {
  const chartData = data ?? mockChartData;

  const tooltipFormatter: TooltipProps<number, string>["formatter"] = (
    value,
    name,
  ) => {
    if (name === "Performance") {
      return [`${value}%`, name];
    }
    return [value, name];
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center items-center gap-6 pt-5">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[13px] text-gray-700 leading-none">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5 w-full">
      <h3 className="text-[#282828] font-bold text-[15px] mb-6">
        Attendance & Performance Trend
      </h3>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} stroke="#F1F5F9" />

            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12.5 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12.5 }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip
              formatter={tooltipFormatter}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />

            {/* <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "13px", paddingTop: "20px" }}
            /> */}

            <Legend content={renderLegend} />

            <Line
              type="linear"
              dataKey="performance"
              name="Performance"
              stroke="#1E293B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />

            <Line
              type="linear"
              dataKey="attendance"
              name="Attendance"
              stroke="#43C17A"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendancePerformanceChart;
