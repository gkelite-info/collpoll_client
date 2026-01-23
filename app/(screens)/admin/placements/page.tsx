"use client";

import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import Announcements from "./components/Announcements";
import PlacementFilters from "./components/PlacementFilters";
import PlacementList from "./components/PlacementList";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";


export default function PlacementsPage() {
  return (
    <section className="min-h-[85vh] p-2 flex gap-3">
      <div className=" mx-auto">
        <h1 className="text-[28px] font-medium text-[#282828] mb-1">
          Placements
        </h1>

        <p className="text-[18px] font-normal text-[#282828]">
          Monitor, Guide, and Support Student Placements Seamlessly.
        </p>

        <PlacementFilters />

        <div className="mt-4 flex gap-6 items-start">

          <div className="">
            <PlacementList />
          </div>

        </div>
      </div>
      <div className="w-[300px] flex flex-col gap-4 shrink-0">
        <CourseScheduleCard isVisibile={false} />
        <div style={{ marginTop: "-25px" }}>
          <WorkWeekCalendar />
        </div>
        <Announcements />
      </div>
    </section>
  );
}
