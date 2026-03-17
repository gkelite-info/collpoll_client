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
import TaskModal from "@/app/components/modals/taskModal";
import toast from "react-hot-toast";

interface props {
  facultyId?: number;
  collegeSubjectId?: number;
}

export default function AssignmentsRight({ facultyId, collegeSubjectId }: props) {
  const [facultyTasks, setFacultyTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [openTaskModal, setOpenTaskModal] = useState(false);

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

  const handleSaveFacultyTask = async (
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
    {
      image: "/book.png",
      imgHeight: "h-10",
      title: "DBMS Lab Report submissions are due by 10 Nov 2025.",
      professor: "By Simran",
      time: "1 min ago.",
      cardBg: "#FBF5EA",
      imageBg: "#F7EBD5",
    },
    {
      image: "/exam.png",
      imgHeight: "h-10",
      title: "Mid-semester exams are scheduled from 15–20 Nov 2025.",
      professor: "By Rajesh",
      time: "9 mins ago.",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
    {
      image: "/attendance.png",
      imgHeight: "h-10",
      title: "Attendance reports for October will be reviewed on 08 Nov 2025.",
      professor: "By Sundar",
      time: "6 mins ago.",
      cardBg: "#E6F0FF",
      imageBg: "#C9DEFF",
    },
  ];

  return (
    <>
      <div className="w-[32%] p-2 flex flex-col">
        <CourseScheduleCard isVisibile={false} />
        <WorkWeekCalendar />
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
        ) : facultyTasks.length === 0 ? (
          <div className="bg-white mt-5 rounded-md shadow-md p-4 min-h-[345px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#E7F7EE] rounded-full p-1">
                  <CheckCircle size={22} weight="fill" color="#43C17A" />
                </div>
                <p className="text-[#282828] font-medium">My Tasks</p>
              </div>
              <button
                onClick={() => setOpenTaskModal(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#43C17A] text-[#43C17A] text-xs font-medium hover:bg-[#43C17A] hover:text-white transition cursor-pointer"
              >
                + Add Task
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-400">No tasks available</p>
            </div>
          </div>
        ) : (
          <TaskPanel
            role="faculty"
            facultyTasks={facultyTasks}
            facultyId={facultyId}
            collegeSubjectId={collegeSubjectId}
            onAddTask={() => setOpenTaskModal(true)}
            onSaveTask={handleSaveFacultyTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        <AnnouncementsCard announceCard={card} />
      </div>

      <TaskModal
        open={openTaskModal}
        role="faculty"
        facultyId={facultyId}
        collegeSubjectId={collegeSubjectId}
        defaultValues={null}
        onClose={() => setOpenTaskModal(false)}
        onSave={handleSaveFacultyTask}
      />
    </>
  );
}
