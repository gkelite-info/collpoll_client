"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import { useStudent } from "@/app/utils/context/student/useStudent";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { fetchFacultyTasks } from "@/lib/helpers/faculty/facultyTasks";
import { fetchStudentTasks, saveStudentTask } from "@/lib/helpers/student/studentTaskAPI";
import { useEffect, useState } from "react";


export default function StuDashRight() {

  const [studentTasks, setStudentTasks] = useState<any[]>([]);
  const [facultyTasks, setFacultyTasks] = useState<any[]>([]);
  const { subjects, studentId } = useStudent();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    loadStudentTasks();
  }, [studentId]);

  const loadStudentTasks = async () => {
    if (!studentId) return;

    setLoading(true);

    const data = await fetchStudentTasks(studentId);

    const formatted = data.map((task) => ({
      facultyTaskId: task.studentTaskId,
      title: task.taskTitle,
      description: task.description,
      time: task.time,
      date: task.date,
    }));

    setStudentTasks(formatted);
    setLoading(false);
  };

  useEffect(() => {
    if (!subjects?.length) return;

    const loadFacultyTasks = async () => {
      setLoading(true);
      try {
        const allTasks: any[] = [];

        for (const subject of subjects) {

          const tasks = await fetchFacultyTasks(subject.collegeSubjectId);

          if (tasks?.length) {
            allTasks.push(
              ...tasks.map((task: any) => ({
                facultyTaskId: task.facultyTaskId,
                title: task.taskTitle,
                description: task.description,
                time: task.time,
                date: task.date,
              }))
            );
          }
        }

        setFacultyTasks(allTasks);

      } catch (err) {
        console.error("Load faculty tasks failed", err);
      }
      finally {
        setLoading(false);
      }

    };

    loadFacultyTasks();

  }, [subjects]);

  const handleSaveStudentTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number
  ): Promise<void> => {
    if (!studentId) return;
    try {

      const response = await saveStudentTask({
        studentTaskId: taskId,
        taskTitle: payload.title,
        description: payload.description,
        date: payload.dueDate,
        time: payload.dueTime
      },
        studentId
      );

      if (!response.success) {
        console.error("Save student task failed");
        return;
      }

      await loadStudentTasks();

    } catch (err) {
      console.error("Save student task failed", err);
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
        <CourseScheduleCard />
        <WorkWeekCalendar />
        <TaskPanel
          role="student"
          loading={loading}
          studentId={studentId ?? undefined}
          studentTasks={studentTasks}
          facultyTasks={facultyTasks}
          onAddTask={() => { }}
          onSaveTask={handleSaveStudentTask}
          onDeleteTask={async () => {
            await loadStudentTasks();
          }}
        />
        <AnnouncementsCard announceCard={card} />
      </div>
    </>
  );
}
