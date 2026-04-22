"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";

type AnnouncementItem = {
  collegeAnnouncementId?: number;
  image: string;
  imgHeight: string;
  title: string;
  professor: string;
  date?: string;
  createdAt?: string;
  cardBg: string;
  imageBg: string;
  type?: string;
  targetRoles?: string[];
};

type CollegeAnnouncementResponseItem = {
  collegeAnnouncementId: number;
  title: string;
  date?: string;
  createdAt?: string;
  type: string;
  targetRoles?: string[];
  createdByRole: string;
};

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

export default function SemwiseDetailsRight() {
  const { collegeId, userId, role } = useUser();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [view, setView] = useState<"my" | "others">("my");

  const fetchData = useCallback(async () => {
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

      const formatted = (res.data as CollegeAnnouncementResponseItem[]).map(
        (item) => ({
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
          professor:
            view === "my"
              ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
              : `By ${formatRole(item.createdByRole)}`,
        }),
      );

      setAnnouncements(formatted);
    } catch (err) {
      console.error("Placement dashboard announcements fetch failed", err);
      setAnnouncements([]);
    }
  }, [collegeId, role, userId, view]);

  useEffect(() => {
    if (!collegeId || !userId || !role) return;

    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [collegeId, userId, role, fetchData]);

  return (
    <div className="w-[32%] p-2 flex flex-col">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />
      <AnnouncementsCard
        announceCard={announcements} 
        height="80vh"
        onViewChange={(v) => setView(v)} 
        refreshAnnouncements={fetchData} 
      />
    </div>
  );
}
