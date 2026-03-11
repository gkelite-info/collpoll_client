import AttendanceTable from "../tables/attendanceTable";
import { AttendanceRecord, AttendanceStats, FacultyProfile } from "../types";
import AttendanceStatusCard from "./attendanceStatusCard";
import FacultyInfoCard from "./facultyInfoCard";

const mockProfile: FacultyProfile = {
  name: "Harsha Sharma",
  image: "/harshasharma.png",
  id: "9046928764",
  department: "CSE",
  mobile: "9876432134",
  email: "harshasharma@gmail.com",
  joiningDate: "12 July 2019",
  experience: "6 years",
};

const mockStats: AttendanceStats = {
  todayStatus: "Present",
  totalWorkingDays: 18,
  leavesTaken: 2,
  remainingLeaves: 10,
};

const mockRecords: AttendanceRecord[] = Array.from({ length: 9 }).map(
  (_, i) => ({
    date: `${(12 - i).toString().padStart(2, "0")}/02/2026`,
    checkIn: "09:04 AM",
    checkOut: "05:12 PM",
    totalHours: "8h 08m",
    status: "Present",
    lateBy: "04m",
    earlyOut: "—",
    classDetail: "",
  }),
);

const AttendancePage = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 w-full">
        <FacultyInfoCard profile={mockProfile} />
        <AttendanceStatusCard stats={mockStats} />
      </div>

      <AttendanceTable records={mockRecords} month="JAN" year="2026" />
    </div>
  );
};

export default AttendancePage;
