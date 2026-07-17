"use client";

import React, { useEffect, useState } from "react";
import AnalyticsFacultyInfo from "./AnalyticsFacultyInfo";
import {
  AnalyticsFacultyProfile,
  AttendanceRecord,
  ChartDataPoint,
} from "../types";
import AttendancePerformanceChart from "../charts/AttendancePerformanceChart";
import AttendanceTable from "../tables/attendanceTable";
import { UniversalProfileData } from "@/lib/helpers/Hr/myAttendance/fetchUniversalStaff";
import {
  fetchUserAttendanceRecords,
  fetchUserAttendanceStats,
  fetchUserMonthlyChartData,
} from "@/lib/helpers/Hr/attendance/AttendanceAnalyticsAPI";
import AttendanceTableShimmer from "@/app/(screens)/college-admin/my-attendance/shimmers/AttendanceTableShimmer";

interface Props {
  userId: number;
  profile: UniversalProfileData;
}

// 🟢 Custom Analytics Info Skeleton
const AnalyticsInfoSkeleton = () => (
  <div className="w-full mb-5">
    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-5" />
    <div className="grid grid-cols-3 gap-y-5 w-full">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

// 🟢 Custom Chart Skeleton
const ChartSkeleton = () => {
  // Static heights to prevent hydration mismatch
  const heights = [40, 60, 30, 80, 50, 90, 70, 45, 65, 85, 35, 75];
  return (
    <div className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5 z-10 flex flex-col">
      <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mb-8" />
      <div className="flex-1 flex items-end justify-between gap-2 px-2">
        {heights.map((h, i) => (
          <div
            key={i}
            className="w-8 bg-gray-100 rounded-t-md animate-pulse"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
};

const AttendanceAnalyticsPage = ({ userId, profile }: Props) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [facultyInfo, setFacultyInfo] =
    useState<AnalyticsFacultyProfile | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const currentDate = new Date();
  const defaultMonth = currentDate
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const defaultYear = String(currentDate.getFullYear());

  useEffect(() => {
    const staffName = profile.name || "Unknown Staff";
    const role = profile.role || "N/A";
    const experience = profile.experience
      ? `${profile.experience} Years`
      : "N/A";

    // 1. Build Info Card
    fetchUserAttendanceStats(userId).then((stats) => {
      setFacultyInfo({
        name: staffName,
        department: role,
        employeeId: String(profile.identifierId || "N/A"),
        experience: experience,
        leavesTaken: stats.leavesTaken,
        workingDays: stats.totalWorkingDays,
      });
    });

    // 2. Build Chart
    fetchUserMonthlyChartData(userId, defaultYear).then((data) => {
      setChartData(data);
      setLoadingChart(false);
    });

    // 3. Initial records fetch
    loadRecords(defaultMonth, defaultYear);
  }, [userId, profile]);

  const loadRecords = async (month: string, year: string) => {
    setLoadingTable(true);
    const data = await fetchUserAttendanceRecords(userId, month, year);
    setRecords(data as AttendanceRecord[]);
    setLoadingTable(false);
    setInitialLoad(false);
  };

  return (
    <div className="flex flex-col w-full">
      {facultyInfo ? (
        <AnalyticsFacultyInfo profile={facultyInfo} />
      ) : (
        <AnalyticsInfoSkeleton />
      )}

      <div className="relative min-h-[300px] mb-5">
        {loadingChart && <ChartSkeleton />}
        <AttendancePerformanceChart data={chartData} />
      </div>

      <div className="flex-1 min-h-[350px]">
        {initialLoad ? (
          <AttendanceTableShimmer />
        ) : (
          <AttendanceTable
            title="Daily Attendance Record"
            records={records}
            month={defaultMonth}
            year={defaultYear}
            onDateChange={loadRecords}
            loading={loadingTable}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceAnalyticsPage;
