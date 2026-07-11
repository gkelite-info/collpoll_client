"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import LiveAnnouncementsCard from "@/app/utils/liveAnnouncementsCard";

export default function MyAttendanceRight() {
  return (
    <aside className="flex w-[32%] flex-col p-2">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />
      <LiveAnnouncementsCard readOnly height="80vh" />
    </aside>
  );
}
