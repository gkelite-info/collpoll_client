"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import LiveAnnouncementsCard from "@/app/utils/liveAnnouncementsCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";

export default function MyAttendanceRight() {
  return (
    <div className="relative flex w-[32%] flex-col p-2">
      <CourseScheduleCard isVisibile={false}/>
      <WorkWeekCalendar />
      <LiveAnnouncementsCard />
    </div>
  );
}
