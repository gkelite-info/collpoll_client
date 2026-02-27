import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
  Tooltip,
} from "recharts";
import { CaretRight } from "@phosphor-icons/react";

export interface GrowthChartDataPoint {
  id: string;
  label: string;
  value: number;
  color: string;
  branch?: string;
}

export interface GrowthLegendItem {
  branch: string;
  color: string;
}

export interface PlacementGrowthChartProps {
  chartData: GrowthChartDataPoint[];
  legendData: GrowthLegendItem[];
}

const CustomGrowthTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.id.startsWith("gap")) return null;

    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 flex flex-col gap-1 z-50">
        <span className="text-[12px] font-bold text-gray-800">
          {data.branch}{" "}
          <span className="text-gray-400 font-normal">| {data.label}</span>
        </span>
        <span className="text-[12px] font-semibold text-[#38A169]">
          Placement: {data.value}%
        </span>
      </div>
    );
  }
  return null;
};

export const PlacementGrowthChart: React.FC<PlacementGrowthChartProps> = ({
  chartData,
  legendData,
}) => {
  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100/50 flex flex-col w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-[#1F2937]">
            Placement Growth Trend
          </h2>
          <span className="text-[11px] font-semibold text-[#1E305A]">
            (This Year VS Last Year)
          </span>
        </div>
        <CaretRight size={16} className="text-gray-900" />
      </div>

      <div className="flex-grow w-full h-[250px] mb-2 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            barSize={18}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis
              dataKey="id"
              type="category"
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(id) => {
                const item = chartData.find((d) => d.id === id);
                return item ? item.label : "";
              }}
              tick={{ fontSize: 11, fill: "#1F2937", fontWeight: 500 }}
            />

            <Tooltip
              content={<CustomGrowthTooltip />}
              cursor={{ fill: "transparent" }}
            />

            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              <LabelList
                dataKey="value"
                position="insideRight"
                formatter={(
                  val: string | number | boolean | null | undefined,
                ) => (typeof val === "number" && val > 0 ? `${val}%` : "")}
                fill="#ffffff"
                fontSize={10}
                fontWeight={600}
                offset={8}
              />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center px-1 mt-auto">
        {legendData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] font-bold text-gray-800">
              {item.branch}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
