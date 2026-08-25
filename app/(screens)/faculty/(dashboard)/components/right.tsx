"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {

  saveFacultyTask,
} from "@/lib/helpers/faculty/facultyTasks";
import type { Task } from "@/app/utils/taskPanel";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";

const typeIcons: Record<string, string> = {
  class: "/class.png",
  exam: "/exam.png",
  meeting: "/meeting.png",
  holiday: "/calendar-3d.png",
  event: "/event.png",
  notice: "/clip.png",
  result: "/result.jpg",
  timetable: "/timetable.png",
  placement: "/placement.png",
  emergency: "/emergency.png",
  finance: "/finance.jpg",
  other: "/others.png",
};

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function FacultyDashRight() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"my" | "others">("others");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    facultyId,
    subjectIds,
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
    <div className="hidden h-full min-h-0 flex-col overflow-y-auto custom-scrollbar p-2 pb-4 md:flex md:w-[35%] lg:w-[32%]">
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
          queryClient.invalidateQueries({ queryKey: ["facultyTasks", facultyId, collegeSubjectId, collegeSectionId] });
        }}
      />

      <div className="min-h-0 flex-1 mt-4">
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
