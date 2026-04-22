"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import Announcements from "./Announcements";

export default function PlacementRightPanel() {
  return (
    <aside className="sticky top-0 h-screen w-85 shrink-0">
      <div className="flex h-full flex-col gap-3">
        <div className="w-80 justify-end">
          <CourseScheduleCard isVisibile={false}/>
        </div>

        <WorkWeekCalendar style="mt-0" />

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="h-full overflow-y-auto">
            <Announcements />
          </div>
        </div>
      </div>
    </aside>
  );
}
