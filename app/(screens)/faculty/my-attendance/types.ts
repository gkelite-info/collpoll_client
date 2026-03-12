export interface FacultyProfile {
  name: string;
  image: string;
  facultyId: number | null;
  branch: string;
  mobile: string;
  email: string;
  joiningDate: string;
  experience: string;
}

export interface AttendanceStats {
  todayStatus: "Present" | "Absent" | "Half Day";
  totalWorkingDays: number;
  leavesTaken: number;
  remainingLeaves: number;
}

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: "Present" | "Absent" | "Leave";
  lateBy: string;
  earlyOut: string;
  classDetail: string;
}

export interface AnalyticsFacultyProfile {
  name: string;
  department: string;
  employeeId: string;
  experience: string;
  leavesTaken: number;
  workingDays: number;
}

export interface ChartDataPoint {
  month: string;
  performance: number;
  attendance: number;
}
