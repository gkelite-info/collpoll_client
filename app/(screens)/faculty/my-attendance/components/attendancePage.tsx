import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import AttendanceTable from "../tables/attendanceTable";
import { AttendanceRecord, AttendanceStats, FacultyProfile } from "../types";
import AttendanceStatusCard from "./attendanceStatusCard";
import FacultyInfoCard from "./facultyInfoCard";
import { useEffect, useState } from "react";

const mockProfile: FacultyProfile = {
  name: "Harsha Sharma",
  image: "/harshasharma.png",
  facultyId: null,
  branch: "CSE",
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

  const { facultyId, college_branch, email, } = useFaculty();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!facultyId) return;

    setLoading(true);

    try {
      const updatedProfile: FacultyProfile = {
        ...mockProfile,
        facultyId: facultyId,
        branch: college_branch ?? mockProfile.branch,
        email: email ?? mockProfile.email,
      };

      setProfile(updatedProfile);
    } finally {
      setLoading(false);
    }
  }, [facultyId, college_branch, email]);

  if (!profile && loading) {
    return <div>Loading...</div>;
  }



  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 w-full">
        {profile && (
          <FacultyInfoCard
            profile={profile}
            loading={loading}
          />
        )}
        <AttendanceStatusCard stats={mockStats} />
      </div>

      <AttendanceTable records={mockRecords} month="JAN" year="2026" />
    </div>
  );
};

export default AttendancePage;
