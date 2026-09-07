import { useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingQueryKeys } from "./meetingQueryKeys";
import { saveMeetingWithParticipants } from "@/lib/helpers/collegeMeetings/saveMeetingWithParticipants";
import { deleteMeeting } from "@/lib/helpers/collegeMeetings/deleteMeeting";
import toast from "react-hot-toast";

export function useCreateMeeting(collegeId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { payload: Parameters<typeof saveMeetingWithParticipants>[0], userId: number }) => {
      const res = await saveMeetingWithParticipants(params.payload, params.userId);
      if (!res.success) throw new Error("Failed to create meeting");
      return res;
    },
    onSuccess: () => {
      if (collegeId) {
        queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all });
      }
      toast.success("Meeting created successfully");
    },
    onError: () => {
      toast.error("Failed to create meeting");
    }
  });
}

export function useUpdateMeeting(collegeId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { payload: Parameters<typeof saveMeetingWithParticipants>[0], userId: number }) => {
      const res = await saveMeetingWithParticipants(params.payload, params.userId);
      if (!res.success) throw new Error("Failed to update meeting");
      return res;
    },
    onSuccess: () => {
      if (collegeId) {
        queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all });
      }
      toast.success("Meeting updated successfully");
    },
    onError: () => {
      toast.error("Failed to update meeting");
    }
  });
}

export function useDeleteMeeting(collegeId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetingId: number) => {
      const res = await deleteMeeting(meetingId);
      if (!res.success) throw new Error("Failed to delete meeting");
      return res;
    },
    onSuccess: () => {
      if (collegeId) {
        queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all });
      }
      toast.success("Meeting deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete meeting");
    }
  });
}
