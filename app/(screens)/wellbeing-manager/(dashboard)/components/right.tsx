"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { managerAnnouncements } from "../data";

export default function WellbeingManagerRight() {
  return (
    <aside className="hidden w-[32%] flex-col p-2 pr-0 md:flex lg:w-[32%]">
      <div className="flex justify-end">
        <CourseScheduleCard isVisibile={false} fullWidth />
      </div>
      <WorkWeekCalendar />
      <AnnouncementsCard
        announceCard={managerAnnouncements}
        height="80vh"
        readOnly
      />
    </aside>
  );
}
