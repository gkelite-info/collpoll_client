import type { FacultyStudentProgressTrendPoint } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  Formatter,
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

const performanceFormatter: Formatter<ValueType, NameType> = (value, name) => [
  `${Number(value) ?? 0}%`,
  name as string,
];

type PerformanceTrendChartProps = {
  data: FacultyStudentProgressTrendPoint[];
};

export default function PerformanceTrendChart({
  data,
}: PerformanceTrendChartProps) {
  const chartData = data.length ? data : [{ month: "N/A", value: 0 }];

  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-white p-4 md:p-5 font-sans shadow-sm">
      <h2 className="mb-2 md:mb-4 text-[15px] md:text-lg font-bold text-[#282828]">
        Performance Trend
      </h2>

      <div className="flex-1 min-h-[220px] md:min-h-[300px] w-full mt-2 md:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
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
              tick={{ fontSize: 10, fill: "#888", fontWeight: 500 }}
              tickFormatter={(v) => `${v}%`}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#444", fontWeight: 600, dy: 10 }}
              interval={0}
            />

            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                color: "#111827",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                fontWeight: 600,
              }}
              formatter={performanceFormatter}
            />

            <Bar
              dataKey="value"
              maxBarSize={50}
              radius={[8, 8, 8, 8]}
              background={{ fill: "#EFF9EB", radius: 8 }}
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

                  if (!numericValue && numericValue !== 0) {
                    return null;
                  }

                  const r = width > 30 ? 14 : 11;
                  const fontSize = width > 30 ? 10 : 8;
                  const centerX = x + width / 2;

                  const adjustedY =
                    numericValue === 0
                      ? y - 10
                      : numericValue < 15
                        ? y + 2
                        : y + 14;

                  return (
                    <g>
                      <circle
                        cx={centerX}
                        cy={adjustedY}
                        r={r}
                        fill="#DFF2D6"
                        opacity={0.95}
                      />
                      <text
                        x={centerX}
                        y={adjustedY + fontSize * 0.35}
                        textAnchor="middle"
                        fill="#6DB951"
                        fontSize={fontSize}
                        fontWeight="800"
                      >
                        {`${numericValue}%`}
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
