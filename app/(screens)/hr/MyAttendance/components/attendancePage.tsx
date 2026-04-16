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

interface Props {
  userId: number;
  profile: UniversalProfileData;
}

// 🟢 Custom Status Card Skeleton
const StatusCardSkeleton = () => (
  <div className="bg-white rounded-xl p-4 w-[30%] shadow-sm flex flex-col justify-between border border-gray-100/50 min-h-[160px]">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="mb-2 last:mb-0">
        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

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

const AttendancePage = ({ userId, profile }: Props) => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const defaultMonth = currentDate
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const defaultYear = String(currentDate.getFullYear());

  const staffName = profile.name || "Unknown Staff";

  const displayImage =
    profile.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=e2f6ea&color=43C17A&size=128&bold=true`;

  const formattedProfile: FacultyProfile = {
    name: staffName,
    image: displayImage,
    id: String(profile.userId || userId),
    department: profile.role || "N/A",
    mobile: profile.mobile || "N/A",
    email: profile.email || "N/A",
    joiningDate: profile.joiningDate || "N/A",
    experience: profile.experience ? `${profile.experience} Years` : "N/A",
  };

  useEffect(() => {
    fetchUserAttendanceStats(userId).then(setStats);
  }, [userId]);

  const loadRecords = async (month: string, year: string) => {
    setLoading(true);
    const data = await fetchUserAttendanceRecords(userId, month, year);
    setRecords(data as AttendanceRecord[]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 w-full">
        <FacultyInfoCard profile={formattedProfile} />

        {stats ? (
          <AttendanceStatusCard stats={stats} />
        ) : (
          <StatusCardSkeleton />
        )}
      </div>

      <div className="relative flex-1 min-h-[350px]">
        {loading && <TableSkeletonOverlay />}

        <AttendanceTable
          records={records}
          month={defaultMonth}
          year={defaultYear}
          onDateChange={loadRecords}
        />
      </div>
    </div>
  );
};

export default AttendancePage;
