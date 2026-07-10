import { fetchFullAttendanceDashboardData } from "@/lib/helpers/Hr/attendance/AttendanceAnalyticsAPI";

export async function getAttendanceYearlyStats(userId: number, year: number) {
  try {
    // The optimized API calculates the chart data natively for the entire year
    const { chartData } = await fetchFullAttendanceDashboardData(userId, "JAN", year.toString());
    
    // chartData is exactly in the format: { month: "Jan", attendance: number, performance: number }[]
    return chartData;
  } catch (error) {
    console.error("Error in getAttendanceYearlyStats:", error);
    return [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ].map(m => ({ month: m, attendance: 0, performance: 0 }));
  }
}