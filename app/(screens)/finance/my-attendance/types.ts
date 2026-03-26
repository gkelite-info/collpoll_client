export interface FacultyProfile {
  name: string;
  image: string;
  facultyId: number | null;
  branch: string;
  mobile: string;
  email: string;
  joiningDate: string;
  experience: string;
  collegeEducationType? : string | null;
}

export interface AttendanceStats {
  todayStatus: "PRESENT" | "ABSENT" | "LEAVE" | "LATE" | null;
  totalWorkingDays: number;
  leavesTaken: number;
  remainingLeaves: number;
}

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: "PRESENT" | "ABSENT" | "LEAVE" | "LATE";
  lateBy: string;
  earlyOut: string;
  classDetail: string;
  reason?: string;
}

export interface AnalyticsFacultyProfile {
  name: string;
  department: string;
  employeeId: string | number;
  experience: string;
  leavesTaken: number;
  workingDays: number;
  collegeEducationType? : string;
}

export interface ChartDataPoint {
  month: string;
  performance: number;
  attendance: number;
}
