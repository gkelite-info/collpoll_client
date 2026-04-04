"use client";

import { useEffect, useState } from "react";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  fetchFacultyTasksForLoggedInFaculty,
  saveFacultyTask,
} from "@/lib/helpers/faculty/facultyTasks";
import type { Task } from "@/app/utils/taskPanel";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import toast from "react-hot-toast";
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    facultyId,
    subjectIds,
    collegeId,
    userId,
    role,
    loading: facultyLoading,
  } = useFaculty();

  const collegeSubjectId = subjectIds?.[0] ?? null;

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view, setView] = useState<"my" | "others">("my");

  const loadTasks = async () => {
    if (!collegeSubjectId || !facultyId) return;

    try {
      const data = await fetchFacultyTasksForLoggedInFaculty(
        facultyId,
        collegeSubjectId,
      );

      setTasks(
        data.map((t: any) => ({
          facultyTaskId: t.facultyTaskId,
          title: t.taskTitle,
          description: t.description,
          time: t.time,
          date: t.date,
        })),
      );
    } catch (err) {
      console.error("LOAD TASK ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      if (!collegeId || !userId || !role) return;

      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });

      const formatted = res.data.map((item: any) => ({
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

      setAnnouncements(formatted);
    } catch (err) {
      console.error("Fetch announcements error:", err);
    }
  };

  useEffect(() => {
    if (!facultyLoading && collegeSubjectId && facultyId) {
      loadTasks();
    }
  }, [facultyLoading, collegeSubjectId, facultyId]);

  const handleSave = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number,
  ) => {
    try {
      const res = await saveFacultyTask(
        {
          facultyTaskId: taskId,
          collegeSubjectId: collegeSubjectId!,
          taskTitle: payload.title,
          description: payload.description,
          date: payload.dueDate,
          time: payload.dueTime,
        },
        facultyId!,
      );

      if (!res.success) {
        throw new Error(res.error?.message || "Save failed");
      }

      await loadTasks();
    } catch (error: any) {
      console.error("HANDLE SAVE ERROR:", error);
      throw error;
    }
  };
  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
  }, [collegeId, userId, role, view]);

  return (
    <div className="w-[32%] p-2 flex flex-col">
      <CourseScheduleCard />
      <WorkWeekCalendar />

      <TaskPanel
        role="faculty"
        facultyTasks={loading ? [] : tasks}
        loading={loading}
        collegeSubjectId={collegeSubjectId ?? undefined}
        facultyId={facultyId ?? undefined}
        onAddTask={() => {}}
        onSaveTask={handleSave}
        onDeleteTask={async () => {
          await loadTasks();
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

      <AnnouncementsCard
        announceCard={announcements}
        height="80vh"
        onViewChange={(v) => setView(v)}
        refreshAnnouncements={fetchAnnouncements}
      />
    </div>
  );
}
