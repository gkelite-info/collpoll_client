"use client";

import { Calendar } from "@phosphor-icons/react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useTranslations } from "next-intl";

type chartProps = {
  month: string;
  value: number;
};

type attendanceProp = {
  percentage: number;
  data?: chartProps[];
};

export default function AttendanceCard({ percentage, data }: attendanceProp) {
  const t = useTranslations("Dashboard.parent");

  return (
    <div className="bg-white h-[180px] lg:h-[200px] w-full lg:w-[32%] rounded-lg p-2.5 lg:p-2 flex flex-col gap-2 shadow-md">
      <div className="bg-pink-00 w-full h-[20%] flex items-center justify-between gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-[#EAECFC] rounded-lg p-1.5 lg:p-1 shrink-0">
            <Calendar
              className="w-4 h-4 lg:w-[22px] lg:h-[22px]"
              weight="fill"
              color="#604DDC"
            />
          </div>
          <h4 className="text-[13px] lg:text-lg font-medium text-[#282828] truncate">
            {t("Attendance")}
          </h4>
        </div>
        <div className="rounded-full px-1.5 py-0.5 lg:h-8 lg:w-8 bg-[#E9E7FA] flex items-center justify-center shrink-0">
          <p className="text-[#604DDC] text-[10px] lg:text-xs font-semibold">
            {percentage}%
          </p>
        </div>
      </div>
      <div className="bg-yellow-00 w-full h-[80%] pt-1 lg:pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              labelStyle={{ color: "black", fontWeight: "600" }}
              itemStyle={{ color: "#282828" }}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
            />
            <Bar
              dataKey="value"
              barSize={18}
              radius={[5, 5, 0, 0]}
              fill="#A2D884"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
