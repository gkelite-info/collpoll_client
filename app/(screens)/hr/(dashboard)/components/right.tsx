// "use client";

// import { useEffect, useState } from "react";
// import AnnouncementsCard from "@/app/utils/announcementsCard";
// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import { useUser } from "@/app/utils/context/UserContext";
// import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";

// const typeIcons: Record<string, string> = {
//   class: "/class.png",
//   exam: "/exam.png",
//   meeting: "/meeting.png",
//   holiday: "/calendar-3d.png",
//   event: "/event.png",
//   notice: "/clip.png",
//   result: "/result.jpg",
//   timetable: "/timetable.png",
//   placement: "/placement.png",
//   emergency: "/emergency.png",
//   finance: "/finance.jpg",
//   other: "/others.png",
// };

// const formatRole = (role: string) =>
//   role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

// export default function HrDashRight() {
//   const { userId, collegeId, role } = useUser();
//   const [announcements, setAnnouncements] = useState<any[]>([]);
//   const [view, setView] = useState<"my" | "others">("my");

//   const fetchAnnouncements = async () => {
//     try {
//       if (!collegeId || !userId || !role) return;

//       const res = await fetchCollegeAnnouncements({
//         collegeId,
//         userId,
//         role,
//         view,
//         page: 1,
//         limit: 20,
//       });

//       const formatted = res.data.map((item: any) => ({
//         collegeAnnouncementId: item.collegeAnnouncementId,
//         title: item.title,
//         date: item.date,
//         createdAt: item.createdAt,
//         type: item.type,
//         targetRoles: item.targetRoles,

//         image: typeIcons[item.type] || "/clip.png",
//         imgHeight: "h-10",
//         cardBg: "#E8F8EF",
//         imageBg: "#D3F1E0",

//         professor:
//           view === "my"
//             ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
//             : `By ${formatRole(item.createdByRole)}`,
//       }));

//       setAnnouncements(formatted);

//     } catch (err) {
//       console.error("HR announcements error:", err);
//     }
//   };

//   useEffect(() => {
//     if (!collegeId || !userId || !role) return;
//     fetchAnnouncements();
//   }, [collegeId, userId, role, view]);

//   return (
//     <div className="w-[32%] p-2 flex flex-col">
//       <CourseScheduleCard isVisibile={false} />
//       <WorkWeekCalendar />
//       <AnnouncementsCard
//         announceCard={announcements}
//         height="80vh"
//         onViewChange={(v) => setView(v)}
//         refreshAnnouncements={fetchAnnouncements}
//       />
//     </div>
//   );
// }

"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import type { Task } from "@/app/utils/taskPanel";
import { useUser } from "@/app/utils/context/UserContext";
import { useEffect, useState } from "react";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const { collegeId, userId, role } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL State
  const currentView = searchParams.get("view");

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view, setView] = useState<"my" | "others">("my");

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
        "Research topic “Impact of AI on Education” for tomorrow’s discussion.",
      time: "02:40 PM",
      date: new Date().toLocaleString(),
    },
    {
      facultyTaskId: 3,
      title: "Resume Update",
      description:
        "Add latest internship experience to resume builder section.",
      time: "03:40 PM",
      date: new Date().toLocaleString(),
    },
  ];

  const fetchData = async () => {
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

      const formatted = res.data.map((item: any) => ({
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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchData();
  }, [collegeId, userId, role, view]);

  const toggleOnboardingView = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentView === "onboarding") {
      params.delete("view"); // Go back to dashboard
    } else {
      params.set("view", "onboarding"); // Switch to onboarding view
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-[32%] p-2 flex flex-col gap-3">
      <div className="flex w-full gap-2">
        <button
          onClick={toggleOnboardingView}
          className="bg-[#43C17A] hover:bg-[#3caf6e] text-white px-5 py-2 rounded font-semibold text-[13px] transition-colors shadow-sm cursor-pointer"
        >
          {currentView === "onboarding"
            ? "Back to Dashboard"
            : "Staff Onboarding"}
        </button>
        <div className="flex-1">
          <CourseScheduleCard isVisibile={false} fullWidth={true} />
        </div>
      </div>
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
