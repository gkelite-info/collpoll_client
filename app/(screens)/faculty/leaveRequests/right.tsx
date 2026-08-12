"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  saveFacultyTask,
} from "@/lib/helpers/faculty/facultyTasks";
import type { Task } from "@/app/utils/taskPanel";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import TaskModal from "@/app/components/modals/taskModal";
import { RightPageShimmer } from "@/app/components/shimmers/LeaveRequestsShimmer";

export default function FacultyDashRight() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<"my" | "others">("others");

  const {
    facultyId,
    subjectIds,
    collegeId,
    userId,
    role,
    loading: facultyLoading,
  } = useFaculty();

  const collegeSubjectId = subjectIds?.[0] ?? null;

  const { isLoading: isTasksLoadingRQ } = useQuery({
    queryKey: ["facultyTasks", facultyId, collegeSubjectId],
    queryFn: async () => [],
    enabled: false,
  });
  
  const isFetchingTasks = useQueryClient().isFetching({ queryKey: ["facultyTasks", facultyId, collegeSubjectId] }) > 0;

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (!facultyLoading && !isFetchingTasks && facultyId) {
      setIsFirstLoad(false);
    }
  }, [facultyLoading, isFetchingTasks, facultyId]);

  const saveTaskMutation = useMutation({
    mutationFn: async (payload: {
      data: any,
      taskId?: number
    }) => {
      const res = await saveFacultyTask({
        facultyTaskId: payload.taskId,
        collegeSubjectId: collegeSubjectId!,
        taskTitle: payload.data.title,
        description: payload.data.description,
        date: payload.data.dueDate,
        time: payload.data.dueTime,
        collegeAcademicYearId: payload.data.collegeAcademicYearId,
        collegeSectionsId: payload.data.collegeSectionsId,
      },
        facultyId!,
      );

      if (!res.success) {
        throw new Error(res.error?.message || "Save failed");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Task saved successfully!", { id: "save-task-success" });
      queryClient.invalidateQueries({ queryKey: ["facultyTasks", facultyId, collegeSubjectId] });
    },
    onError: () => {
      toast.error("Failed to save task. Please try again later.", { id: "save-task-error" });
    }
  });

  const handleSave = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      collegeAcademicYearId?: number | null;
      collegeSectionsId?: number | null;
    },
    taskId?: number,
  ) => {
    await saveTaskMutation.mutateAsync({ data: payload, taskId });
  };

  const isTasksLoading = facultyLoading || (!facultyId || !collegeSubjectId);
  const isAnnouncementsLoadingFinal = facultyLoading || (!collegeId || !userId || !role);

  if (facultyLoading || isFirstLoad) {
    return (
      <div className="relative h-full min-h-0 hidden md:flex md:w-[35%] lg:w-[32%] p-2 pb-4">
        {/* Render the actual UI invisibly so it can trigger the queries! */}
        <div className="absolute inset-0 opacity-0 pointer-events-none z-[-1] overflow-hidden">
          <TaskPanel
            role="faculty"
            enableInfiniteScroll={true}
            loading={isTasksLoading}
            collegeSubjectId={collegeSubjectId ?? undefined}
            facultyId={facultyId ?? undefined}
            onAddTask={() => { }}
            onSaveTask={handleSave}
            onDeleteTask={async () => {}}
          />
        </div>
        <RightPageShimmer className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="hidden h-full min-h-0 flex-col overflow-hidden p-2 pb-4 md:flex md:w-[35%] lg:w-[32%]">
      <CourseScheduleCard />
      <WorkWeekCalendar />

      <TaskPanel
        role="faculty"
        enableInfiniteScroll={true}
        loading={isTasksLoading}
        collegeSubjectId={collegeSubjectId ?? undefined}
        facultyId={facultyId ?? undefined}
        onAddTask={() => { }}
        onSaveTask={handleSave}
        onDeleteTask={async () => {
          queryClient.invalidateQueries({ queryKey: ["facultyTasks", facultyId, collegeSubjectId] });
        }}
      />

      {openModal && (
        <TaskModal
          open={openModal}
          role="faculty"
          collegeSubjectId={collegeSubjectId!}
          facultyId={facultyId!}
          onClose={() => {
            setOpenModal(false);
            setEditingTask(null);
          }}
          defaultValues={editingTask}
          onSave={async (payload, taskId) => {
            await handleSave(payload, taskId);
            setOpenModal(false);
            setEditingTask(null);
          }}
        />
      )}
      <div className="min-h-0 flex-1 mt-4">
        <AnnouncementsCard
          className="h-full"
          enableInfiniteScroll={true}
          currentView={view}
          isLoading={isAnnouncementsLoadingFinal}
          onViewChange={(v) => setView(v as "my" | "others")}
          refreshAnnouncements={async () => { await queryClient.invalidateQueries({ queryKey: ["announcementsInfinite"] }); }}
        />
      </div>
    </div>
  );
}
