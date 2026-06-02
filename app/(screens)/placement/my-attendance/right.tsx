"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import LiveAnnouncementsCard from "@/app/utils/liveAnnouncementsCard";
import TaskPanel from "@/app/utils/taskPanel";
import type { Task } from "@/app/utils/taskPanel";
import WipOverlay from "@/app/utils/WipOverlay";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";

export default function MyAttendanceRight() {
  const myTasks: Task[] = [
    {
      facultyTaskId: 1,
      title: "Complete Python Lab",
      description: "Finish all 10 lab programs and upload to portal.",
      time: "12:40 PM",
      date: new Date().toLocaleString(),
    },
    {
      facultyTaskId: 2,
      title: "Group Discussion Prep",
      description:
        'Research topic "Impact of AI on Education" for tomorrow\'s discussion.',
      time: "02:40 PM",
      date: new Date().toLocaleString(),
    },
    {
      facultyTaskId: 3,
      title: "Resume Update",
      description: "Add latest internship experience to resume builder section.",
      time: "03:40 PM",
      date: new Date().toLocaleString(),
    },
  ];

  return (
    <div className="relative flex w-[32%] flex-col p-2">
      <WipOverlay fullHeight />
      <CourseScheduleCard />
      <WorkWeekCalendar />
      <TaskPanel studentTasks={myTasks} role="student" />
      <LiveAnnouncementsCard />
    </div>
  );
}
