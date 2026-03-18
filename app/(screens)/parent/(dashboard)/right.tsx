"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
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

export default function ParentRight() {

  const { collegeId, userId, role } = useUser();
  const allowedCreatorRoles = [
    "Admin",
    "Faculty",
    "Finance",
  ];

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view] = useState<"my" | "others">("others");

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

      const filtered = res.data.filter((item: any) =>
        allowedCreatorRoles.includes(item.createdByRole)
      );

      const formatted = filtered.map((item: any) => ({
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

        professor: `By ${item.createdByRole}`,
      }));
      setAnnouncements(formatted);

    } catch (err) {
      console.error("Parent announcements error:", err);
    }
  };

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
  }, [collegeId, userId, role]);

  return (
    <div className="w-[32%] px-1 flex flex-col">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />

      <AnnouncementsCard
        announceCard={announcements}
        height="80vh"
        refreshAnnouncements={fetchAnnouncements}
      />
    </div>
  );
}