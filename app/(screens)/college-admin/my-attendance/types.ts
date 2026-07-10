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
  todayStatus: string | null;
  totalWorkingDays: number;
  leavesTaken: number;
  remainingLeaves: number;
  lopDays?: number;
  presentDays?: number;
  expectedWorkingDays?: number;
}

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: string;
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
