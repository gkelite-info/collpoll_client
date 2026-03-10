import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartData {
  month: string;
  value: number;
}

interface Props {
  title: string;
  data: ChartData[];
  onBarClick?: (month: string) => void;
}

export default function MonthlyAttendanceChart({
  title,
  data,
  onBarClick,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#282828] font-medium text-[15px]">{title}</h3>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#43C17A" stopOpacity={1} />
                <stop offset="100%" stopColor="#205B3A" stopOpacity={1} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#282828", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              domain={[0, 70]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              labelStyle={{ color: "gray" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="value"
              barSize={32}
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              activeBar={{ fillOpacity: 0.7 }}
              onClick={(data: any) => {
                const clickedMonth = data?.payload?.month || data?.month;
                if (onBarClick && clickedMonth) {
                  onBarClick(clickedMonth);
                }
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="url(#greenGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
