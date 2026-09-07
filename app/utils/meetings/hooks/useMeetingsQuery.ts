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
      
      let participantUserId = undefined;
      
      if (role === "Parent" && userId) {
        // Find child's userId
        const { data: student } = await supabase
          .from("students")
          .select("userId")
          .eq("parentId", userId)
          .single();
          
        if (student?.userId) {
          participantUserId = student.userId;
        }
      } else if (userId) {
        // For Students, Faculty, Management, Staff, etc. - pass their own userId 
        // to filter meetings or fetch their classes
        participantUserId = userId;
      }
      
      return fetchMeetingsByMonth(collegeId, startDate, endDate, { participantUserId });
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
