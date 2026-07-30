import { useInfiniteQuery } from "@tanstack/react-query";
import { getStudentPerformanceList } from "@/lib/helpers/faculty/dashboard/getStudentPerformanceList";

export type UseFacultyStudentPerformanceParams = {
  facultyId?: number;
  collegeId?: number;
  collegeEducationId?: number;
  collegeBranchId?: number;
  academicYearIds: number[];
  sectionIds: number[];
  subjectIds: number[];
};

export const useFacultyStudentPerformance = (
  params: UseFacultyStudentPerformanceParams,
  enabled: boolean = true
) => {
  return useInfiniteQuery({
    queryKey: [
      "facultyStudentPerformance",
      params.facultyId,
      params.collegeId,
      params.collegeEducationId,
      params.collegeBranchId,
      params.academicYearIds.join(","),
      params.sectionIds.join(","),
      params.subjectIds.join(","),
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (
        !params.facultyId ||
        !params.collegeId ||
        !params.collegeEducationId ||
        !params.collegeBranchId ||
        !params.subjectIds.length
      ) {
        return { students: [], hasNextPage: false, totalCount: 0 };
      }

      return await getStudentPerformanceList({
        facultyId: params.facultyId,
        collegeId: params.collegeId,
        collegeEducationId: params.collegeEducationId,
        collegeBranchId: params.collegeBranchId,
        academicYearIds: params.academicYearIds,
        sectionIds: params.sectionIds,
        subjectIds: params.subjectIds,
        page: pageParam,
        pageSize: 10,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasNextPage) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled:
      enabled &&
      !!params.facultyId &&
      !!params.collegeId &&
      !!params.collegeEducationId &&
      !!params.collegeBranchId &&
      params.subjectIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes (computationally expensive)
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
