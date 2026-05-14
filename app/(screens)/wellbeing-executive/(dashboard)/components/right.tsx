"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { wellbeingAnnouncements } from "../data";

function AlertIcon() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF1F1F] text-[15px] font-bold text-white">
      !
    </span>
  );
}

export default function WellbeingExecutiveRight() {
  return (
    <aside className="hidden w-[32%] flex-col p-2 pr-0 md:flex lg:w-[32%]">
      <div className="grid grid-cols-2 gap-3">
        <button className="flex h-[54px] items-center justify-center gap-2 rounded-lg bg-[#FFE8E8] text-sm font-bold text-[#FF1F1F] shadow-sm">
          <AlertIcon />
          ALERTS
        </button>
        <CourseScheduleCard isVisibile={false} fullWidth />
      </div>

      <WorkWeekCalendar />
      <AnnouncementsCard
        announceCard={wellbeingAnnouncements}
        height="80vh"
        readOnly
      />
    </aside>
  );
}
