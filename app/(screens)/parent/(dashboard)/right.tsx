"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useCallback, useEffect, useState } from "react";
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

type AnnouncementCard = {
  collegeAnnouncementId: number;
  title: string;
  date: string;
  createdAt: string;
  type: string;
  targetRoles: string[];
  image: string;
  imgHeight: string;
  cardBg: string;
  imageBg: string;
  professor: string;
};

export default function ParentRight() {
  const { collegeId, userId, role } = useUser();
  const [announcements, setAnnouncements] = useState<AnnouncementCard[]>([]);
  const [view] = useState<"my" | "others">("others");

  const fetchAnnouncements = useCallback(async () => {
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

      const formatted = res.data.map((item) => ({
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
  }, [collegeId, role, userId, view]);

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    const timer = window.setTimeout(() => {
      void fetchAnnouncements();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [collegeId, fetchAnnouncements, role, userId]);

  return (
    <div className="w-[32%] px-1 flex min-h-full flex-col max-md:hidden">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />

      <AnnouncementsCard
        announceCard={announcements}
        height="full"
        refreshAnnouncements={fetchAnnouncements}
      />
    </div>
  );
}
