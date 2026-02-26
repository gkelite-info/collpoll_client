"use client";
 
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

import TaskPanel from "@/app/utils/taskPanel";
import PlacementFilters from "./components/PlacementFilters";
import PlacementList from "./components/PlacementList";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import Announcements from "./components/Announcements";
 
 
export default function PlacementsPage() {
    return (
        <section className="h-screen flex gap-3 overflow-hidden">
            <div className="flex-1 flex flex-col px-2 min-w-0">
 
 
                <div className="shrink-0">
                    <h1 className="text-[28px] font-medium text-[#282828] mb-1">
                        Placements
                    </h1>
 
                    <p className="text-[18px] font-normal text-[#282828]">
                        Monitor, Guide, and Support Student Placements Seamlessly.
                    </p>
 
                    <PlacementFilters />
                </div>
 
 
                <div className="flex-1 overflow-y-auto pr-2 pb-4 mt-2">
                    <PlacementList />
                </div>
            </div>
            <div className="w-75 shrink-0 flex flex-col gap-2 sticky top-0 h-screen">
                <CourseScheduleCard isVisibile={false} />
                <WorkWeekCalendar />            
                <div className="w-full h-[320px] overflow-y-auto pb-4">
                    <Announcements />
                </div>
            </div>
        </section>
    );
}
 
 