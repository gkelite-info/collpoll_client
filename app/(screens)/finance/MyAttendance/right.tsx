"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import type { Task } from "@/app/utils/taskPanel";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
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


export default function MyAttendanceRight() {

  const [openModal, setOpenModal] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const { collegeId, userId, role } = useUser();
  const [editAnnouncement, setEditAnnouncement] = useState<any | null>(null);
  const [view, setView] = useState<"my" | "others">("my");

  const loadAnnouncements = async () => {
    if (!collegeId || !userId || !role) return;

    try {
      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 10,
      });

      const formatted = res.data.map((item: any) => ({
        collegeAnnouncementId: item.collegeAnnouncementId,
        type: item.type,
        targetRoles: item.targetRoles,


        image: typeIcons[item.type] || "/clip.png",
        imgHeight: "h-10",
        title: item.title,

        professor:
          view === "my"
            ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
            : `By ${formatRole(item.createdByRole)}`,

        date: item.date,
        createdAt: item.createdAt,

        cardBg: "#E8F8EF",
        imageBg: "#D3F1E0",
      }));

      setAnnouncements(formatted);
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [collegeId, userId, role, view]);

  useEffect(() => {
    loadAnnouncements();
  }, [collegeId, userId, view, role]);

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



  return (
    <>
      <div className="w-[32%] p-2 flex flex-col">
        <CourseScheduleCard />
        <WorkWeekCalendar />
        <TaskPanel studentTasks={myTasks} role="student" />
        <AnnouncementsCard
          announceCard={announcements}
          height="80vh"
          onAddClick={() => {
            setEditAnnouncement(null);
            setOpenModal(true);
          }}
          onViewChange={setView}
          onEditAnnouncement={(item) => {
            setEditAnnouncement(item);
            setOpenModal(true);
          }}
          refreshAnnouncements={loadAnnouncements}
        />
      </div>
    </>
  );
}
