"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import LiveAnnouncementsCard from "@/app/utils/liveAnnouncementsCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";

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
        <LiveAnnouncementsCard />
      </div>
    </aside>
  );
}
