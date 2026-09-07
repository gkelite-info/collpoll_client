import { useQuery } from "@tanstack/react-query";
import { getCollegeUsers, SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";

export function useCollegeUsers(collegeId: number | null) {
  return useQuery<SelectUser[]>({
    queryKey: ["collegeUsers", collegeId],
    queryFn: async () => {
      if (!collegeId) return [];
      
      const [admins, faculty, finance] = await Promise.all([
        getCollegeUsers("Admin", collegeId),
        getCollegeUsers("Faculty", collegeId),
        getCollegeUsers("Finance", collegeId)
      ]);
      
      // Filter out duplicates by userId if someone has multiple roles
      const allUsers = [...admins, ...faculty, ...finance];
      const uniqueUsers = Array.from(new Map(allUsers.map(item => [item.userId, item])).values());
      
      return uniqueUsers;
    },
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
