"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { fetchFacultyTasks } from "@/lib/helpers/faculty/facultyTasks";
import { addStudentTask, getStudentTasks, updateStudentTask, } from "@/lib/helpers/profile/Task/studentTasks";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";



export default function StuDashRight() {

  const [studentTasks, setStudentTasks] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [facultyTasks, setFacultyTasks] = useState<any[]>([]);
  const [collegeId, setCollegeId] = useState<number | null>(null);


  useEffect(() => {
    async function fetchStudentId() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Auth error", error);
        return;
      }

      const { data, error: userErr } = await supabase
        .from("users")
        .select("userId, collegeId")
        .eq("auth_id", user.id)
        .single();

      if (userErr) {
        console.error("Failed to get studentId", userErr);
        return;
      }
      setStudentId(data.userId);
      setCollegeId(data.collegeId);

    }

    fetchStudentId();
  }, []);


  useEffect(() => {
    if (studentId === null) return;


    async function fetchStudentTasks() {
      try {
        const data = await getStudentTasks(studentId as number);

        const formatted = data.map((task: any) => ({
          facultytaskId: task.studenttaskId, // reuse key
          title: task.studenttaskTitle,
          description: task.studenttaskDescription,
          time: task.studenttaskassignedTime,
          facultytaskcreatedDate: task.studenttaskcreateDate,
        }));

        setStudentTasks(formatted);
      } catch (err: any) {
        console.error("Add student task failed");
        console.error(err?.message ?? err);
      }

    }

    fetchStudentTasks();
  }, [studentId]);


  useEffect(() => {
    if (!collegeId) return;

    const loadFacultyTasks = async () => {
      try {
        // 1️⃣ Fetch faculty users in same college
        const { data: facultyUsers, error } = await supabase
          .from("users")
          // .select("userId")
          .select("userId, collegeId")
          .eq("collegeId", collegeId)
          .ilike("role", "faculty")
          .eq("is_deleted", false);

        if (error || !facultyUsers?.length) {
          console.error("No faculty found");
          return;
        }

        // 2️⃣ Fetch tasks for each faculty
        const allTasks: any[] = [];

        for (const faculty of facultyUsers) {
          const res = await fetchFacultyTasks(faculty.userId);

          if (res.success && res.tasks?.length) {
            allTasks.push(
              ...res.tasks.map((task: any) => ({
                facultytaskId: task.facultytaskId,
                title: task.facultytaskTitle,
                description: task.facultytaskDescription,
                time: task.facultytaskassignedTime,
                facultytaskcreatedDate: task.facultytaskcreatedDate,
              }))
            );
          }
        }

        setFacultyTasks(allTasks);
      } catch (err) {
        console.error("Load faculty tasks failed", err);
      }
    };

    loadFacultyTasks();
  }, [collegeId]);



  const handleSaveStudentTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number
  ) => {
    if (!studentId) return;

    try {
      if (taskId) {
        // ✏️ UPDATE
        const updated = await updateStudentTask(taskId, {
          studenttaskTitle: payload.title,
          studenttaskDescription: payload.description,
          studenttaskcreateDate: payload.dueDate,
          studenttaskassignedTime: payload.dueTime,
        });

        setStudentTasks((prev) =>
          prev.map((t) =>
            t.facultytaskId === taskId
              ? {
                ...t,
                title: updated.studenttaskTitle,
                description: updated.studenttaskDescription,
                time: updated.studenttaskassignedTime,
                facultytaskcreatedDate: updated.studenttaskcreateDate,
              }
              : t
          )
        );
      } else {
        // ➕ INSERT
        const inserted = await addStudentTask({
          studentId,
          studenttaskTitle: payload.title,
          studenttaskDescription: payload.description,
          studenttaskcreateDate: payload.dueDate,
          studenttaskassignedTime: payload.dueTime,
        });

        setStudentTasks((prev) => [
          {
            facultytaskId: inserted.studenttaskId,
            title: inserted.studenttaskTitle,
            description: inserted.studenttaskDescription,
            time: inserted.studenttaskassignedTime,
            facultytaskcreatedDate: inserted.studenttaskcreateDate,
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Save student task failed", err);
    }
  };



  const myTasks = [
    {
      facultytaskId: 1,              // ✅ REQUIRED
      title: "Complete Python Lab",
      description: "Finish all 10 lab programs and upload to portal.",
      time: "12:40 PM",
      facultytaskcreatedDate: null,  // ✅ REQUIRED
    },
    {
      facultytaskId: 2,
      title: "Group Discussion Prep",
      description: "Research topic “Impact of AI on Education”.",
      time: "02:40 PM",
      facultytaskcreatedDate: null,
    },
    {
      facultytaskId: 3,
      title: "Resume Update",
      description: "Add latest internship experience.",
      time: "03:40 PM",
      facultytaskcreatedDate: null,
    },
  ];

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
          studentTasks={studentTasks}
          facultyTasks={facultyTasks}
          onAddTask={() => { }}
          onSaveTask={handleSaveStudentTask}
        />
        <AnnouncementsCard announceCard={card} />
      </div>
    </>
  );
}
