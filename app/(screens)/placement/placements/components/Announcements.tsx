"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { useCallback, useEffect, useState } from "react";

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
  role?.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function Announcements() {
  const { collegeId, userId, role } = useUser();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [view, setView] = useState<"my" | "others">("my");

  const fetchData = useCallback(async () => {
    try {
      if (!collegeId || !userId || !role) return;

      const response = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });

      const formatted = (response.data as CollegeAnnouncementResponseItem[]).map(
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
    } catch (error) {
      console.error("Placement announcements fetch failed", error);
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
    <AnnouncementsCard
      announceCard={announcements}
      height="74vh"
      onViewChange={(selectedView) => setView(selectedView)}
      refreshAnnouncements={fetchData}
    />
  );
}
