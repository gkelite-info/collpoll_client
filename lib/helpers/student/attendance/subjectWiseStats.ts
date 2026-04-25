import { buildStudentAttendanceSummary } from "./buildStudentAttendanceSummary";

export async function getStudentDashboardData(
  userId: number,
  dateStr: string,
  page: number,
  limit: number,
) {
  const from = (page - 1) * limit;
  const to = from + limit;
  const summary = await buildStudentAttendanceSummary(userId, dateStr);

  return {
    todayStats: summary.todayStats,
    cards: summary.cards,
    semesterStats: summary.semesterStats,
    subjectWiseStats: summary.subjectWiseAttendance.slice(from, to),
    totalCount: summary.subjectWiseAttendance.length,
    weeklyData: summary.weeklyData,
  };
}
