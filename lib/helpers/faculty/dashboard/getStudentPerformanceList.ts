import { getFacultyStudentProgressSummary } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";

export type GetStudentPerformanceListParams = {
  facultyId: number;
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  academicYearIds: number[];
  sectionIds: number[];
  subjectIds: number[];
  page?: number;
  pageSize?: number;
};

export async function getStudentPerformanceList(params: GetStudentPerformanceListParams) {
  const { page = 1, pageSize = 10, ...restParams } = params;

  // We fetch ALL students so we can sort them across the entire dataset
  const summary = await getFacultyStudentProgressSummary({
    ...restParams,
    page: 1,
    pageSize: 10000, // Large number to get all
  });

  const allStudents = [...summary.studentRows].sort((a, b) => {
    // Sort descending by progress percent (which is the combined weighted total)
    if (b.progressPercent !== a.progressPercent) {
      return b.progressPercent - a.progressPercent;
    }
    // Tie breaker: attendance
    if (b.attendancePercentage !== a.attendancePercentage) {
      return b.attendancePercentage - a.attendancePercentage;
    }
    // Final tie breaker: roll no
    return a.rollNo.localeCompare(b.rollNo);
  });

  // Apply server-side pagination for this specific request
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = allStudents.slice(startIndex, endIndex);

  const hasNextPage = endIndex < allStudents.length;

  return {
    students: paginatedStudents,
    hasNextPage,
    totalCount: allStudents.length,
  };
}
