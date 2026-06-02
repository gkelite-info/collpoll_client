"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import AnnouncementsCard from "./announcementsCard";

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

type LiveAnnouncementsCardProps = {
  height?: string;
  readOnly?: boolean;
};

export default function LiveAnnouncementsCard({
  height = "80vh",
  readOnly,
}: LiveAnnouncementsCardProps) {
  const { collegeId, userId, role } = useUser();
  const [announcements, setAnnouncements] = useState<
    {
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
    }[]
  >([]);
  const [view, setView] = useState<"my" | "others">("others");

  const fetchAnnouncements = useCallback(async () => {
    if (!collegeId || !userId || !role) return;

    try {
      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });

      setAnnouncements(
        res.data.map((item) => ({
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
              ? `For ${item.targetRoles.map(formatRole).join(", ")}`
              : `By ${formatRole(item.createdByRole)}`,
        })),
      );
    } catch (error) {
      console.error("Announcements fetch failed", error);
      setAnnouncements([]);
    }
  }, [collegeId, role, userId, view]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAnnouncements();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchAnnouncements]);

  return (
    <AnnouncementsCard
      announceCard={announcements}
      height={height}
      currentView={view}
      onViewChange={setView}
      refreshAnnouncements={fetchAnnouncements}
      readOnly={readOnly}
    />
  );
}
