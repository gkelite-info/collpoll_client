import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarRight from "./right/page";
import CalendarLeft from "./left/page";


export default function CalendarPage() {
    return (
        <>
            <div className="bg-red-00 p-2 flex flex-col lg:pb-5">
                <div className="flex justify-between items-center bg-indigo-00">
                    <div className="flex flex-col w-[50%] h-[100%] bg-green-00">
                        <h1 className="text-[#282828] font-bold text-2xl mb-1">Calendar</h1>
                        <p className="text-[#282828] text-sm">Stay Organized and Keep Track of Your Weekly Schedule with Ease</p>
                    </div>
                    <div className="flex justify-end w-[32%] bg-yellow-00">
                        <CourseScheduleCard
                            style="w-[320px]"
                        />
                    </div>
                </div>
                <div className="mt-5 gap-4 bg-green-00 flex justify-between">
                    <div className="w-[459px] bg-pink-00">
                        <CalendarLeft />
                    </div>
                    <div className="w-[647px] bg-indigo-00">
                        <CalendarRight />
                    </div>
                </div>
            </div>
        </>
    )
}