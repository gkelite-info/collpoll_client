"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { saveFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import type { Task } from "@/app/utils/taskPanel";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import TaskModal from "@/app/components/modals/taskModal";

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function MyAttendanceRight() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<"my" | "others">("others");

  const {
    facultyId,
    collegeId,
    userId,
    role,
    sections,
    selectedSectionIndex,
    loading: facultyLoading,
  } = useFaculty();

  const uniqueSubjectsCount = new Set(sections?.map(s => s.collegeSubjectId)).size;
  const isSingleSubject = uniqueSubjectsCount === 1;

  const activeSection = sections?.[selectedSectionIndex];
  const collegeSubjectId = activeSection?.collegeSubjectId ?? null;
  const collegeSectionId = isSingleSubject ? null : (activeSection?.collegeSectionsId ?? null);

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
      queryClient.invalidateQueries({ queryKey: ["facultyTasksInfinite", facultyId, collegeSubjectId] });
      queryClient.invalidateQueries({ queryKey: ["facultyTasks", facultyId, collegeSubjectId, collegeSectionId] });
    },
    onError: (error: any) => {
      console.error("HANDLE SAVE ERROR:", error?.message || error);
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

  return (
    <div className="w-[32%] p-2 flex flex-col max-md:hidden h-full">
      <CourseScheduleCard />
      <WorkWeekCalendar />

      <TaskPanel
        role="faculty"
        enableInfiniteScroll={true}
        loading={isTasksLoading}
        collegeSubjectId={collegeSubjectId ?? undefined}
        facultyId={facultyId ?? undefined}
        onAddTask={() => setOpenModal(true)}
        onSaveTask={handleSave}
        onDeleteTask={async () => {
          queryClient.invalidateQueries({ queryKey: ["facultyTasksInfinite", facultyId, collegeSubjectId] });
          queryClient.invalidateQueries({ queryKey: ["facultyTasks", facultyId, collegeSubjectId, collegeSectionId] });
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
