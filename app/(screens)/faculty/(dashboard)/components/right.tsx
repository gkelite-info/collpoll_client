"use client";

import { useEffect, useState } from "react";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { fetchFacultyTasks, saveFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import type { Task } from "@/app/utils/taskPanel";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import toast from "react-hot-toast";

export default function FacultyDashRight() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { facultyId, subjectIds, loading: facultyLoading } = useFaculty();
  const collegeSubjectId = subjectIds?.[0] ?? null;


  const loadTasks = async () => {
    if (!collegeSubjectId) return;

    try {

      const data = await fetchFacultyTasks(collegeSubjectId);

      setTasks(
        data.map((t: any) => ({
          facultyTaskId: t.facultyTaskId,
          title: t.taskTitle,
          description: t.description,
          time: t.time,
          date: t.date,
        }))
      );
      console.log("sorry data", data);

    } catch (err) {
      console.error("LOAD TASK ERROR", err);
    } finally {
      setLoading(false);
    }

  };


  useEffect(() => {

    if (!facultyLoading && collegeSubjectId) {
      loadTasks();
    }

  }, [facultyLoading, collegeSubjectId]);

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
      console.error("HANDLE SAVE ERROR:", error);
      toast.error("Failed to save task");
      throw error;
    }
  };

  const card = [
    {
      image: "/clip.png",
      imgHeight: "h-10",
      title: "Submit internal marks for all subjects before 25 Oct 2025.",
      professor: "By Justin Orom",
      time: "Just now",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
    {
      image: "/class.png",
      imgHeight: "h-10",
      title: "Upload your mini project abstracts by 12 Nov 2025.",
      professor: "By John",
      time: "12 mins ago.",
      cardBg: "#EEEDFF",
      imageBg: "#E3E1FF",
    },
  ];

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
        onAddTask={() => { }}
        onSaveTask={handleSave}
        onDeleteTask={async () => {
          await loadTasks();
        }}
      />

      <AnnouncementsCard announceCard={card} />
    </div>
  );
}