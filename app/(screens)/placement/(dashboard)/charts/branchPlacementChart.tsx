import React from "react";
import { CaretRight } from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export interface BranchDataPoint {
  name: string;
  value: number;
}

export interface BranchPlacementChartProps {
  data: BranchDataPoint[];
}

const CustomBranchTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 flex flex-col gap-1 z-50">
        <span className="text-[12px] font-bold text-gray-800">
          Branch: {data.name}
        </span>
        <span className="text-[12px] font-semibold text-[#38A169]">
          Placed: {data.value}%
        </span>
      </div>
    );
  }
  return null;
};

export const BranchPlacementChart: React.FC<BranchPlacementChartProps> = ({
  data,
}) => {
  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100/50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-bold text-[#1F2937]">
          Branch-wise Placement Status
        </h2>
        <CaretRight size={16} className="text-gray-500" />
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            barSize={24}
          >
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38A169" stopOpacity={1} />
                <stop offset="100%" stopColor="#22543D" stopOpacity={1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4B5563", fontSize: 10, fontWeight: 500 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4B5563", fontSize: 10 }}
              ticks={[0, 15, 30, 45, 60, 75, 90, 100]}
              tickFormatter={(val) => `${val}%`}
            />

            <Tooltip
              content={<CustomBranchTooltip />}
              cursor={{ fill: "transparent" }}
            />

            <Bar
              dataKey="value"
              fill="url(#greenGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
