"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { financeAnnouncements } from "../../(dashboard)/components/data";

export default function LeaveRequestRightPanel() {
  return (
    <aside className="hidden min-h-0 w-[32%] flex-col p-2 pr-0 md:flex">
      <div className="flex justify-end">
        <div className="w-[160px]">
          <CourseScheduleCard isVisibile={false} fullWidth={true}/>
        </div>
      </div>

      <WorkWeekCalendar style="mt-3 max-w-full" />

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <AnnouncementsCard
          announceCard={financeAnnouncements}
          height="80vh"
          currentView="others"
          readOnly
        />
      </div>
    </aside>
  );
}
