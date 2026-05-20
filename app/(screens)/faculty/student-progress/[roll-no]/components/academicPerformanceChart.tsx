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
  const chartData =
    data && data.length ? data : [{ subject: "N/A", value: 0, full: 100 }];

  return (
    <div className="bg-white rounded-2xl md:rounded-[20px] shadow-sm p-4 md:p-6 w-full h-full flex flex-col">
      <h2 className="text-[16px] md:text-xl font-bold text-[#282828] mb-4">
        Academic Performance
      </h2>

      <div className="w-full flex-1 min-h-[220px] md:min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
            barGap={-50}
            barCategoryGap={0}
          >
            <defs>
              <linearGradient
                id="academicBarGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#A8E089" />
                <stop offset="100%" stopColor="#9ACC7D" />
              </linearGradient>
            </defs>

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#888", fontWeight: 500 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
            />

            <XAxis
              dataKey="subject"
              tick={{ fontSize: 9, fill: "#444", fontWeight: 600 }}
              interval={0}
              angle={0}
              textAnchor="middle"
              height={40}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
              labelStyle={{
                color: "#000000",
                fontWeight: 700,
                fontSize: 12,
              }}
              itemStyle={{
                color: "#43C17A",
                fontSize: 12,
                fontWeight: 600,
              }}
            />

            <Bar
              dataKey="full"
              maxBarSize={50}
              fill="rgba(233, 245, 230, 0.5)"
              radius={[8, 8, 8, 8]}
            />

            <Bar dataKey="value" maxBarSize={50} radius={[8, 8, 8, 8]}>
              <LabelList
                dataKey="value"
                content={(props: any) => {
                  const { x, y, width, value } = props;
                  const numericValue =
                    typeof value === "number" ? value : Number(value ?? 0);

                  if (!numericValue && numericValue !== 0) return null;

                  const centerX = x + width / 2;
                  const r = width > 30 ? 11.5 : 8;
                  const fontSize = width > 30 ? 8 : 6;

                  const centerY =
                    numericValue === 0
                      ? y - 10
                      : numericValue < 15
                        ? y + 2
                        : y + 10;

                  return (
                    <g>
                      <circle cx={centerX} cy={centerY} r={r} fill="#E8F6E2" />
                      <text
                        x={centerX}
                        y={centerY + fontSize * 0.35}
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

              {chartData.map((_, i) => (
                <Cell key={i} fill="url(#academicBarGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
