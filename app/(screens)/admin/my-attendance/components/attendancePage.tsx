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

export interface AdminProfile {
  name: string;
  image: string;
  adminId: number | null;
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

const AttendancePage = () => {

  const { adminId, email, profilePhoto, mobile, fullName, dateOfJoining,
    professionalExperienceYears, collegeEducationType, userId } = useUser()
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  const itemsPerPage = 15

  useEffect(() => {
    if (!userId) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res =
          await getAttendanceMonthlyStats({
            userId,
            month: selectedMonth,
            year: selectedYear
          });
        setStats({
          todayStatus: res.todayStatus,
          totalWorkingDays: res.totalWorkingDays,
          leavesTaken: 0,
          remainingLeaves: 0
        });

      }
      catch (err) {
        setStats({
          todayStatus: null,
          totalWorkingDays: 0,
          leavesTaken: 0,
          remainingLeaves: 0
        });
      }
      finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [userId, selectedMonth, selectedYear]);

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
      }
    };

    fetchAttendance();
  }, [userId, selectedMonth, selectedYear, currentPage]);

  useEffect(() => {
    if (!adminId) return;
    setInfoLoading(true);
    try {
      const updatedProfile: AdminProfile = {
        ...mockProfile,
        name: fullName!,
        mobile: mobile!,
        adminId: adminId,
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
  }, [adminId, collegeEducationType, email, profilePhoto, fullName, dateOfJoining, mobile, professionalExperienceYears]);


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

      {tableLoading
        ? <AttendanceTableShimmer />
        :
        <AttendanceTable
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
        />
      }
    </div>
  );
};

export default AttendancePage;
