import { fetchFullAttendanceDashboardData } from "@/lib/helpers/Hr/attendance/AttendanceAnalyticsAPI";

const MONTH_MAP = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

interface Props {
  userId: number;
  month: number;
  year: number;
}

export async function getAttendanceMonthlyStats({
  userId,
  month,
  year,
}: Props) {
  try {
    const monthName = MONTH_MAP[month - 1] || "JAN";
    
    // Use the centralized optimized dashboard data fetcher
    const { stats, todayStatus } = await fetchFullAttendanceDashboardData(userId, monthName, year.toString());
    
    return {
      todayStatus,
      totalWorkingDays: stats.totalWorkingDays,
      leavesTaken: stats.leavesTaken,
      remainingLeaves: stats.remainingLeaves,
      lopDays: stats.lopDays,
      presentDays: stats.presentDays,
      expectedWorkingDays: stats.expectedWorkingDays,
      collegeWorkingDays: stats.expectedWorkingDays,
      attendancePercentage: stats.expectedWorkingDays === 0 ? 0 : Math.round((stats.presentDays / stats.expectedWorkingDays) * 100)
    };
  } catch (error) {
    console.error("Error in getAttendanceMonthlyStats:", error);
    return {
      todayStatus: "Not Marked",
      totalWorkingDays: 0,
      leavesTaken: 0,
      remainingLeaves: 0,
      lopDays: 0,
      presentDays: 0,
      expectedWorkingDays: 0,
      collegeWorkingDays: 0,
      attendancePercentage: 0
    };
  }
}