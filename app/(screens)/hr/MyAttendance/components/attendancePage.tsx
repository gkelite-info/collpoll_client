"use client";

import { useEffect, useState } from "react";
import AttendanceTable from "../tables/attendanceTable";
import { AttendanceRecord, AttendanceStats, FacultyProfile } from "../types";
import AttendanceStatusCard from "./attendanceStatusCard";
import FacultyInfoCard from "./facultyInfoCard";
import { UniversalProfileData } from "@/lib/helpers/Hr/myAttendance/fetchUniversalStaff";
import {
  fetchUserAttendanceRecords,
  fetchUserAttendanceStats,
  calculateMonthlyAttendanceStats,
} from "@/lib/helpers/Hr/attendance/AttendanceAnalyticsAPI";
import AttendanceTableShimmer from "@/app/(screens)/college-admin/my-attendance/shimmers/AttendanceTableShimmer";
import AttendanceStatusCardShimmer from "@/app/(screens)/college-admin/my-attendance/shimmers/AttendanceStatusCardShimmer";

const parseJoiningDate = (dateStr: string | null): Date | null => {
  if (!dateStr || dateStr === "Not Provided" || dateStr === "N/A") return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const parseRowDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
};

const months = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

interface Props {
  userId: number;
  profile: UniversalProfileData;
}

const AttendancePage = ({ userId, profile }: Props) => {
  const [rawStats, setRawStats] = useState<AttendanceStats | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const currentDate = new Date();
  const defaultMonth = currentDate
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const defaultYear = String(currentDate.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const staffName = profile.name || "Unknown Staff";

  const formattedProfile: FacultyProfile = {
    name: staffName,
    image: profile.image || "",
    id: String(profile.identifierId || profile.id || profile.userId || userId),
    department: profile.role || "N/A",
    mobile: profile.mobile || "N/A",
    email: profile.email || "N/A",
    joiningDate: profile.joiningDate || "N/A",
    experience: profile.experience ? `${profile.experience} Years` : "N/A",
  };

  useEffect(() => {
    loadRecords(defaultMonth, defaultYear);
  }, [userId]);

  const loadRecords = async (monthName: string, yearStr: string) => {
    setTableLoading(true);
    setStatsLoading(true);
    const monthNum = months.indexOf(monthName) + 1;
    const yearNum = Number(yearStr);
    setSelectedMonth(monthNum);
    setSelectedYear(yearNum);

    try {
      const [recordsData, statsData] = await Promise.all([
        fetchUserAttendanceRecords(userId, monthName, yearStr),
        calculateMonthlyAttendanceStats(userId, monthNum, yearNum)
      ]);

      setRecords(recordsData as AttendanceRecord[]);
      setRawStats({
        todayStatus: (statsData as any).todayStatus || "Not Marked",
        ...statsData
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
      setStatsLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!rawStats) {
      setStats(null);
      return;
    }

    const dateOfJoining = profile.joiningDate;
    if (!dateOfJoining) {
      setStats(rawStats);
      return;
    }

    const joiningDateObj = parseJoiningDate(dateOfJoining);
    if (!joiningDateObj) {
      setStats(rawStats);
      return;
    }

    const selectedMonthStart = new Date(selectedYear, selectedMonth - 1, 1);
    const selectedMonthEnd = new Date(selectedYear, selectedMonth, 0);

    // Case A: Selected month is entirely before joining date
    if (selectedMonthEnd < joiningDateObj) {
      setStats({
        todayStatus: "Not Marked",
        totalWorkingDays: 0,
        leavesTaken: 0,
        remainingLeaves: rawStats.remainingLeaves,
        lopDays: 0
      });
      return;
    }

    // Case B: Selected month is the same month as joining date
    if (
      selectedYear === joiningDateObj.getFullYear() &&
      selectedMonth - 1 === joiningDateObj.getMonth()
    ) {
      let preJoiningAbsentCount = 0;
      records.forEach((row) => {
        const rowDateObj = parseRowDate(row.date);
        if (rowDateObj) {
          rowDateObj.setHours(0, 0, 0, 0);
          if (rowDateObj < joiningDateObj) {
            const status = row.status?.toUpperCase();
            if (status === "ABSENT" || !status || status === "—") {
              preJoiningAbsentCount++;
            }
          }
        }
      });

      setStats({
        ...rawStats,
        lopDays: Math.max(0, (rawStats.lopDays ?? 0) - preJoiningAbsentCount)
      });
      return;
    }

    // Case C: Selected month is after joining date
    setStats(rawStats);
  }, [rawStats, records, profile.joiningDate, selectedMonth, selectedYear]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 w-full">
        <FacultyInfoCard profile={formattedProfile} />

        {stats && !statsLoading ? (
          <AttendanceStatusCard stats={stats} />
        ) : (
          <AttendanceStatusCardShimmer />
        )}
      </div>

      <div className="flex-1 min-h-[350px]">
        {initialLoad ? (
          <AttendanceTableShimmer />
        ) : (
          <AttendanceTable
            records={records}
            month={defaultMonth}
            year={defaultYear}
            onDateChange={loadRecords}
            loading={tableLoading}
            dateOfJoining={profile.joiningDate}
          />
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
