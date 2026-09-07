import { useQuery } from "@tanstack/react-query";
import { meetingQueryKeys } from "./meetingQueryKeys";
import { fetchMeetingConflicts } from "@/lib/helpers/collegeMeetings/fetchMeetingConflicts";

export function useMeetingConflicts(
  collegeId: number | null,
  date: string | null,
  fromTime: string | null,
  toTime: string | null,
  participantUserIds: number[],
  excludeMeetingId?: number
) {
  const isReady = !!(collegeId && date && fromTime && toTime && participantUserIds.length > 0);

  return useQuery({
    queryKey: isReady ? [...meetingQueryKeys.conflicts(collegeId, date, fromTime, toTime), ...participantUserIds] : ["empty"],
    queryFn: async () => {
      if (!isReady) return [];
      return fetchMeetingConflicts({
        collegeId,
        date,
        fromTime,
        toTime,
        participantUserIds,
        excludeMeetingId,
      });
    },
    enabled: isReady,
    staleTime: 0,
  });
}
