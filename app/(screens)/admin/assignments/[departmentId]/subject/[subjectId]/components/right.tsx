"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useEffect, useState } from "react";
import type { Task } from "@/app/utils/taskPanel";
import { fetchFacultyTasksByFacultyId, saveFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import TaskCardShimmer from "@/app/(screens)/faculty/shimmers/TaskCardShimmer";
import { CheckCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";

interface props {
  facultyId?: number;
  collegeSubjectId?: number;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

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

export default function AssignmentsRight({ facultyId, collegeSubjectId, selectedDate, onDateSelect }: props) {
  const [facultyTasks, setFacultyTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const { collegeId, userId, role } = useUser();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view, setView] = useState<"my" | "others">("others");

  useEffect(() => {
    if (!facultyId) return;
    fetchTasks();
  }, [facultyId]);

  const fetchTasks = async () => {
    if (!facultyId) return

    try {
      setLoadingTasks(true);
      const data = await fetchFacultyTasksByFacultyId(facultyId);

      const formatted: Task[] = data.map((t) => ({
        facultyTaskId: t.facultyTaskId,
        title: t.taskTitle,
        description: t.description,
        time: t.time || "",
        date: t.date || "",
      }));

      setFacultyTasks(formatted);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchData = async () => {
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
      console.error(err);
    }
  };

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchData();
  }, [collegeId, userId, role, view]);

  const handleSaveFacultyTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      collegeAcademicYearId?: number | null;
      collegeSectionsId?: number | null;
    },
    taskId?: number
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
          collegeAcademicYearId: payload.collegeAcademicYearId,
          collegeSectionsId: payload.collegeSectionsId,
        },
        facultyId!
      );

      if (!res.success) throw new Error("Save failed");

      await fetchTasks();
    } catch (err) {
      console.error("HANDLE SAVE ERROR:", err);
      toast.error("Failed to save task");
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    await fetchTasks();
  };


  return (
    <>
      <div className="h-full w-[32%] overflow-y-auto p-2 flex flex-col">
        <CourseScheduleCard isVisibile={false} />
        <WorkWeekCalendar 
          activeDate={selectedDate}
          onDateSelect={onDateSelect}
        />
        {loadingTasks ? (
          <div className="bg-white mt-5 rounded-md shadow-md p-4 min-h-[345px]">
            <div className="flex justify-between items-center mb-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 rounded-full p-1 w-8 h-8" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>

            <TaskCardShimmer />
            <TaskCardShimmer />
            <TaskCardShimmer />
          </div>
        ) : (
          <TaskPanel
            role="faculty"
            heading="Faculty Tasks"
            facultyTasks={facultyTasks}
            facultyId={facultyId}
            collegeSubjectId={collegeSubjectId}
            onAddTask={() => {}}
            onSaveTask={handleSaveFacultyTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        <AnnouncementsCard
          announceCard={announcements}
          height="80vh"
          currentView={view}
          onViewChange={(v) => setView(v)}
          refreshAnnouncements={fetchData}
        />
      </div>
    </>
  );
}
