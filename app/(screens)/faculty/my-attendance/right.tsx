"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import type { Task } from "@/app/utils/taskPanel";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useEffect, useState } from "react";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { fetchFacultyTasks, saveFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import toast from "react-hot-toast";

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

const myTasks: Task[] = [
  {
    facultyTaskId: 1,
    title: "Complete Python Lab",
    description: "Finish all 10 lab programs and upload to portal.",
    time: "12:40 PM",
    date: new Date().toLocaleString()
  },
  {
    facultyTaskId: 2,
    title: "Group Discussion Prep",
    description:
      "Research topic “Impact of AI on Education” for tomorrow’s discussion.",
    time: "02:40 PM",
    date: new Date().toLocaleString()
  },
  {
    facultyTaskId: 3,
    title: "Resume Update",
    description:
      "Add latest internship experience to resume builder section.",
    time: "03:40 PM",
    date: new Date().toLocaleString()
  },
];

export default function MyAttendanceRight() {
  const { facultyId, subjectIds, collegeId, userId, role, loading: facultyLoading } = useFaculty();
  const collegeSubjectId = subjectIds?.[0] ?? null;
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view, setView] = useState<"my" | "others">("my");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    if (!collegeSubjectId) return;
    try {
      const data = await fetchFacultyTasks(collegeSubjectId);
      const formattedTasks: Task[] = data.map((t: any) => ({
        facultyTaskId: t.facultyTaskId,
        title: t.taskTitle,
        description: t.description,
        time: t.time,
        date: t.date,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error("LOAD TASK ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
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
        },
        facultyId!
      );

      if (!res.success) {
        throw new Error("Save failed");
      }
      await loadTasks();
    } catch (error) {
      toast.error("Failed to save task");
      throw error;
    }
  };

  useEffect(() => {
    if (!facultyLoading && collegeSubjectId) {
      loadTasks();
    }
  }, [facultyLoading, collegeSubjectId]);

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
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
  }, [collegeId, userId, role, view]);


  return (
    <>
      <div className="w-[32%] p-2 flex flex-col">
        <CourseScheduleCard />
        <WorkWeekCalendar />

        <TaskPanel
          role="faculty"
          facultyTasks={loading ? [] : tasks}
          loading={loading}
          collegeSubjectId={collegeSubjectId ?? undefined}
          facultyId={facultyId ?? undefined}
          onAddTask={()=>{}}
          onSaveTask={handleSave}
          onDeleteTask={async () => {
            await loadTasks();
          }}
        />

        <AnnouncementsCard
          announceCard={announcements}
          height="80vh"
          onViewChange={(v) => setView(v)}
          refreshAnnouncements={fetchAnnouncements}
        />
      </div>
    </>
  );
}
