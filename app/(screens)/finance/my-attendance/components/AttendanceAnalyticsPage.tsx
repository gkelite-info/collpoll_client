import AnalyticsFacultyInfo from "./AnalyticsFacultyInfo";
import {
  AnalyticsFacultyProfile,
  AttendanceRecord,
  ChartDataPoint,
} from "../types";
import AttendancePerformanceChart from "../charts/AttendancePerformanceChart";
import AttendanceTable from "../tables/attendanceTable";

import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { getAttendanceData } from "@/lib/helpers/myAttendance/getAttendanceData";
import { getAttendanceYearlyStats } from "@/lib/helpers/myAttendance/getAttendanceYearlyStats";
import AttendanceTableShimmer from "../shimmers/AttendanceTableShimmer";
import AttendancePerformanceChartShimmer from "../shimmers/AttendancePerformanceChartShimmer";
import AnalyticsFacultyInfoShimmer from "../shimmers/AnalyticsFacultyInfoShimmer";
import { getAttendanceMonthlyStats } from "@/lib/helpers/myAttendance/getAttendanceMonthlyStats";

const mockProfile: AnalyticsFacultyProfile = {
  name: "",
  department: "",
  employeeId: "",
  experience: "6 years",
  leavesTaken: 0,
  workingDays: 0,
};


const AttendanceAnalyticsPage = () => {

  const { userId, collegeBranchCode, fullName, financeManagerId, collegeEducationType, professionalExperienceYears } = useUser();
  const [profile, setProfile] = useState<AnalyticsFacultyProfile | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableLoading, setTableLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true);
  const [workingDays, setWorkingDays] = useState(0);
  const [workingDaysLoading, setWorkingDaysLoading] = useState(true);
  const itemsPerPage = 15;

  useEffect(() => {
    if (!userId) return;

    const fetchWorkingDays = async () => {
      setWorkingDaysLoading(true);
      try {
        const res = await getAttendanceMonthlyStats({
          userId,
          month: selectedMonth,
          year: selectedYear
        });

        setWorkingDays(res.totalWorkingDays);
      } catch (err) {
        setWorkingDays(0);
      } finally {
        setWorkingDaysLoading(false);
      }
    };

    fetchWorkingDays();
  }, [userId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!financeManagerId || !fullName) return;
    setInfoLoading(true);
    try {
      const updatedProfile: AnalyticsFacultyProfile = {
        ...mockProfile,
        name: fullName,
        department: collegeBranchCode || "",
        employeeId: financeManagerId,
        collegeEducationType: collegeEducationType || "",
        experience: professionalExperienceYears ? `${professionalExperienceYears} ${Number(professionalExperienceYears) > 1 ? 'years' : 'year'} ` : "—",
        workingDays
      };
      setProfile(updatedProfile);
    } finally {
      setInfoLoading(false)
    }
  }, [financeManagerId, collegeBranchCode, fullName, collegeEducationType, workingDays]);

  useEffect(() => {
    if (!userId) return;
    setTableLoading(true)
    getAttendanceData({
      userId,
      month: selectedMonth,
      year: selectedYear,
      page: currentPage,
      limit: itemsPerPage
    })
      .then(res => {
        setRecords(res.records);
        setTotalItems(res.total);
      }).catch(() => {
        setRecords([]);
        setTotalItems(0)
      }).finally(() => setTableLoading(false));

  }, [userId, selectedMonth, selectedYear, currentPage]);

  useEffect(() => {
    if (!userId) return;
    setChartLoading(true);
    getAttendanceYearlyStats(
      userId,
      selectedYear
    )
      .then(setChartData)
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));
  }, [userId, selectedYear]);

  return (
    <div className="flex flex-col w-full pb-5 overflow-auto">
      <div className="p-1 w-full">
        {infoLoading || workingDaysLoading || !profile ? (
          <AnalyticsFacultyInfoShimmer />
        ) : (
          <AnalyticsFacultyInfo profile={profile} />
        )}
      </div>
      {chartLoading ?
        <AttendancePerformanceChartShimmer />
        :
        <AttendancePerformanceChart data={chartData} />
      }
      {tableLoading
        ? <AttendanceTableShimmer />
        :
        <AttendanceTable
          title="Daily Attendance Record"
          records={records}
          month={[
            "JAN", "FEB", "MAR", "APR",
            "MAY", "JUN", "JUL", "AUG",
            "SEP", "OCT", "NOV", "DEC"
          ][selectedMonth - 1]}
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

export default AttendanceAnalyticsPage;
