"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { financeAnnouncements } from "./data";

export default function FinanceManagerDashRight() {
  return (
    <aside className="bg-yellow-00 md:[35%] lg:w-[32%] p-2 lg:p-2 lg:pr-0 hidden min-h-0 landscape:hidden md:flex landscape:md:flex md:flex-col lg:flex lg:flex-col">
      <div className="grid grid-cols-2 gap-4 w-full items-center">
        <div />
        <CourseScheduleCard isVisibile={false} fullWidth={true} />
      </div>

      <WorkWeekCalendar style="mt-3 max-w-full" />
        <AnnouncementsCard
          announceCard={financeAnnouncements}
          height="80vh"
          currentView="others"
        />
    </aside>
  );
}
