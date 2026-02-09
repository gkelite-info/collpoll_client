"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import PlacementFilters from "./compounents/PlacementFilters";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import Announcements from "./compounents/Announcement";
import PlacementList from "./compounents/PlacementList";


export default function PlacementsPage() {
    return (
        <section className="h-screen flex gap-3 overflow-hidden">
            <div className="flex-1 flex flex-col px-2">


                <div className="shrink-0">
                    <h1 className="text-[28px] font-medium text-[#282828] mb-1">
                        Placements
                    </h1>

                    <p className="text-[18px] font-normal text-[#282828]">
                        Monitor, Guide, and Support Student Placements Seamlessly.
                    </p>

                    <PlacementFilters />
                </div>


                <div className="flex-1 overflow-y-auto pr-2 pb-4 mt-4">
                    <PlacementList />
                </div>
            </div>


            <div className="w-[300px] shrink-0 flex flex-col gap-4 sticky top-0 h-screen">
                <CourseScheduleCard isVisibile={false} />
                <WorkWeekCalendar />
                <div className="w-full h-[320px] overflow-y-auto pb-4">
                    <Announcements />
                </div>
            </div>

        </section>
    );
}
