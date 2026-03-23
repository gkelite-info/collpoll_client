"use client";

import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import SystemActivity from "./SystemActivity";
import StatisticsPieChart from "../charts/StatisticsPieChart";

export default function DashRight() {
  return (
    <div className="w-[32%] px-2 flex flex-col gap-6 pb-6">
      <WorkWeekCalendar />

      <StatisticsPieChart />

      <SystemActivity />
    </div>
  );
}
