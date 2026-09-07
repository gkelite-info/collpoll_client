import { useQuery } from "@tanstack/react-query";
import { fetchMeetingDetails } from "@/lib/helpers/collegeMeetings/fetchMeetingDetails";

export function useMeetingDetailsQuery(meetingId: string | null) {
  return useQuery({
    queryKey: ["meetingDetails", meetingId],
    queryFn: async () => {
      if (!meetingId) return { agenda: "", attendees: [] };
      return fetchMeetingDetails(meetingId);
    },
    enabled: !!meetingId && (meetingId.startsWith("ce_") || meetingId.startsWith("bce_")),
    staleTime: 5 * 60 * 1000,
  });
}
