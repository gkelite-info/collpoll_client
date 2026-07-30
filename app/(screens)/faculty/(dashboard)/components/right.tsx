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
import TaskModal from "@/app/components/modals/taskModal";
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
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<"my" | "others">("others");

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



  const { data: announcements = [], isLoading: isAnnouncementsLoading, refetch: refetchAnnouncements } = useQuery({
    queryKey: ["collegeAnnouncements", collegeId, userId, role, view],
    queryFn: async () => {
      if (!collegeId || !userId || !role) return [];

      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });

      return res.data.map((item: any) => ({
        collegeAnnouncementId: item.collegeAnnouncementId,
        title: item.title,
        date: item.date,
        createdAt: item.createdAt,
        type: item.type,
        targetRoles: item.targetRoles,
        image: typeIcons[item.type] || "/clip.png",
        imgHeight: "h-10",
        cardBg: "#E8F8EF",
        imageBg: "#D3F1E0",
        professor:
          view === "my"
            ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
            : `By ${formatRole(item.createdByRole)}`,
      }));
    },
    enabled: !!collegeId && !!userId && !!role && !facultyLoading,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

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
        throw new Error("Save failed");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facultyTasks", facultyId, collegeSubjectId, collegeSectionId] });
    },
    onError: (error) => {
      console.error("HANDLE SAVE ERROR:", error);
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
  const isAnnouncementsLoadingFinal = facultyLoading || (!collegeId || !userId || !role) || isAnnouncementsLoading;

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
          refreshAnnouncements={async () => { await refetchAnnouncements(); }}
        />
      </div>
    </div>
  );
}
