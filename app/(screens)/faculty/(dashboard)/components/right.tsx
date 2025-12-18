"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/weekCalendar";

export default function FacultyDashRight() {
  const myTasks = [
    {
      title: "Complete Python Lab",
      description: "Finish all 10 lab programs and upload to portal.",
      time: "12:40 PM",
    },
    {
      title: "Group Discussion Prep",
      description:
        "Research topic “Impact of AI on Education” for tomorrow’s discussion.",
      time: "02:40 PM",
    },
    {
      title: "Resume Update",
      description:
        "Add latest internship experience to resume builder section.",
      time: "03:40 PM",
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
        <TaskPanel tasks={myTasks} />
        <AnnouncementsCard announceCard={card} />
      </div>
    </>
  );
}
