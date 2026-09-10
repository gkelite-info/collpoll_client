import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllUsersForSearch, SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";

export function useInfiniteCollegeUsers(collegeId: number | null, searchQuery: string = "", includeUserId?: number | null, currentUserRole?: string | null) {
  return useInfiniteQuery<SelectUser[]>({
    queryKey: ["infiniteCollegeUsers", collegeId, searchQuery, includeUserId, currentUserRole],
    queryFn: async ({ pageParam = 0 }) => {
      if (!collegeId) return [];
      
      const limit = 10;
      const offset = (pageParam as number) * limit;
      
      return await getAllUsersForSearch(collegeId, searchQuery, limit, offset, includeUserId, currentUserRole);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned less than 10 items, there are no more pages
      if (lastPage.length < 10) {
        return undefined;
      }
      return allPages.length; // Returns the next page index
    },
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
