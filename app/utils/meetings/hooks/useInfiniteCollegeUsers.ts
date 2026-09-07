import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllUsersForSearch, SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";

export function useInfiniteCollegeUsers(collegeId: number | null, searchQuery: string = "") {
  return useInfiniteQuery<SelectUser[]>({
    queryKey: ["infiniteCollegeUsers", collegeId, searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      if (!collegeId) return [];
      
      const limit = 20;
      const offset = (pageParam as number) * limit;
      
      return await getAllUsersForSearch(collegeId, searchQuery, limit, offset);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned less than 20 items, there are no more pages
      if (lastPage.length < 20) {
        return undefined;
      }
      return allPages.length; // Returns the next page index
    },
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
