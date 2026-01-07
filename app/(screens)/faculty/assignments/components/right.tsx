"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useState } from "react";
import type { Task } from "@/app/utils/taskPanel";


export default function AssignmentsRight() {
  // 
  // const myTasks = [
  //   {
  //     facultytaskId: 1,                   
  //     title: "Complete Python Lab",
  //     description: "Finish all 10 lab programs and upload to portal.",
  //     time: "12:40 PM",
  //     facultytaskcreatedDate: null,       
  //   },
  //   {
  //     facultytaskId: 2,
  //     title: "Group Discussion Prep",
  //     description: "Research topic “Impact of AI on Education” for tomorrow’s discussion.",
  //     time: "02:40 PM",
  //     facultytaskcreatedDate: null,
  //   },
  //   {
  //     facultytaskId: 3,
  //     title: "Resume Update",
  //     description: "Add latest internship experience to resume builder section.",
  //     time: "03:40 PM",
  //     facultytaskcreatedDate: null,
  //   },
  // ];

  // ✅ Faculty tasks state
  const [facultyTasks, setFacultyTasks] = useState<Task[]>([
    {
      facultytaskId: 1,
      title: "Complete Python Lab",
      description: "Finish all 10 lab programs and upload to portal.",
      time: "12:40 PM",
      facultytaskcreatedDate: null,
    },
    {
      facultytaskId: 2,
      title: "Prepare Unit Test Question Bank",
      description: "Prepare questions covering all important topics.",
      time: "10:21 AM",
      facultytaskcreatedDate: null,
    },
  ]);

  // ✅ Save / Update handler
  const handleSaveFacultyTask = (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number
  ) => {
    if (taskId) {
      // ✏️ UPDATE
      setFacultyTasks((prev) =>
        prev.map((t) =>
          t.facultytaskId === taskId
            ? {
              ...t,
              title: payload.title,
              description: payload.description,
              time: payload.dueTime,
            }
            : t
        )
      );
    } else {
      // ➕ ADD
      setFacultyTasks((prev) => [
        {
          facultytaskId: Date.now(), // temp id
          title: payload.title,
          description: payload.description,
          time: payload.dueTime,
          facultytaskcreatedDate: payload.dueDate,
        },
        ...prev,
      ]);
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
          role="faculty"
          facultyTasks={facultyTasks}
          onAddTask={() => { }}
          onSaveTask={handleSaveFacultyTask}
        />
        <AnnouncementsCard announceCard={card} />
      </div>
    </>
  );
}
