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

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function MyAttendanceRight({ activeMainTab }: { activeMainTab?: string }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"my" | "others">("others");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
      <WorkWeekCalendar 
        activeDate={selectedDate || undefined}
        onDateSelect={(date) => setSelectedDate(date)} 
      />
      <TaskPanel
        role="faculty"
        enableInfiniteScroll={true}
        loading={isTasksLoading}
        collegeSubjectId={collegeSubjectId ?? undefined}
        facultyId={facultyId ?? undefined}
        selectedDate={selectedDate ? selectedDate.toLocaleDateString("en-CA") : null}
        onDateChange={(date) => setSelectedDate(date ? new Date(date) : null)}
        onAddTask={() => {}}
        onSaveTask={handleSave}
        onDeleteTask={async () => {
          queryClient.invalidateQueries({ queryKey: ["facultyTasksInfinite", facultyId, collegeSubjectId] });
          queryClient.invalidateQueries({ queryKey: ["facultyTasks", facultyId, collegeSubjectId, collegeSectionId] });
        }}
      />

      <div className="flex-1 min-h-0 mt-4">
        <AnnouncementsCard
          className="h-full"
          enableInfiniteScroll={true}
          currentView={view}
          selectedDate={selectedDate ? selectedDate.toLocaleDateString("en-CA") : null}
          onDateChange={(date) => setSelectedDate(date ? new Date(date) : null)}
          isLoading={isAnnouncementsLoadingFinal}
          onViewChange={(v) => setView(v as "my" | "others")}
          refreshAnnouncements={async () => { await queryClient.invalidateQueries({ queryKey: ["announcementsInfinite"] }); }}
        />
      </div>
    </div>
  );
}
