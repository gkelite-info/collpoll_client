import AnalyticsFacultyInfo from "./AnalyticsFacultyInfo";
import {
  AnalyticsFacultyProfile,
  AttendanceRecord,
  ChartDataPoint,
} from "../types";
import AttendancePerformanceChart from "../charts/AttendancePerformanceChart";
import AttendanceTable from "../tables/attendanceTable";

// Mock Data
const mockProfile: AnalyticsFacultyProfile = {
  name: "Harsha Sharma",
  department: "CSE",
  employeeId: "989539",
  experience: "6 Years",
  leavesTaken: 2,
  workingDays: 18,
};

const mockChartData: ChartDataPoint[] = [
  { month: "Jan", performance: 71, attendance: 10 },
  { month: "Feb", performance: 96, attendance: 15 },
  { month: "Mar", performance: 31, attendance: 18 },
  { month: "Apr", performance: 40, attendance: 14 },
  { month: "May", performance: 35, attendance: 23 },
  { month: "Jun", performance: 42, attendance: 14 },
  { month: "July", performance: 47, attendance: 32 },
];

const mockRecords: AttendanceRecord[] = Array.from({ length: 9 }).map(
  (_, i) => ({
    date: `${(12 - i).toString().padStart(2, "0")}/02/2026`,
    checkIn: "09:04 AM",
    checkOut: "05:12 PM",
    totalHours: "8h 08m",
    status: "Present",
    lateBy: "04m",
    earlyOut: "—",
    classDetail: "04",
  }),
);

const AttendanceAnalyticsPage = () => {
  return (
    <div className="flex flex-col w-full">
      <AnalyticsFacultyInfo profile={mockProfile} />

      <AttendancePerformanceChart data={mockChartData} />

      <AttendanceTable
        title="Daily Attendance Record"
        records={mockRecords}
        month="JAN"
        year="2026"
      />
    </div>
  );
};

export default AttendanceAnalyticsPage;
