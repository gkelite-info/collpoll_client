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

// 🟢 Custom Table Skeleton
const TableSkeletonOverlay = () => (
  <div className="absolute inset-0 z-10 bg-white rounded-lg flex flex-col border border-gray-100 shadow-sm">
    <div className="flex justify-between items-end mb-2.5 p-4 pb-0">
      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
    <div className="mt-1 mx-4 border border-gray-100 rounded-lg overflow-hidden">
      <div className="bg-[#F2F2F2] flex gap-4 p-3 border-b border-gray-100">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="h-3 flex-1 bg-gray-300 rounded animate-pulse"
          />
        ))}
      </div>
      <div className="p-3 space-y-5 mt-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4">
            {[...Array(7)].map((_, j) => (
              <div
                key={j}
                className="h-3 flex-1 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AttendanceAnalyticsPage = ({ userId, profile }: Props) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [facultyInfo, setFacultyInfo] =
    useState<AnalyticsFacultyProfile | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

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
        employeeId: String(profile.userId || userId),
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
  }, [userId, profile]);

  const loadRecords = async (month: string, year: string) => {
    setLoadingTable(true);
    const data = await fetchUserAttendanceRecords(userId, month, year);
    setRecords(data as AttendanceRecord[]);
    setLoadingTable(false);
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

      <div className="relative min-h-[350px]">
        {loadingTable && <TableSkeletonOverlay />}
        <AttendanceTable
          title="Daily Attendance Record"
          records={records}
          month={defaultMonth}
          year={defaultYear}
          onDateChange={loadRecords}
        />
      </div>
    </div>
  );
};

export default AttendanceAnalyticsPage;
