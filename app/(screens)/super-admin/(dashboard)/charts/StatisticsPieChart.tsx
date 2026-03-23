import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface StatData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface StatisticsPieChartProps {
  data?: StatData[];
}

const DEFAULT_PIE_DATA: StatData[] = [
  { name: "Total Colleges", value: 2004, color: "#7b5ef0" },
  { name: "Total Users", value: 12450, color: "#3ec465" },
  { name: "Deactivated", value: 2200, color: "#fc3c3c" },
  { name: "New Registrations", value: 3008, color: "#5da7ff" },
  { name: "Past Users", value: 12450, color: "#f5d000" },
];

const StatisticsPieChart: React.FC<StatisticsPieChartProps> = ({
  data = DEFAULT_PIE_DATA,
}) => {
  return (
    <div className="bg-[#fffdfd] rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col w-full">
      <h2 className="text-[18px] font-bold text-[#2d2d2d] mb-2">Statistics</h2>

      <div className="h-[180px] w-full mb-4 relative flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
            />
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 w-full px-1">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between group cursor-default"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[13px] font-bold text-[#4b5563]">
                {item.name}
              </span>
            </div>
            <span
              className="text-[13px] font-bold"
              style={{ color: item.color }}
            >
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsPieChart;
