import AttendanceTable from "../tables/attendanceTable";
import { AttendanceRecord, AttendanceStats, FacultyProfile } from "../types";
import AttendanceStatusCard from "./attendanceStatusCard";
import FacultyInfoCard from "./facultyInfoCard";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import FacultyInfoCardShimmer from "../shimmers/FacultyInfoCardShimmer";
import AttendanceStatusCardShimmer from "../shimmers/AttendanceStatusCardShimmer";
import AttendanceTableShimmer from "../shimmers/AttendanceTableShimmer";
import { getAttendanceData } from "@/lib/helpers/myAttendance/getAttendanceData";
import { getAttendanceMonthlyStats } from "@/lib/helpers/myAttendance/getAttendanceMonthlyStats";
import { useHrAttendanceRealtime } from "@/lib/helpers/Hr/attendance/liveHrAttendanceAPI";

export interface AdminProfile {
  name: string;
  image: string;
  adminId: string | number | null;
  EducationType: string;
  mobile: string;
  email: string;
  joiningDate: string;
  experience: string;
  collegeEducationType? : string | null;
}

const mockProfile: AdminProfile = {
  name: "Harsha Sharma",
  image: "/harshasharma.png",
  adminId: null,
  EducationType: "B.Tech",
  mobile: "9876432134",
  email: "harshasharma@gmail.com",
  joiningDate: "12 July 2019",
  experience: "6 years",
};

const mockStats: AttendanceStats = {
  todayStatus: null,
  totalWorkingDays: 18,
  leavesTaken: 2,
  remainingLeaves: 10,
};

export const formatDate = (isoDate?: string | null) => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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

const AttendancePage = () => {

  const { adminId, identifierId, email, profilePhoto, mobile, fullName, dateOfJoining,
    professionalExperienceYears, collegeEducationType, userId } = useUser()
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rawStats, setRawStats] = useState<AttendanceStats | null>(null);
  const [allMonthRecords, setAllMonthRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  const itemsPerPage = 15;
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen to realtime changes for my attendance
  useHrAttendanceRealtime((payload) => {
    // Refresh if the attendance record is for this user
    if (payload.new && String(payload.new.userId) === String(userId)) {
      setRefreshKey((prev) => prev + 1);
    }
  });

  useEffect(() => {
    if (!userId) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const [statsRes, recordsRes] = await Promise.all([
          getAttendanceMonthlyStats({
            userId,
            month: selectedMonth,
            year: selectedYear
          }),
          getAttendanceData({
            userId,
            month: selectedMonth,
            year: selectedYear,
            page: 1,
            limit: 31
          })
        ]);
        setAllMonthRecords(recordsRes.records);
        setRawStats({
          todayStatus: statsRes.todayStatus,
          totalWorkingDays: statsRes.totalWorkingDays,
          leavesTaken: statsRes.leavesTaken,
          remainingLeaves: statsRes.remainingLeaves,
          lopDays: statsRes.lopDays,
          expectedWorkingDays: statsRes.expectedWorkingDays,
          presentDays: statsRes.presentDays
        });
      } catch (err) {
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [userId, selectedMonth, selectedYear, refreshKey]);

  useEffect(() => {
    if (!rawStats) {
      setStats(null);
      return;
    }

    if (!dateOfJoining) {
      setStats(rawStats);
      return;
    }

    const joiningDateObj = new Date(dateOfJoining);
    joiningDateObj.setHours(0, 0, 0, 0);

    const selectedMonthStart = new Date(selectedYear, selectedMonth - 1, 1);
    const selectedMonthEnd = new Date(selectedYear, selectedMonth, 0);

    // Case A: Selected month is entirely before joining date
    if (selectedMonthEnd < joiningDateObj) {
      setStats({
        todayStatus: "—",
        totalWorkingDays: 0,
        leavesTaken: 0,
        remainingLeaves: rawStats.remainingLeaves,
        lopDays: 0,
        expectedWorkingDays: 0,
        presentDays: 0
      });
      return;
    }

    // Case B: Selected month is the same month as joining date
    if (
      selectedYear === joiningDateObj.getFullYear() &&
      selectedMonth - 1 === joiningDateObj.getMonth()
    ) {
      let preJoiningAbsentCount = 0;
      allMonthRecords.forEach((row) => {
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
  }, [rawStats, allMonthRecords, dateOfJoining, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!userId) return;

    const fetchAttendance = async () => {
      setTableLoading(true);
      try {
        const res = await getAttendanceData({
          userId,
          month: selectedMonth,
          year: selectedYear,
          page: currentPage,
          limit: itemsPerPage,
        });

        setRecords(res.records);
        setTotalItems(res.total);
      } catch (err) {
        setRecords([]);
        setTotalItems(0);
      } finally {
        setTableLoading(false);
        setInitialLoad(false);
      }
    };

    fetchAttendance();
  }, [userId, selectedMonth, selectedYear, currentPage, refreshKey]);

  useEffect(() => {
    if (!adminId) return;
    setInfoLoading(true);
    try {
      const updatedProfile: AdminProfile = {
        ...mockProfile,
        name: fullName!,
        mobile: mobile!,
        adminId: identifierId || adminId,
        EducationType: collegeEducationType!,
        email: email ?? mockProfile.email,
        joiningDate: formatDate(dateOfJoining),
        image: profilePhoto ?? "",
        experience: professionalExperienceYears ? `${professionalExperienceYears} ${Number(professionalExperienceYears) > 1 ? 'years' : 'year'} ` : "—"
      };

      setProfile(updatedProfile);
    } finally {
      setInfoLoading(false);
    }
  }, [adminId, identifierId, collegeEducationType, email, profilePhoto, fullName, dateOfJoining, mobile, professionalExperienceYears]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 w-full">
        {infoLoading || !profile
          ? <FacultyInfoCardShimmer />
          :
          <FacultyInfoCard
            profile={{ ...profile }}
            loading={false}
          />
        }
        {(statsLoading || !stats) ? <AttendanceStatusCardShimmer /> : <AttendanceStatusCard stats={stats} />}
      </div>

      {initialLoad
        ? <AttendanceTableShimmer />
        :
        <AttendanceTable
          loading={tableLoading}
          records={records}
          month={
            [
              "JAN", "FEB", "MAR", "APR",
              "MAY", "JUN", "JUL", "AUG",
              "SEP", "OCT", "NOV", "DEC"
            ][selectedMonth - 1]
          }
          year={String(selectedYear)}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onMonthYearChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
            setCurrentPage(1);
          }}
          dateOfJoining={dateOfJoining}
        />
      }
    </div>
  );
};

export default AttendancePage;
