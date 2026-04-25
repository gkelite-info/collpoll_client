import { buildStudentAttendanceSummary } from "./buildStudentAttendanceSummary";

export interface SubjectWiseAttendance {
  subjectId: number;
  subjectName: string;
  percentage: number;
}

export interface StudentDashboardResponse {
  todayStats: {
    attended: number;
    total: number;
  };
  cards: {
    attended: number;
    totalClasses: number;
    percentage: number;
  };
  semesterStats: {
    present: number;
    absent: number;
    leave: number;
  };
  tableData: Array<{
    calendarEventId: number;
    subjectId: number | null;
    subject: string;
    faculty: string;
    status: string;
    classAttendance: string;
    percentage: string;
    date: string;
    fromTime: string;
    toTime: string;
  }>;
  totalCount: number;
  subjectWiseAttendance: SubjectWiseAttendance[];
  weeklyData: number[];
  dayWiseAttendance: {
    date: string;
    day: string;
    total: number;
    attended: number;
    percentage: number;
  }[];
}

export async function getStudentDashboardData(
  userId: number,
  dateStr: string,
  page: number,
  limit: number,
  isInter: boolean,
): Promise<StudentDashboardResponse> {
  const from = (page - 1) * limit;
  const to = from + limit;
  const summary = await buildStudentAttendanceSummary(userId, dateStr, isInter);

  return {
    todayStats: summary.todayStats,
    cards: summary.cards,
    semesterStats: summary.semesterStats,
    tableData: summary.tableData.slice(from, to),
    totalCount: summary.totalCount,
    subjectWiseAttendance: summary.subjectWiseAttendance.map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      percentage: subject.percentage,
    })),
    weeklyData: summary.weeklyData,
    dayWiseAttendance: summary.dayWiseAttendance,
  };
}
