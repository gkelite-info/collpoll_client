import { useQuery } from "@tanstack/react-query";
import { meetingQueryKeys } from "./meetingQueryKeys";
import { fetchMeetingsByMonth } from "@/lib/helpers/collegeMeetings/fetchMeetingsByMonth";

export function useUserMeetingsMonthly(
  collegeId: number | null,
  userId: number | null,
  year: number,
  month: number
) {
  return useQuery({
    queryKey: meetingQueryKeys.userMonthly(userId || 0, year, month),
    queryFn: async () => {
      if (!collegeId || !userId) return [];
      
      const startDate = new Date(year, month, -7).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 7).toISOString().split("T")[0];
      
      return fetchMeetingsByMonth(collegeId, startDate, endDate, { participantUserId: userId });
    },
    enabled: !!collegeId && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
