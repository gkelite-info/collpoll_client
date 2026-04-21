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

const fallbackAnnouncements: AnnouncementItem[] = [
  {
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Stephen Jones",
    image: "/clip.png",
    imgHeight: "h-10",
    cardBg: "#E8F8EF",
    imageBg: "#D3F1E0",
    createdAt: new Date().toISOString(),
    type: "notice",
  },
  {
    title: "Upload final project abstracts by 1 Dec 2025.",
    professor: "By Stephen Jones",
    image: "/placement.png",
    imgHeight: "h-10",
    cardBg: "#EEF2FF",
    imageBg: "#DDE5FF",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    type: "placement",
  },
  {
    title: "Mid-semester exams scheduled from 5 to 10 Dec 2025.",
    professor: "By Stephen Jones",
    image: "/calendar-3d.png",
    imgHeight: "h-10",
    cardBg: "#FFF6E9",
    imageBg: "#FFE7BA",
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    type: "event",
  },
];

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function Announcements() {
  const { collegeId, userId, role } = useUser();
  const [announcements, setAnnouncements] =
    useState<AnnouncementItem[]>(fallbackAnnouncements);
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

      if (formatted.length > 0) {
        setAnnouncements(formatted);
      }
    } catch (error) {
      console.error("Placement announcements fetch failed", error);
    }
  }, [collegeId, role, userId, view]);

  useEffect(() => {
    let isMounted = true;

    const loadAnnouncements = async () => {
      if (!collegeId || !userId || !role) return;

      try {
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

        if (isMounted && formatted.length > 0) {
          setAnnouncements(formatted);
        }
      } catch (error) {
        console.error("Placement announcements fetch failed", error);
      }
    };

    void loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, [collegeId, role, userId, view]);

  return (
    <AnnouncementsCard
      announceCard={announcements}
      height="74vh"
      onViewChange={(selectedView) => setView(selectedView)}
      refreshAnnouncements={fetchData}
    />
  );
}
