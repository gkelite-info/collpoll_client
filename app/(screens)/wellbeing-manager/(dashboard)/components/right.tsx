"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import LiveAnnouncementsCard from "@/app/utils/liveAnnouncementsCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";

export default function WellbeingManagerRight() {
  return (
    <aside className="hidden w-[32%] flex-col p-2 pr-0 md:flex lg:w-[32%]">
      <div className="flex justify-end">
        <CourseScheduleCard isVisibile={false} fullWidth />
      </div>
      <WorkWeekCalendar />
      <LiveAnnouncementsCard />
    </aside>
  );
}
