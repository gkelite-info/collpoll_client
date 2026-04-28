"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import Announcements from "./Announcements";

export default function PlacementRightPanel() {
  return (
    <aside className="h-full pb-4 bg-red-00 shrink-0">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-end justify-end">
          <div className="w-80 flex self-end flex-col">
          <CourseScheduleCard isVisibile={false}/>
          </div>
        </div>

        <WorkWeekCalendar style="mt-0" />

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="h-full">
            <Announcements />
          </div>
        </div>
      </div>
    </aside>
  );
}
