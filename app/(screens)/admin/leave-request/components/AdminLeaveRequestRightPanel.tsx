"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type AnnouncementItem = {
  collegeAnnouncementId: number;
  title: string;
  date: string;
  createdAt: string;
  type: string;
  targetRoles?: string[] | null;
  createdByRole: string;
};

type AnnouncementCardItem = {
  collegeAnnouncementId: number;
  title: string;
  date: string;
  createdAt: string;
  type: string;
  targetRoles?: string[] | null;
  image: string;
  imgHeight: string;
  cardBg: string;
  imageBg: string;
  professor: string;
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

export default function AdminLeaveRequestRightPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role, collegeId, userId } = useUser();
  const [announcements, setAnnouncements] = useState<AnnouncementCardItem[]>([]);
  const [view, setView] = useState<"my" | "others">("my");

  const openRequestModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "request-leave");
    router.push(`${pathname}?${params.toString()}`);
  };

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

      const formatted = (res.data as AnnouncementItem[]).map((item) => ({
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
      }));

      setAnnouncements(formatted);
    } catch (error) {
      console.error("Fetch announcements error:", error);
    }
  };

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeId, userId, role, view]);

  return (
    <aside className="hidden min-h-0 w-[32%] flex-col p-2 pr-0 md:flex">
      <div className="grid self-end gap-2 grid-cols-2">
        <button
          onClick={openRequestModal}
          className="h-[54px] whitespace-nowrap cursor-pointer rounded-sm bg-[#16284F] px-3 text-sm font-semibold text-white shadow-md hover:bg-[#20365F]"
        >
          Request Leave
        </button>
        <div className="w-[160px]">
          <CourseScheduleCard isVisibile={false} fullWidth={true} />
        </div>
      </div>

      <WorkWeekCalendar style="mt-3 max-w-full" />

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <AnnouncementsCard
          announceCard={announcements}
          height="80vh"
          onViewChange={(nextView) => setView(nextView)}
          refreshAnnouncements={fetchAnnouncements}
        />
      </div>
    </aside>
  );
}
