import { useQuery } from "@tanstack/react-query";
import { meetingQueryKeys } from "./meetingQueryKeys";
import { fetchMeetingsByMonth } from "@/lib/helpers/collegeMeetings/fetchMeetingsByMonth";
import { supabase } from "@/lib/supabaseClient";

export function useMeetingsMonthly(collegeId: number | null, year: number, month: number, userId?: number, role?: string) {
  return useQuery({
    queryKey: meetingQueryKeys.monthly(collegeId || 0, year, month),
    queryFn: async () => {
      if (!collegeId) return [];
      
      const startDate = new Date(year, month, -7).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 7).toISOString().split("T")[0];
      
      let participantUserIds: number[] = [];
      if (userId) participantUserIds.push(userId);
      
      // Strict filtering: User only sees meetings where they are explicitly an attendee or organizer
      // This applies to all roles, ensuring Parents don't see Student meetings and vice versa.
      
      return fetchMeetingsByMonth(collegeId, startDate, endDate, { participantUserIds });
    },
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserMeetingsMonthly(collegeId: number, participantUserId: number | null, year: number, month: number) {
  return useQuery({
    queryKey: [...meetingQueryKeys.monthly(collegeId, year, month), "user", participantUserId],
    queryFn: async () => {
      if (!collegeId || !participantUserId) return [];
      
      const startDate = new Date(year, month, -7).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 7).toISOString().split("T")[0];
      
      return fetchMeetingsByMonth(collegeId, startDate, endDate, { participantUserId });
    },
    enabled: !!collegeId && !!participantUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
