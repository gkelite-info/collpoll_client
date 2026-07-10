import { fetchFullAttendanceDashboardData } from "@/lib/helpers/Hr/attendance/AttendanceAnalyticsAPI";

const MONTH_MAP = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export interface AttendanceQueryParams {
    userId: number;
    month: number;
    year: number;
    page?: number;
    limit?: number;
}

export async function getAttendanceData({
    userId,
    month,
    year,
    page = 1,
    limit = 15,
}: AttendanceQueryParams) {
    try {
        const monthName = MONTH_MAP[month - 1] || "JAN";
        
        // Use the centralized optimized dashboard data fetcher
        const { records } = await fetchFullAttendanceDashboardData(userId, monthName, year.toString());
        
        const from = (page - 1) * limit;
        const to = from + limit;
        
        const paginatedData = records.slice(from, to);
        
        return {
            records: paginatedData,
            total: records.length,
            error: null
        };
    } catch (error) {
        console.error("Error in getAttendanceData:", error);
        return {
            records: [],
            total: 0,
            error
        };
    }
}