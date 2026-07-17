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
} from "@/lib/helpers/Hr/attendance/AttendanceAnalyticsAPI";
import AttendanceTableShimmer from "@/app/(screens)/college-admin/my-attendance/shimmers/AttendanceTableShimmer";
import AttendanceStatusCardShimmer from "@/app/(screens)/college-admin/my-attendance/shimmers/AttendanceStatusCardShimmer";

interface Props {
  userId: number;
  profile: UniversalProfileData;
}

const AttendancePage = ({ userId, profile }: Props) => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const currentDate = new Date();
  const defaultMonth = currentDate
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const defaultYear = String(currentDate.getFullYear());

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
    fetchUserAttendanceStats(userId).then(setStats);
    loadRecords(defaultMonth, defaultYear);
  }, [userId]);

  const loadRecords = async (month: string, year: string) => {
    setTableLoading(true);
    const data = await fetchUserAttendanceRecords(userId, month, year);
    setRecords(data as AttendanceRecord[]);
    setTableLoading(false);
    setInitialLoad(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 w-full">
        <FacultyInfoCard profile={formattedProfile} />

        {stats ? (
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
          />
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
